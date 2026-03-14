import 'dart:convert';

import 'package:http/http.dart' as http;

import '../models/factory.dart';

class ApiAuthException implements Exception {
  final String message;

  ApiAuthException(this.message);

  @override
  String toString() => message;
}

class ApiService {
  // Co the truyen URL luc build: --dart-define=API_BASE_URL=https://.../api
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://robot-control-system-rmbw.onrender.com/api',
  );

  static const String _bootAccessToken = String.fromEnvironment(
    'API_ACCESS_TOKEN',
    defaultValue: '',
  );
  static String _accessToken = _bootAccessToken;

  bool get hasToken => _accessToken.isNotEmpty;

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
    final response = await http.post(
      uri,
      headers: const {'Content-Type': 'application/json', 'accept': '*/*'},
      body: json.encode({'username': username, 'password': password}),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiAuthException(
        'Dang nhap that bai (${response.statusCode}): ${_extractApiMessage(response.body)}',
      );
    }

    final dynamic decoded = json.decode(response.body);
    if (decoded is! Map<String, dynamic>) {
      throw ApiAuthException('Response login khong hop le');
    }

    final dynamic data = decoded['data'];
    if (data is! Map<String, dynamic>) {
      throw ApiAuthException('Khong tim thay data token');
    }

    final String? token = data['accessToken']?.toString();
    if (token == null || token.isEmpty) {
      throw ApiAuthException('Khong tim thay accessToken');
    }

    setAccessToken(token);
  }

  Map<String, String> _authorizedHeaders() {
    if (_accessToken.isEmpty) {
      throw ApiAuthException('Can dang nhap de lay access token');
    }

    return {'accept': '*/*', 'Authorization': 'Bearer $_accessToken'};
  }

  Future<List<Factory>> fetchFactories() async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/factories/all'),
        headers: _authorizedHeaders(),
      );

      if (response.statusCode == 401 || response.statusCode == 403) {
        throw ApiAuthException(
          'Token khong hop le hoac het han (${response.statusCode}): ${_extractApiMessage(response.body)}',
        );
      }

      if (response.statusCode == 200) {
        final dynamic decoded = json.decode(response.body);

        // Ho tro backend tra ve list truc tiep hoac object boc ngoai list.
        final List<dynamic> items;
        if (decoded is List) {
          items = decoded;
        } else if (decoded is Map<String, dynamic>) {
          final dynamic nested =
              decoded['data'] ?? decoded['items'] ?? decoded['results'];
          if (nested is List) {
            items = nested;
          } else {
            throw Exception('Format response khong hop le');
          }
        } else {
          throw Exception('Format response khong hop le');
        }

        return items
            .whereType<Map<String, dynamic>>()
            .map(Factory.fromJson)
            .toList();
      } else {
        throw Exception(
          'Loi server (${response.statusCode}): ${_extractApiMessage(response.body)}',
        );
      }
    } on ApiAuthException {
      rethrow;
    } catch (e) {
      throw Exception('Không thể kết nối Backend: $e');
    }
  }
}
