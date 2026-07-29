import React from "react";
import { Shield, Lock, User } from "lucide-react";

export default function Login({
  username,
  password,
  setUsername,
  setPassword,
  onLogin,
  error,
  loading,
}) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 sm:p-8">

        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-600 p-3 rounded-lg mb-3">
            <Shield className="text-white" size={28} />
          </div>
          <h1 className="text-xl font-bold text-blue-700">Gold Cobra</h1>
          <p className="text-sm text-gray-500">Road Infrastructure Management</p>
        </div>

        <form onSubmit={onLogin} className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border rounded-lg pl-10 pr-3 py-2.5"
                placeholder="Enter username"
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg pl-10 pr-3 py-2.5"
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>
    </div>
  );
}
