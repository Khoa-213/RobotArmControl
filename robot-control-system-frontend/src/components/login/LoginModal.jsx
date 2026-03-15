import React, { useEffect, useState } from "react";
import { authApi } from "../../api/authApi";
import { getDefaultAdminPath } from "../../utils/auth";

function LoginModal({ isOpen, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    try {
      const u = username.trim();
      const p = password.trim();

      if (!u && !p) {
        setError("Bạn chưa nhập username và password.");
        return;
      }
      if (!u) {
        setError("Bạn chưa nhập username.");
        return;
      }
      if (!p) {
        setError("Bạn chưa nhập password.");
        return;
      }

      setLoading(true);
      setError("");

      const authData = await authApi.login({
        username: u,
        password: p,
      });

      window.location.href = getDefaultAdminPath(authData?.role);
    } catch (error) {
      console.error("Login failed:", error);

      const status = error?.response?.status;
      const apiCode = error?.response?.data?.code || error?.code;
      const apiMessage = error?.response?.data?.message || error?.message;

      if (status === 401 || status === 400) {
        setError("Invalid username or password.");
      } else if (
        apiCode === "INTERNAL_ERROR" &&
        String(apiMessage || "").toLowerCase().includes("unexpected server error")
      ) {
        setError("Invalid username or password.");
      } else {
        setError(error?.response?.data?.message || error?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white p-8 rounded-xl w-[400px] shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-black text-center w-full">
          Login
        </h2>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Username"
          className="w-full border p-3 mb-4 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Sign in"}
        </button>

        <button
          onClick={onClose}
          className="mt-4 text-gray-500 text-sm text-center w-full"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default LoginModal;