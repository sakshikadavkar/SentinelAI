import { useState } from "react";
import { useForm } from "react-hook-form";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { loginUser } from "../../../services/authService";
import { useAuth } from "../../../context/AuthContext";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError("");

      const response = await loginUser({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });

      // Save authentication state
      login(response);

      // Redirect to dashboard
      navigate("/");
    } catch (error) {
      console.error("Login Error:", error);

      setServerError(
        error.response?.data?.message ||
          "Unable to login. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* ================= LEFT SIDE ================= */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20 bg-gradient-to-br from-cyan-600 via-slate-900 to-slate-950">
        <Shield size={70} className="text-cyan-300 mb-8" />

        <h1 className="text-6xl font-bold text-white">
          Sentinel<span className="text-cyan-400">AI</span>
        </h1>

        <p className="text-slate-300 text-xl mt-8 leading-9 max-w-xl">
          AI-Powered Cybersecurity Incident Response Platform
        </p>

        <div className="mt-12 space-y-5 text-slate-200">
          <p>✔ AI Threat Detection</p>
          <p>✔ Incident Response Automation</p>
          <p>✔ Threat Intelligence</p>
          <p>✔ Real-Time Security Monitoring</p>
        </div>
      </div>

      {/* ================= RIGHT SIDE ================= */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome Back
          </h2>

          <p className="text-slate-400 mb-8">
            Sign in to SentinelAI
          </p>

          {/* ================= SERVER ERROR ================= */}
          {serverError && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
              {serverError}
            </div>
          )}

          {/* ================= LOGIN FORM ================= */}
          <form
            className="space-y-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="block text-slate-300 mb-2"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@sentinel.ai"
                disabled={loading}
                className="w-full rounded-xl bg-slate-800 border border-slate-700 p-4 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:opacity-60"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Please enter a valid email address",
                  },
                })}
              />

              {errors.email && (
                <p className="text-red-400 text-sm mt-2">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="block text-slate-300 mb-2"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  disabled={loading}
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 p-4 pr-12 text-white placeholder-slate-500 outline-none transition focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 disabled:opacity-60"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />

                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition disabled:opacity-50"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-400 text-sm mt-2">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-xl py-4 font-bold text-black"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* ================= REGISTER ================= */}
          <p className="text-center text-slate-400 mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-cyan-400 hover:text-cyan-300 hover:underline transition"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}