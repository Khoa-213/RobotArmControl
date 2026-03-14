import 'package:flutter/material.dart';

import '../models/factory.dart';
import '../services/api_service.dart';
import 'api_login_screen.dart';
import 'hub_device_screen.dart';

Widget _buildNavigationItem(
  BuildContext context,
  String title,
  IconData icon,
  Widget nextScreen,
) {
  return ListTile(
    leading: Icon(icon, color: Colors.black),
    title: Text(title),
    onTap: () =>
        Navigator.push(context, MaterialPageRoute(builder: (_) => nextScreen)),
  );
}

// 1. Màn hình chọn Factory
class FactoryListScreen extends StatefulWidget {
  const FactoryListScreen({super.key});

  @override
  State<FactoryListScreen> createState() => _FactoryListScreenState();
}

class _FactoryListScreenState extends State<FactoryListScreen> {
  final ApiService _apiService = ApiService();
  late Future<List<Factory>> _factoriesFuture;

  @override
  void initState() {
    super.initState();
    _factoriesFuture = _apiService.fetchFactories();
  }

  void _reloadFactories() {
    setState(() {
      _factoriesFuture = _apiService.fetchFactories();
    });
  }

  Future<void> _openLoginScreenAndReload() async {
    final bool? isLoggedIn = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => const ApiLoginScreen()),
    );

    if (isLoggedIn == true) {
      _reloadFactories();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("SELECT FACTORY"),
        actions: [
          IconButton(
            tooltip: 'Dang nhap API',
            onPressed: _openLoginScreenAndReload,
            icon: const Icon(Icons.login),
          ),
        ],
      ),
      body: FutureBuilder<List<Factory>>(
        future: _factoriesFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            final isAuthError = snapshot.error is ApiAuthException;
            return Center(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'Khong tai duoc danh sach factory',
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 12),
                    Text('${snapshot.error}', textAlign: TextAlign.center),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: isAuthError
                          ? _openLoginScreenAndReload
                          : _reloadFactories,
                      child: Text(isAuthError ? 'Dang nhap' : 'Thu lai'),
                    ),
                  ],
                ),
              ),
            );
          }

          final factories = snapshot.data ?? [];
          if (factories.isEmpty) {
            return const Center(child: Text('Chua co factory nao'));
          }

          return RefreshIndicator(
            onRefresh: () async => _reloadFactories(),
            child: ListView.separated(
              itemCount: factories.length,
              separatorBuilder: (_, __) =>
                  const Divider(height: 1, color: Color(0xFFEAEAEA)),
              itemBuilder: (context, index) {
                final factory = factories[index];
                return ListTile(
                  leading: const Icon(Icons.domain, color: Colors.black),
                  title: Text(factory.name),
                  subtitle: Text('${factory.location} • ${factory.status}'),
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => AreaListScreen(factory: factory),
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

// 2. Màn hình chọn Area (bắt buộc chọn Factory trước)
class AreaListScreen extends StatelessWidget {
  final Factory factory;

  const AreaListScreen({super.key, required this.factory});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("AREAS - ${factory.name}")),
      body: ListView(
        children: [
          _buildNavigationItem(
            context,
            "Assembly Area",
            Icons.location_on,
            const HubDeviceScreen(),
          ),
        ],
      ),
    );
  }
}
