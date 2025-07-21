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
      // Step 1: Get base URL by email
      const baseUrl = await api.getBaseUrlByEmail({ email });
      console.log("Base URL fetched:", baseUrl);

      // Step 2: Login with email & password to authenticate
      const token = await api.loginWithPassword({ email, password });
      console.log("Logged in with token:", token);

      // Save token and base url state for API calls
      api.initializeAuthToken();
      api.initializeApiBase();

      // Redirect or reload app after successful login
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <header className="w-full bg-white py-4 shadow text-center font-semibold text-lg">
        Dots and Dashes Technology Services
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="password"
                className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition disabled:opacity-60"
            >
              {loading ? "Connecting..." : "Continue"}
            </button>
          </form>
        </div>
      </main>

      <footer className="text-sm text-center text-gray-600 py-6 px-4">
        <div className="mb-1">
          <img src="/footer-icon.png" alt="Logo" className="inline h-4 mr-2" />
          Golfutar, Bansbari Road, Kathmandu.
        </div>
        <div>Dots & Dashes Technology Services</div>
      </footer>
    </div>
  );
};

export default Login;
