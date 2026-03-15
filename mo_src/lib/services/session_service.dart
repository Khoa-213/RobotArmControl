import 'package:shared_preferences/shared_preferences.dart';

import 'api_service.dart';

class SessionService {
  static const String _tokenKey = 'session_access_token';
  static const String _lastActiveEpochMsKey = 'session_last_active_epoch_ms';
  static const Duration _sessionTtl = Duration(days: 30);

  static Future<void> persistSession(String token) async {
    final prefs = await SharedPreferences.getInstance();
    final now = DateTime.now().millisecondsSinceEpoch;
    await prefs.setString(_tokenKey, token);
    await prefs.setInt(_lastActiveEpochMsKey, now);
  }

  static Future<void> touchSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    if (token == null || token.isEmpty) {
      return;
    }

    await prefs.setInt(
      _lastActiveEpochMsKey,
      DateTime.now().millisecondsSinceEpoch,
    );
  }

  static Future<void> clearSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_lastActiveEpochMsKey);
    ApiService.clearAccessToken();
  }

  static Future<bool> restoreSessionIfValid() async {
    return _restoreAndRefreshSession();
  }

  static Future<bool> refreshOrExpireSession() async {
    return _restoreAndRefreshSession();
  }

  static Future<bool> _restoreAndRefreshSession() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    final lastActiveEpochMs = prefs.getInt(_lastActiveEpochMsKey);

    if (token == null || token.isEmpty || lastActiveEpochMs == null) {
      return false;
    }

    final lastActive = DateTime.fromMillisecondsSinceEpoch(lastActiveEpochMs);
    final inactiveDuration = DateTime.now().difference(lastActive);

    if (inactiveDuration > _sessionTtl) {
      await clearSession();
      return false;
    }

    ApiService.restoreAccessToken(token);
    await touchSession();
    return true;
  }
}
