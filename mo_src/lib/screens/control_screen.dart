import 'package:flutter/material.dart';

class ControlScreen extends StatelessWidget {
  const ControlScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("REMOTE CONTROL")),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _btn(Icons.keyboard_arrow_up, "FORWARD (W)"),
            Row(mainAxisAlignment: MainAxisAlignment.center, children: [
              _btn(Icons.keyboard_arrow_left, "LEFT (A)"),
              const SizedBox(width: 40),
              _btn(Icons.keyboard_arrow_right, "RIGHT (D)"),
            ]),
            _btn(Icons.keyboard_arrow_down, "BACK (S)"),
            const SizedBox(height: 50),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.black, foregroundColor: Colors.white),
              onPressed: () => print("LOG: Action Grab recorded"), // Ghi log
              child: const Text("GRAB / RELEASE"),
            )
          ],
        ),
      ),
    );
  }

  Widget _btn(IconData icon, String label) {
    return IconButton(icon: Icon(icon, size: 60), onPressed: () => print("LOG: $label"));
  }
}