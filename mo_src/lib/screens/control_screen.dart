import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_joystick/flutter_joystick.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../constants/app_navigation.dart';
import '../constants/app_colors.dart';
import '../constants/app_spacing.dart';
import '../services/api_service.dart';
import '../services/session_service.dart';
import '../widgets/app_shell.dart';
import 'main_screen.dart';

class ControlScreen extends StatelessWidget {
  const ControlScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const RobotControlPage();
  }
}

class RobotControlPage extends StatefulWidget {
  const RobotControlPage({super.key});

  @override
  State<RobotControlPage> createState() => _RobotControlPageState();
}

class _RobotControlPageState extends State<RobotControlPage> {
  static const Duration _throttleInterval = Duration(milliseconds: 80);
  static const Duration _controlTickInterval = Duration(milliseconds: 16);
  static const List<double> _jointMin = [-175, -45, -60, -90, -90, -90];
  static const List<double> _jointMax = [175, 45, 60, 90, 90, 90];
  static const double _joystickSpeedDegPerSec = 110;
  static const double _zeroSnapEpsilonDeg = 0.0001;

  final ApiService _api = ApiService();

  final List<double> _anglesDeg = List<double>.filled(6, 0.0);
  final List<double> _joystickInput = List<double>.filled(6, 0.0);

  int? _selectedDeviceId;
  String _selectedDeviceName = '';
  bool _loadingSelectedDevice = true;

  Timer? _controlTickTimer;
  Timer? _throttleTimer;
  DateTime _lastAnglesDispatchAt = DateTime.fromMillisecondsSinceEpoch(0);
  bool _pendingAnglesDispatch = false;
  bool _postingAngles = false;

  bool _grabActive = false;
  bool _sendingGrabCommand = false;
  int _activeJointIndex = 0;
  bool _focusMode = false;

  int _sentCount = 0;
  String _networkState = 'Idle';
  WebSocketChannel? _wsChannel;
  StreamSubscription? _wsSubscription;
  Timer? _wsReconnectTimer;
  bool _wsConnected = false;
  bool _wsConnecting = false;

  @override
  void initState() {
    super.initState();
    _loadSelectedDevice();
    _ensureWebSocketConnected();
  }

  Future<void> _loadSelectedDevice() async {
    final selected = await SessionService.getControlDevice();
    if (!mounted) {
      return;
    }

    setState(() {
      _selectedDeviceId = selected?.deviceId;
      _selectedDeviceName = selected?.deviceName ?? '';
      _loadingSelectedDevice = false;
      _networkState = _selectedDeviceId == null
          ? 'Device not selected'
          : 'Device #$_selectedDeviceId ready';
    });
  }

