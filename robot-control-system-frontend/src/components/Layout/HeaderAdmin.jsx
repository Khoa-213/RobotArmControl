import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { SettingOutlined, UserOutlined } from "@ant-design/icons";

export default function HeaderAdmin({
    user = { name: "Admin", avatarUrl: "" },
    onProfile,
    onSetting,
}) {
    const location = useLocation();

    const crumb = useMemo(() => {
        const path = location.pathname;
        if (path.startsWith("/admin/factories")) return "Factories";
        if (path.startsWith("/admin/areas")) return "Areas";
        if (path.startsWith("/admin/hubs")) return "Hubs";
        if (path.startsWith("/admin/devices")) return "Devices";
        if (path.startsWith("/admin/analytics")) return "Analytics";
        if (path.startsWith("/admin/dashboard")) return "Dashboard";
        return "Management";
    }, [location.pathname]);

    return (
        <div className="w-full flex items-center justify-between gap-4 min-w-0">
            <div className="min-w-0">
                <div className="text-sm font-semibold text-white">Robot Arm Admin</div>
                <div className="text-xs text-white/60 truncate">
                    Management <span className="mx-2 text-white/30">/</span> {crumb}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onSetting}
                    className="h-9 w-9 rounded-full grid place-items-center bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition"
                    aria-label="Settings"
                >
                    <SettingOutlined />
                </button>

                <button
                    type="button"
                    onClick={onProfile}
                    className="h-9 w-9 rounded-full grid place-items-center bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition overflow-hidden"
                    aria-label="User"
                    title={user?.name || "User"}
                >
                    {user?.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt={user?.name ? `${user.name} avatar` : "User avatar"}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <UserOutlined />
                    )}
                </button>
            </div>
        </div>
    );
}

