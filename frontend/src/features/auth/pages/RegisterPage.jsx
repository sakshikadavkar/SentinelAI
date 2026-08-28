import { useState } from "react";
import { useForm } from "react-hook-form";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../../services/authService";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError("");

      const response = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      alert(response.message);

      navigate("/login");
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* Left Side */}
      <div className="hidden lg:flex w-1/2 flex-col justify-center px-20 bg-gradient-to-br from-cyan-600 via-slate-900 to-slate-950">
        <Shield size={70} className="text-cyan-300 mb-8" />

        <h1 className="text-6xl font-bold text-white">
          Sentinel<span className="text-cyan-400">AI</span>
        </h1>

        <p className="text-slate-300 text-xl mt-8 leading-9">
          Join the AI-powered cybersecurity platform built for modern
          Security Operations Centers.
        </p>

        <div className="mt-12 space-y-5 text-slate-200">
          <p>✔ Real-Time Threat Detection</p>
          <p>✔ AI Incident Analysis</p>
          <p>✔ Secure Authentication</p>
          <p>✔ Enterprise Dashboard</p>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-10">

          <h2 className="text-4xl font-bold text-white mb-2">
            Create Account
          </h2>

          <p className="text-slate-400 mb-8">
            Register for SentinelAI
          </p>

          {serverError && (
            <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              {serverError}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >

            {/* Full Name */}
            <div>
              <label className="text-slate-300">
                Full Name
              </label>

              <input
                type="text"
                placeholder="John Doe"
                className="mt-2 w-full rounded-xl bg-slate-800 border border-slate-700 p-4 text-white outline-none focus:border-cyan-400"
                {...register("name", {
                  required: "Name is required",
                })}
              />

              {errors.name && (
                <p className="text-red-400 text-sm mt-2">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="text-slate-300">
                Email
              </label>

              <input
                type="email"
                placeholder="admin@sentinel.ai"
                className="mt-2 w-full rounded-xl bg-slate-800 border border-slate-700 p-4 text-white outline-none focus:border-cyan-400"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email",
                  },
                })}
              />

              {errors.email && (
                <p className="text-red-400 text-sm mt-2">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-slate-300">
                Password
              </label>

              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 p-4 pr-12 text-white outline-none focus:border-cyan-400"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Minimum 6 characters",
                    },
                  })}
                />

                <button
                  type="button"
                  className="absolute right-4 top-4 text-slate-400 hover:text-cyan-400"
                  onClick={() => setShowPassword(!showPassword)}
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

            {/* Confirm Password */}
            <div>
              <label className="text-slate-300">
                Confirm Password
              </label>

              <div className="relative mt-2">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-800 border border-slate-700 p-4 pr-12 text-white outline-none focus:border-cyan-400"
                  {...register("confirmPassword", {
                    required: "Confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                />

                <button
                  type="button"
                  className="absolute right-4 top-4 text-slate-400 hover:text-cyan-400"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-2">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-xl py-4 font-bold text-black"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>

          <p className="text-center text-slate-400 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-cyan-400 hover:underline"
            >
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}