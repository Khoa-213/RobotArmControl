// File: lib/main.dart
import 'package:flutter/material.dart';
import 'screens/main_screen.dart'; // Chỉ cần gọi MainScreen vào đây


void main() => runApp(const RobotControlApp());

class RobotControlApp extends StatelessWidget {
  const RobotControlApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primaryColor: const Color(0xFF0091FF)),
      home: const MainScreen(),
    );
  }
}