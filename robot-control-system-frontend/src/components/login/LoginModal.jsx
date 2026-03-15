import React, { useState } from "react";
import { authApi } from "../../api/authApi";
import { getDefaultAdminPath } from "../../utils/auth";

function LoginModal({ isOpen, onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);

      const authData = await authApi.login({
        username,
        password,
      });

      console.log("LOGIN SUCCESS:", authData);

      globalThis.location.href = getDefaultAdminPath(authData?.role);
    } catch (error) {
      console.error("Login failed:", error);
      setError(error?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !loading) {
      handleLogin();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-black text-white p-8">
          <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="text-gray-300">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-black mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition bg-white text-black"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-black mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none transition bg-white text-black"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-6 bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition font-semibold text-lg"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="mt-3 w-full text-gray-500 hover:text-gray-700 text-sm font-medium transition py-2"
          >
            Close
          </button>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            Need help? <button type="button" className="text-black font-semibold hover:underline">Contact support</button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default LoginModal;