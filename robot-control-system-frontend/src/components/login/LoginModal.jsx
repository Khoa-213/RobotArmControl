import React, { useState } from "react";
import { authApi } from "../../api/authApi";

function LoginModal({ isOpen, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async () => {
    try {
      setLoading(true);

      const authData = await authApi.login({
        username,
        password,
      });

      console.log("LOGIN SUCCESS:", authData);

      window.location.href = "/admin/dashboard";
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white p-8 rounded-xl w-[400px] shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-black text-center w-full">
          Login
        </h2>

        <input
          type="text"
          placeholder="Username"
          className="w-full border p-3 mb-4 rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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