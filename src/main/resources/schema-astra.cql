-- ============================================
-- Astra DB Schema for Robot Telemetry
-- ============================================
-- Chạy script này trong Astra DB CQL Console
-- hoặc sử dụng cqlsh với Secure Connect Bundle

-- Tạo keyspace (thường đã được tạo khi setup Astra DB)
-- Nếu cần tạo manual:
-- CREATE KEYSPACE IF NOT EXISTS robot_telemetry
-- WITH replication = {'class': 'NetworkTopologyStrategy', 'your-region': 3};

USE robot_telemetry;

-- Tạo table cho telemetry data
-- Partition key: device_id (group by robot)
-- Clustering key: timestamp DESC (query mới nhất trước)
CREATE TABLE IF NOT EXISTS robot_telemetry (
                                               device_id bigint,
                                               timestamp timestamp,
                                               telemetry_id uuid,
                                               session_id bigint,
                                               user_id bigint,
                                               joint_angles text,           -- JSON array: [0.0, 15.5, -30.2, 45.0, 0.0, 10.0]
                                               target_angles text,          -- JSON array from AI camera
                                               joint_speeds text,           -- JSON array: degrees per second
                                               gripper_status text,         -- OPEN, CLOSED, MOVING
                                               gesture_detected text,       -- hand gesture name
                                               gesture_confidence double,   -- 0.0 to 1.0
                                               fingers_count int,           -- 0 to 5
                                               selected_joint int,          -- 0 to 5
                                               control_signal double,       -- -1.0 to 1.0
                                               battery_level double,        -- percentage
                                               temperature double,          -- celsius
                                               connection_latency_ms int,   -- milliseconds
                                               source text,                 -- AI_CAMERA, MANUAL, API
                                               error_codes text,
                                               raw_data text,               -- raw JSON for flexibility
                                               PRIMARY KEY ((device_id), timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC)
   AND default_time_to_live = 2592000  -- 30 days TTL
   AND gc_grace_seconds = 864000;      -- 10 days

-- Index cho query theo session (optional, dùng ALLOW FILTERING)
-- CREATE INDEX IF NOT EXISTS idx_session ON robot_telemetry (session_id);

-- ============================================
-- Sample Queries
-- ============================================

-- Lấy 100 telemetry mới nhất của device 1
-- SELECT * FROM robot_telemetry WHERE device_id = 1 LIMIT 100;

-- Lấy telemetry trong khoảng thời gian
-- SELECT * FROM robot_telemetry
-- WHERE device_id = 1
--   AND timestamp >= '2024-01-01 00:00:00'
--   AND timestamp <= '2024-01-02 00:00:00';

-- Đếm số record trong khoảng thời gian
-- SELECT COUNT(*) FROM robot_telemetry
-- WHERE device_id = 1
--   AND timestamp >= '2024-01-01 00:00:00'
--   AND timestamp <= '2024-01-02 00:00:00';


