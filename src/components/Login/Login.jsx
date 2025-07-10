import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // handle login API logic here
    console.log({ email, password });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-between">
      <header className="w-full bg-white py-4 shadow text-center font-semibold text-lg">
        Korean Beauty Point
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <img src="/logo.png" alt="Logo" className="mx-auto mb-4 h-10" />
          <h2 className="text-lg font-medium mb-6">
            Login to Korean Beauty Point
          </h2>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="email"
                className="w-full pl-10 pr-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="jane@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-16 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-sm text-gray-600"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="text-right text-sm text-gray-600 hover:underline cursor-pointer">
              Forgot Password?
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-900 transition"
            >
              Login
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