  @override
  void dispose() {
    _controlTickTimer?.cancel();
    _throttleTimer?.cancel();
    _wsReconnectTimer?.cancel();
    _closeWebSocket();
    SystemChrome.setPreferredOrientations(const [
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);
    super.dispose();
  }

  Future<void> _rotateToLandscape() async {
    await SystemChrome.setPreferredOrientations(const [
      DeviceOrientation.landscapeLeft,
      DeviceOrientation.landscapeRight,
    ]);

    if (!mounted) {
      return;
    }

    setState(() {
      _focusMode = true;
    });
  }

  Future<void> _rotateBackToPortrait() async {
    await SystemChrome.setPreferredOrientations(const [
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    if (!mounted) {
      return;
    }

    setState(() {
      _focusMode = false;
    });
  }

  Uri _buildRobotControlWsUri() {
    final apiUri = Uri.parse(ApiService.baseUrl);
    final wsScheme = apiUri.scheme == 'https' ? 'wss' : 'ws';
    return apiUri.replace(
      scheme: wsScheme,
      path: '/ws/robot-control',
      query: null,
    );
  }

  void _ensureWebSocketConnected() {
    if (_wsConnected || _wsConnecting) {
      return;
    }
    _connectWebSocket();
  }

  Future<void> _connectWebSocket() async {
    if (_wsConnected || _wsConnecting) {
      return;
    }

    _wsConnecting = true;
    try {
      final channel = WebSocketChannel.connect(_buildRobotControlWsUri());
      _wsChannel = channel;
      _wsSubscription = channel.stream.listen(
        (event) {
          // Keep stream consumed; backend broadcasts control payloads.
        },
        onError: (_) {
          _markWebSocketDisconnected();
          _scheduleWebSocketReconnect();
        },
        onDone: () {
          _markWebSocketDisconnected();
          _scheduleWebSocketReconnect();
        },
        cancelOnError: true,
      );

      if (mounted) {
        setState(() {
          _wsConnected = true;
        });
      } else {
        _wsConnected = true;
      }
    } catch (_) {
      _markWebSocketDisconnected();
      _scheduleWebSocketReconnect();
    } finally {
      _wsConnecting = false;
    }
  }

  void _markWebSocketDisconnected() {
    _wsConnected = false;
    _wsConnecting = false;
    _wsSubscription?.cancel();
    _wsSubscription = null;
    _wsChannel = null;
    if (mounted) {
      setState(() {});
    }
  }

  void _scheduleWebSocketReconnect() {
    _wsReconnectTimer?.cancel();
    _wsReconnectTimer = Timer(const Duration(seconds: 2), () {
      _ensureWebSocketConnected();
    });
  }

  void _closeWebSocket() {
    _wsReconnectTimer?.cancel();
    _wsReconnectTimer = null;
    _wsSubscription?.cancel();
    _wsSubscription = null;
    _wsChannel?.sink.close();
    _wsChannel = null;
    _wsConnected = false;
    _wsConnecting = false;
  }

  bool _sendViaWebSocket(Map<String, dynamic> payload) {
    final channel = _wsChannel;
    if (channel == null || !_wsConnected) {
      _ensureWebSocketConnected();
      return false;
    }

    try {
      channel.sink.add(json.encode(payload));
      return true;
    } catch (_) {
      _markWebSocketDisconnected();
      _scheduleWebSocketReconnect();
      return false;
    }
  }

  void _openDevicesTab() {
    Navigator.of(context).pushAndRemoveUntil(
      appRoute(const MainScreen(initialIndex: 0)),
      (route) => false,
    );
  }

  void _onJoystickChanged(int jointIndex, double value) {
    setState(() {
      _joystickInput[jointIndex] = value;
    });
    _updateControlLoopState();
  }

  void _onJoystickReleased(int jointIndex) {
    setState(() {
      _joystickInput[jointIndex] = 0;
    });
    _updateControlLoopState();
  }

  void _updateControlLoopState() {
    final hasInput = _joystickInput.any((value) => value.abs() > 0.001);
    if (hasInput) {
      _controlTickTimer ??= Timer.periodic(_controlTickInterval, (_) {
        _advanceJointAnglesByJoystick();
      });
      return;
    }

    _controlTickTimer?.cancel();
    _controlTickTimer = null;
  }

  void _advanceJointAnglesByJoystick() {
    bool changed = false;
    final dt = _controlTickInterval.inMilliseconds / 1000.0;

    for (int i = 0; i < _anglesDeg.length; i++) {
      final input = _joystickInput[i];
      if (input.abs() <= 0.001) {
        continue;
      }

      final next = _normalizeAngle(
        (_anglesDeg[i] + input * _joystickSpeedDegPerSec * dt).clamp(
          _jointMin[i],
          _jointMax[i],
        ),
      );

      if ((next - _anglesDeg[i]).abs() > 0.0001) {
        _anglesDeg[i] = next;
        changed = true;
      }
    }

    if (!changed) {
      return;
    }

    if (mounted) {
      setState(() {
        _networkState = _selectedDeviceId == null
            ? 'Device not selected'
            : 'Queued';
      });
    }

    _queueAngleDispatch();
  }

  void _queueAngleDispatch() {
    if (_selectedDeviceId == null) {
      return;
    }

    _pendingAnglesDispatch = true;

    if (_postingAngles) {
      return;
    }

    final now = DateTime.now();
    final elapsed = now.difference(_lastAnglesDispatchAt);
    if (elapsed >= _throttleInterval) {
      _sendAnglesNow();
      return;
    }

    if (_throttleTimer?.isActive ?? false) {
      return;
    }

    final wait = _throttleInterval - elapsed;
    _throttleTimer = Timer(wait, () {
      _throttleTimer = null;
      if (_pendingAnglesDispatch && !_postingAngles) {
        _sendAnglesNow();
      }
    });
  }

  Future<void> _sendAnglesNow() async {
    if (_postingAngles) {
      return;
    }

    _postingAngles = true;
    _pendingAnglesDispatch = false;
    _lastAnglesDispatchAt = DateTime.now();

    final payload = _anglesDeg.map(_normalizeAngle).toList(growable: false);
    setState(() {
      _networkState = 'Sending';
    });

    final sentViaWs = _sendViaWebSocket({
      'type': 'ai_angles',
      'deviceId': '$_selectedDeviceId',
      'angles': payload,
    });

    if (sentViaWs) {
      if (!mounted) {
        return;
      }
      setState(() {
        _sentCount += 1;
        _networkState = 'Synced (WS)';
      });
      _postingAngles = false;
      if (_pendingAnglesDispatch) {
        _queueAngleDispatch();
      }
      return;
    }

    try {
      await _api.postCameraAngles(
        deviceId: _selectedDeviceId!,
        anglesDeg: payload,
      );
      if (!mounted) {
        return;
      }
      setState(() {
        _sentCount += 1;
        _networkState = 'Synced (REST)';
      });
    } catch (e) {
      if (!mounted) {
        return;
      }
      setState(() {
        _networkState = 'Error: $e';
      });
    } finally {
      _postingAngles = false;
      if (_pendingAnglesDispatch) {
        _queueAngleDispatch();
      }
    }
  }

  Future<void> _toggleGrabber() async {
    if (_selectedDeviceId == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'Hãy chọn thiết bị ở tab Devices trước khi điều khiển.',
            ),
          ),
        );
      }
      return;
    }

