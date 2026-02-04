package com.example.robotcontrolsystembackend.domain.enumtype;

public enum RobotType {
    ARTICULATED,      // Robot khớp nối (6 trục)
    SCARA,            // Robot SCARA
    DELTA,            // Robot Delta
    CARTESIAN,        // Robot Cartesian (tọa độ Đề-các)
    CYLINDRICAL,      // Robot hình trụ
    POLAR,            // Robot cực
    COLLABORATIVE,    // Robot cộng tác (Cobot)
    MOBILE,           // Robot di động
    HUMANOID          // Robot hình người
}
