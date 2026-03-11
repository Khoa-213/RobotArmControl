// File: lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/robot.dart';

class ApiService {
  // Thay thế bằng IP LAN máy bạn (vd: 192.168.1.15:8080) nếu test trên điện thoại thật
  // Dùng 10.0.2.2:8080 nếu test trên máy ảo Android
  static const String baseUrl = 'http://10.0.2.2:8080/api'; 

  // Hàm lấy danh sách Robot (Tương ứng với GET /api/robots bên Spring Boot)
  Future<List<Robot>> fetchRobots() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/robots'));

      if (response.statusCode == 200) {
        // Nếu Backend trả về thành công (Mã 200)
        List<dynamic> body = json.decode(response.body);
        List<Robot> robots = body.map((dynamic item) => Robot.fromJson(item)).toList();
        return robots;
      } else {
        throw Exception('Failed to load robots. Status Code: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Không thể kết nối đến Backend: $e');
    }
  }
}