    if (_sendingGrabCommand) {
      return;
    }

    final nextState = !_grabActive;
    final action = nextState ? 'grab' : 'release';
    setState(() {
      _sendingGrabCommand = true;
    });

    final sentViaWs = _sendViaWebSocket({
      'type': 'robot_command',
      'deviceId': '$_selectedDeviceId',
      'action': action,
    });

    if (sentViaWs) {
      if (!mounted) {
        return;
      }
      setState(() {
        _grabActive = nextState;
        _sendingGrabCommand = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Sent "$action" via WS to device #$_selectedDeviceId'),
        ),
      );
      return;
    }

    try {
      await _api.postCameraCommand(
        deviceId: _selectedDeviceId!,
        grabActive: nextState,
      );
      if (!mounted) {
        return;
      }
      setState(() {
        _grabActive = nextState;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Sent "$action" via REST to device #$_selectedDeviceId',
          ),
        ),
      );
    } catch (e) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Failed to send "$action" to device #$_selectedDeviceId: $e',
          ),
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _sendingGrabCommand = false;
        });
      }
    }
  }

  Future<void> _resetAllJoints() async {
    for (int i = 0; i < _anglesDeg.length; i++) {
      _anglesDeg[i] = 0;
      _joystickInput[i] = 0;
    }

    _updateControlLoopState();

    setState(() {
      _networkState = 'Queued (reset)';
    });

    _queueAngleDispatch();
  }

  double _normalizeAngle(double value) {
    if (value.abs() <= _zeroSnapEpsilonDeg) {
      return 0.0;
    }

    final rounded = (value * 10000).roundToDouble() / 10000.0;
    return rounded == -0.0 ? 0.0 : rounded;
  }

  @override
  Widget build(BuildContext context) {
    final isLandscapeBySensor =
        MediaQuery.of(context).orientation == Orientation.landscape;
    final useLandscapeLayout = _focusMode || isLandscapeBySensor;

    if (_focusMode) {
      return Scaffold(
        backgroundColor: AppColors.paper,
        body: SafeArea(
          child: Stack(
            children: [
              Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Color(0xFF101010), Color(0xFF191919)],
                  ),
                ),
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md,
                  ),
                  child: Column(
                    children: [
                      const SizedBox(height: AppSpacing.sm),
                      Align(
                        alignment: Alignment.centerRight,
                        child: OutlinedButton.icon(
                          onPressed: _rotateBackToPortrait,
                          icon: const Icon(Icons.screen_lock_portrait),
                          label: const Text('XOAY NGƯỢC LẠI'),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Expanded(
                        child: _buildControlContent(
                          context,
                          useLandscapeLayout: true,
                          showHeaderAndStatus: false,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              if (!_loadingSelectedDevice && _selectedDeviceId != null)
                Positioned(
                  right: AppSpacing.md,
                  bottom: AppSpacing.md,
                  child: ElevatedButton.icon(
                    onPressed: _sendingGrabCommand ? null : _toggleGrabber,
                    icon: Icon(
                      _grabActive
                          ? Icons.pan_tool_alt
                          : Icons.pan_tool_outlined,
                    ),
                    label: Text(_grabActive ? 'RELEASE' : 'GRAB'),
                    style: ElevatedButton.styleFrom(
                      minimumSize: const Size(140, 52),
                    ),
                  ),
                ),
            ],
          ),
        ),
      );
    }

    return AppShell(
      title: 'Robot Control',
      currentTabIndex: 2,
      actions: [
        IconButton(
          tooltip: _wsConnected ? 'WebSocket connected' : 'Reconnect WebSocket',
          onPressed: _ensureWebSocketConnected,
          icon: Icon(_wsConnected ? Icons.wifi : Icons.wifi_off),
        ),
        IconButton(
          tooltip: 'Reload selected device',
          onPressed: _loadSelectedDevice,
          icon: const Icon(Icons.sync),
        ),
      ],
      child: _buildControlContent(
        context,
        useLandscapeLayout: useLandscapeLayout,
        showHeaderAndStatus: true,
      ),
    );
  }

  Widget _buildControlContent(
    BuildContext context, {
    required bool useLandscapeLayout,
    required bool showHeaderAndStatus,
  }) {
    if (useLandscapeLayout) {
      return Column(
        children: [
          if (showHeaderAndStatus) ...[
            _headerCard(context),
            const SizedBox(height: AppSpacing.md),
            _orientationControlsCard(context, useLandscapeLayout),
            const SizedBox(height: AppSpacing.md),
          ],
          Expanded(
            child: _loadingSelectedDevice
                ? const Center(child: CircularProgressIndicator())
                : _selectedDeviceId == null
                ? _deviceRequiredCard(context)
                : _landscapeControlPanel(
                    context,
                    compact: !showHeaderAndStatus,
                  ),
          ),
        ],
      );
    }

    return ListView(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
      children: [
        if (showHeaderAndStatus) ...[
          _headerCard(context),
          const SizedBox(height: AppSpacing.md),
          _orientationControlsCard(context, useLandscapeLayout),
          const SizedBox(height: AppSpacing.md),
        ],
        if (_loadingSelectedDevice)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: AppSpacing.lg),
            child: Center(child: CircularProgressIndicator()),
          )
        else if (_selectedDeviceId == null)
          _deviceRequiredCard(context)
        else ...[
          _portraitControlPanel(context),
          const SizedBox(height: AppSpacing.md),
        ],
        const SizedBox(height: AppSpacing.md),
      ],
    );
  }

  Widget _orientationControlsCard(BuildContext context, bool isLandscape) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            Expanded(
              child: ElevatedButton.icon(
                onPressed: _rotateToLandscape,
                icon: const Icon(Icons.screen_rotation_alt),
                label: const Text('XOAY NGANG'),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _rotateBackToPortrait,
                icon: const Icon(Icons.screen_lock_portrait),
                label: const Text('XOAY NGƯỢC LẠI'),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Text(
              isLandscape ? 'Landscape' : 'Portrait',
              style: Theme.of(context).textTheme.labelLarge,
            ),
          ],
        ),
      ),
    );
  }

  Widget _landscapeControlPanel(BuildContext context, {bool compact = false}) {
    return Row(
      children: [
        Expanded(flex: 5, child: _jointSelectorPanel(context)),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          flex: 7,
          child: _activeJointControlPanel(
            context,
            showSecondaryControls: !compact,
          ),
        ),
      ],
    );
  }

  bool _isVerticalJoint(int jointIndex) {
    return jointIndex == 1 || jointIndex == 2;
  }

  JoystickMode _joystickModeForJoint(int jointIndex) {
    return _isVerticalJoint(jointIndex)
        ? JoystickMode.vertical
        : JoystickMode.horizontal;
  }

  String _joystickAxisLabel(int jointIndex) {
    return _isVerticalJoint(jointIndex) ? 'Vertical' : 'Horizontal';
  }

  Widget _portraitControlPanel(BuildContext context) {
    return Column(
      children: [
        _jointSelectorPanel(context),
        const SizedBox(height: AppSpacing.md),
        _activeJointControlPanel(context, showSecondaryControls: true),
      ],
    );
  }

  Widget _jointSelectorPanel(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Joint List',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: AppSpacing.sm),
            Expanded(
              child: ListView.separated(
                itemCount: 6,
                separatorBuilder: (context, index) =>
                    const SizedBox(height: AppSpacing.xs),
                itemBuilder: (context, index) {
                  final selected = index == _activeJointIndex;
                  return InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: () {
                      _onJoystickReleased(_activeJointIndex);
                      setState(() {
                        _activeJointIndex = index;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.sm,
                      ),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: selected ? AppColors.warning : AppColors.line,
                        ),
                        color: selected ? AppColors.mist : Colors.transparent,
                      ),
                      child: Row(
                        children: [
                          Text(
                            'J$index',
                            style: Theme.of(context).textTheme.titleSmall
                                ?.copyWith(fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Text('${_anglesDeg[index].toStringAsFixed(1)}°'),
                          const Spacer(),
                          Text(
                            '${_jointMin[index].toStringAsFixed(0)}..${_jointMax[index].toStringAsFixed(0)}',
                            style: Theme.of(context).textTheme.labelSmall,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _activeJointControlPanel(
    BuildContext context, {
    required bool showSecondaryControls,
  }) {
    final idx = _activeJointIndex;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'Active Joint: J$idx',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const Spacer(),
                Text(
                  '${_anglesDeg[idx].toStringAsFixed(1)}°',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    color: AppColors.warning,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Limit: ${_jointMin[idx].toStringAsFixed(0)}° .. ${_jointMax[idx].toStringAsFixed(0)}°',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            const SizedBox(height: AppSpacing.md),
            _AxisFlycamJoystick(
              mode: _joystickModeForJoint(idx),
              onChanged: (next) => _onJoystickChanged(idx, next),
              onEnded: () => _onJoystickReleased(idx),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              '${_joystickAxisLabel(idx)} joystick: ${_joystickInput[idx].toStringAsFixed(2)}',
              style: Theme.of(context).textTheme.bodySmall,
            ),
            if (showSecondaryControls) ...[
              const Spacer(),
              _gripperCard(context),
              const SizedBox(height: AppSpacing.sm),
              OutlinedButton.icon(
                onPressed: _resetAllJoints,
                icon: const Icon(Icons.restart_alt),
                label: const Text('RESET ALL JOINTS TO 0°'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _headerCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.line),
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF0F0F0F), Color(0xFF1C1C1C)],
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Row(
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: AppColors.mist,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.line),
              ),
              child: const Icon(Icons.precision_manufacturing, size: 20),
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '6-DOF Joint Controller',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'POST /api/camera/angles every 80ms (throttled)',
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    _selectedDeviceId == null
                        ? 'Device: Not selected'
                        : 'Device: #$_selectedDeviceId $_selectedDeviceName',
                    style: Theme.of(context).textTheme.labelMedium,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Status: $_networkState • WS: ${_wsConnected ? 'Connected' : 'Disconnected'} • Packets: $_sentCount',
                    style: Theme.of(context).textTheme.labelMedium?.copyWith(
                      color: AppColors.charcoal,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _deviceRequiredCard(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Chưa chọn thiết bị điều khiển',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Hãy sang tab Devices, chọn một device để điều khiển, rồi quay lại tab Control.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: AppSpacing.md),
            ElevatedButton.icon(
              onPressed: _openDevicesTab,
              icon: const Icon(Icons.devices_other),
              label: const Text('SANG TAB DEVICES'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _gripperCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.line),
        gradient: const LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [Color(0xFF161616), Color(0xFF202020)],
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Gripper',
              style: Theme.of(
                context,
              ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: AppSpacing.sm),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _sendingGrabCommand ? null : _toggleGrabber,
                icon: Icon(
                  _grabActive ? Icons.pan_tool_alt : Icons.pan_tool_outlined,
                ),
                label: Text(_grabActive ? 'RELEASE' : 'GRAB'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(56),
                  textStyle: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.8,
                  ),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              _grabActive
                  ? 'State: Active (holding object)'
                  : 'State: Inactive (released)',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ),
      ),
    );
  }
}

class _AxisFlycamJoystick extends StatelessWidget {
  final JoystickMode mode;
  final ValueChanged<double> onChanged;
  final VoidCallback onEnded;

  const _AxisFlycamJoystick({
    required this.mode,
    required this.onChanged,
    required this.onEnded,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 128,
      child: Center(
        child: Joystick(
          mode: mode,
          period: const Duration(milliseconds: 16),
          includeInitialAnimation: false,
          listener: (details) {
            final value = mode == JoystickMode.vertical
                ? -details.y
                : details.x;
            onChanged(value);
          },
          onStickDragEnd: onEnded,
          base: JoystickBase(
            mode: mode,
            size: 118,
            decoration: JoystickBaseDecoration(
              drawArrows: true,
              drawOuterCircle: true,
              outerCircleColor: AppColors.line,
              drawMiddleCircle: true,
              middleCircleColor: const Color(0xFF202020),
              drawInnerCircle: true,
              innerCircleColor: const Color(0xFF141414),
              boxShadowColor: Colors.black38,
            ),
          ),
          stick: JoystickStick(
            size: 42,
            decoration: JoystickStickDecoration(
              color: AppColors.warning,
              shadowColor: Colors.black45,
            ),
          ),
        ),
      ),
    );
  }
}
