import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/area.dart';
import '../models/device.dart';
import '../models/factory.dart';
import '../models/hub.dart';
import 'session_service.dart';

class ApiAuthException implements Exception {
  final String message;

  ApiAuthException(this.message);

  @override
  String toString() => message;
}

class ApiService {
  // Can be provided at build time: --dart-define=API_BASE_URL=https://.../api
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://robot-control-system-rmbw.onrender.com/api',
  );

  static const String _bootAccessToken = String.fromEnvironment(
    'API_ACCESS_TOKEN',
    defaultValue: '',
  );
  static String _accessToken = _bootAccessToken;
  static const Duration _requestTimeout = Duration(seconds: 20);

  bool get hasToken => _accessToken.isNotEmpty;
  String get accessToken => _accessToken;

  static void restoreAccessToken(String token) {
    _accessToken = token.trim();
  }

  static void clearAccessToken() {
    _accessToken = '';
  }

  void setAccessToken(String token) {
    _accessToken = token.trim();
  }

  String _extractApiMessage(String body) {
    try {
      final dynamic decoded = json.decode(body);
      if (decoded is Map<String, dynamic>) {
        final dynamic message = decoded['message'] ?? decoded['error'];
        if (message != null) {
          return message.toString();
        }
      }
    } catch (_) {
      // Ignore parse failures and return raw body.
    }
    return body;
  }

  Future<void> login({
    required String username,
    required String password,
  }) async {
    final uri = Uri.parse('$baseUrl/auth/login');
    final response = await http
        .post(
          uri,
          headers: const {'Content-Type': 'application/json', 'accept': '*/*'},
          body: json.encode({'username': username, 'password': password}),
        )
        .timeout(_requestTimeout);

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiAuthException(
        'Login failed (${response.statusCode}): ${_extractApiMessage(response.body)}',
      );
    }

    try {
      final dynamic decoded = json.decode(response.body);
      if (decoded is! Map<String, dynamic>) {
        throw ApiAuthException('Invalid login response format');
      }

      final dynamic data = decoded['data'];
      if (data is! Map<String, dynamic>) {
        throw ApiAuthException('Token payload not found in response');
      }

      final String? token = data['accessToken']?.toString();
      if (token == null || token.isEmpty) {
        throw ApiAuthException('accessToken not found in response');
      }

      setAccessToken(token);
      await SessionService.persistSession(token);
    } on ApiAuthException {
      rethrow;
    } on TimeoutException {
      throw ApiAuthException(
        'Login timed out after ${_requestTimeout.inSeconds}s. The backend may be sleeping or unreachable.',
      );
    } catch (e) {
      throw ApiAuthException('Unable to connect to backend: $e');
    }
  }

  Map<String, String> _authorizedHeaders() {
    if (_accessToken.isEmpty) {
      throw ApiAuthException('Sign in is required to access this resource');
    }

    return {'accept': '*/*', 'Authorization': 'Bearer $_accessToken'};
  }

  List<dynamic> _extractItemsFromResponse(String body) {
    final dynamic decoded = json.decode(body);

    if (decoded is List) {
      return decoded;
    }

    if (decoded is Map<String, dynamic>) {
      final dynamic nested = decoded['data'] ?? decoded['items'] ?? decoded['results'];
      if (nested is List) {
        return nested;
      }
    }

    throw Exception('Invalid response format');
  }

  Future<List<T>> _fetchList<T>(
    String endpoint,
    T Function(Map<String, dynamic>) fromJson,
  ) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl$endpoint'),
        headers: _authorizedHeaders(),
      ).timeout(_requestTimeout);

      if (response.statusCode == 401 || response.statusCode == 403) {
        await SessionService.clearSession();
        throw ApiAuthException(
          'Token is invalid or expired (${response.statusCode}): ${_extractApiMessage(response.body)}',
        );
      }

      if (response.statusCode != 200) {
        throw Exception(
          'Server error (${response.statusCode}): ${_extractApiMessage(response.body)}',
        );
      }

      final items = _extractItemsFromResponse(response.body);
        await SessionService.touchSession();
      return items
          .whereType<Map<String, dynamic>>()
          .map(fromJson)
          .toList();
    } on ApiAuthException {
      rethrow;
    } on TimeoutException {
      throw Exception(
        'Request timed out after ${_requestTimeout.inSeconds}s. The backend may be sleeping or unreachable.',
      );
    } catch (e) {
      throw Exception('Unable to connect to backend: $e');
    }
  }

  Future<List<Factory>> fetchFactories() async {
    return _fetchList('/factories/all', Factory.fromJson);
  }

  Future<List<Area>> fetchAreasByFactory(String factoryId) {
    return _fetchList('/factories/$factoryId/areas', Area.fromJson);
  }

  Future<List<Hub>> fetchHubsByArea(String areaId) {
    return _fetchList('/areas/$areaId/hubs', Hub.fromJson);
  }

  Future<List<Device>> fetchDevicesByHub(String hubId) {
    return _fetchList('/hubs/$hubId/devices', Device.fromJson);
  }
}
