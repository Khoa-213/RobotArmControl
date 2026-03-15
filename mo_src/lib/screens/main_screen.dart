// lib/screens/main_screen.dart
import 'package:flutter/material.dart';

import '../constants/app_colors.dart';
import 'factory_list_screen.dart';
import 'control_screen.dart';
import 'push_messages_screen.dart';

class MainScreen extends StatefulWidget {
  final int initialIndex;
  const MainScreen({super.key, this.initialIndex = 0});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  late int _selectedIndex;

  @override
  void initState() {
    super.initState();
    _selectedIndex = widget.initialIndex;
  }

  final List<Widget> _pages = [
    const Center(child: Text('Robot Dashboard', style: TextStyle(fontWeight: FontWeight.w700))),
    const Center(child: Text('Tasks', style: TextStyle(fontWeight: FontWeight.w700))),
    const FactoryListScreen(),
    const ControlScreen(),
    const PushMessagesScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_selectedIndex],
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppColors.line)),
        ),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          onTap: (i) => setState(() => _selectedIndex = i),
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.smart_toy), label: 'Robots'),
            BottomNavigationBarItem(icon: Icon(Icons.list_alt), label: 'Tasks'),
            BottomNavigationBarItem(icon: Icon(Icons.factory_outlined), label: 'Factory'),
            BottomNavigationBarItem(icon: Icon(Icons.videogame_asset), label: 'Control'),
            BottomNavigationBarItem(icon: Icon(Icons.notifications), label: 'Msg'),
          ],
        ),
      ),
    );
  }
}