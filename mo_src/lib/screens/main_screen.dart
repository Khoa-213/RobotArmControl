// File: lib/screens/main_screen.dart
import 'package:flutter/material.dart';
import 'robot_list_screen.dart'; // Import tab danh sách robot
import 'push_messages_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  // Khai báo 5 màn hình tương ứng với 5 tab
  final List<Widget> _pages = const [
    RobotListScreen(), // Tab 0: Màn hình thật mình vừa code
    Center(child: Text("Tasks Screen")), // Tab 1
    Center(child: Text("Map Screen")), // Tab 2
    Center(child: Text("Control Screen")), // Tab 3
    PushMessagesScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8F9FA),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: const Icon(Icons.smart_toy, color: Colors.blue),
        title: const Text(
          "Robot Control System",
          style: TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ),
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.teal,
        type: BottomNavigationBarType.fixed, // Bắt buộc phải có khi >3 tab
        onTap: (index) => setState(() => _selectedIndex = index),
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.smart_toy), label: 'Robots'),
          BottomNavigationBarItem(icon: Icon(Icons.list_alt), label: 'Tasks'),
          BottomNavigationBarItem(icon: Icon(Icons.map), label: 'Map'),
          BottomNavigationBarItem(icon: Icon(Icons.videogame_asset), label: 'Control'),
          BottomNavigationBarItem(icon: Icon(Icons.notifications_active), label: 'Messages'),
        ],
      ),
    );
  }
}