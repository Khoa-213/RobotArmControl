// File: lib/screens/push_messages_screen.dart
import 'package:flutter/material.dart';

class PushMessagesScreen extends StatelessWidget {
  const PushMessagesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          "System Notifications",
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        
        // Tin nhắn 1: Trạng thái bình thường (Màu xanh lá)
        _buildMessageTile(
          icon: Icons.check_circle,
          color: Colors.green,
          title: "Task Completed",
          message: "Robot Arm Alpha successfully moved item to Warehouse A.",
          time: "10:30 AM",
        ),
        
        // Tin nhắn 2: Cảnh báo pin yếu (Màu cam)
        _buildMessageTile(
          icon: Icons.warning_amber_rounded,
          color: Colors.orange,
          title: "Low Battery Warning",
          message: "Robot Arm Beta battery is at 15%. Returning to charging station.",
          time: "09:45 AM",
        ),
        
        // Tin nhắn 3: Lỗi mất kết nối (Màu đỏ)
        _buildMessageTile(
          icon: Icons.error_outline,
          color: Colors.red,
          title: "Connection Lost",
          message: "Lost connection to Robot Arm Delta. System trying to reconnect...",
          time: "08:12 AM",
        ),
        
        // Tin nhắn 4: Thông báo hệ thống (Màu xanh dương)
        _buildMessageTile(
          icon: Icons.info_outline,
          color: Colors.blue,
          title: "System Update",
          message: "Admin Panel successfully synced with the local server.",
          time: "07:00 AM",
        ),
      ],
    );
  }

  // Widget dùng chung để vẽ từng khung tin nhắn
  Widget _buildMessageTile({
    required IconData icon,
    required Color color,
    required String title,
    required String message,
    required String time,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 1,
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.1),
          child: Icon(icon, color: color),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4.0),
          child: Text(message, style: const TextStyle(fontSize: 13, height: 1.4)),
        ),
        trailing: Text(time, style: const TextStyle(color: Colors.grey, fontSize: 11)),
        isThreeLine: true,
      ),
    );
  }
}