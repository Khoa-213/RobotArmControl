import 'package:flutter/material.dart';

import 'main_screen.dart';

class HubDeviceScreen extends StatelessWidget {
  const HubDeviceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('HUBS & DEVICES')),
      body: ListView(
        children: [
          const ListTile(
            title: Text(
              'HUB #01',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
          ListTile(
            leading: const Icon(
              Icons.precision_manufacturing,
              color: Colors.black,
            ),
            title: const Text('Robot Arm R-01'),
            subtitle: const Text('Status: Active'), // Trạng thái mặc định
            onTap: () {
              // Chuyển thẳng về MainScreen ở tab Control (index 3).
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(
                  builder: (_) => const MainScreen(initialIndex: 3),
                ),
                (route) => false,
              );
            },
          ),
        ],
      ),
    );
  }
}
