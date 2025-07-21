import React, { useState } from "react";
import { Mail, Lock } from "lucide-react";
import api from "../api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.getBaseUrlByEmail({ email });
      await api.loginWithPassword({ email, password });

      api.initializeAuthToken();
      api.initializeApiBase();

      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 flex flex-col justify-between">
      {/* Header */}
      <header className="w-full bg-white py-4 shadow">
        <div className="flex gap-10 items-center">
          <img src="/logo.png" alt="Logo" className="h-12" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-6">
            <img src="/logo.png" alt="Logo" className="h-12 mx-auto mb-2" />
            <h2 className="text-2xl font-bold text-gray-800">
              Login to Dots and Dashes POS
            </h2>
          </div>

          {error && (
            <div className="text-red-600 text-sm mb-4 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-lg hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connecting..." : "Continue"}
            </button>
          </form>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="w-full bg-white border-t border-gray-300 py-4 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-2 md:mb-0">
              <img src="/logo.png" alt="Logo" className="h-4" />
              <span className="text-gray-600 text-sm">
                Golfutar, Bansbari Road, Kathmandu
              </span>
            </div>
            <div className="text-gray-600 text-sm font-medium">
              © Dots & Dashes Technology Services
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
