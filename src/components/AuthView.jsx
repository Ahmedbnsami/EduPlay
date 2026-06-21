import { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  LogIn,
  UserPlus,
} from "lucide-react";
import api from "../services/api";

export default function AuthView({ onAuthSuccess, onCancel }) {
  const [mode, setMode] = useState("signin"); // 'signin' or 'signup'
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation per README password policy and basic fields
    const validatePassword = (pwd) => {
      const errs = [];
      if (!pwd || pwd.length < 8)
        errs.push("Password must be at least 8 characters.");
      if (!/[A-Z]/.test(pwd))
        errs.push("Password must contain at least one uppercase letter.");
      if (!/[a-z]/.test(pwd))
        errs.push("Password must contain at least one lowercase letter.");
      if (!/[0-9]/.test(pwd))
        errs.push("Password must contain at least one number.");
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd))
        errs.push("Password must contain at least one special character.");
      return errs;
    };

    if (mode === "signup") {
      const errors = [];
      if (!username.trim()) errors.push("Please enter a username.");
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        errors.push("Please enter a valid email address.");

      const pwdErrs = validatePassword(password);
      if (pwdErrs.length) errors.push(...pwdErrs);
      if (password !== confirmPassword) errors.push("Passwords do not match.");

      if (errors.length) {
        setError(errors.join(" "));
        return;
      }
    } else {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Please enter a valid email address.");
        return;
      }
      if (!password) {
        setError("Please enter your password.");
        return;
      }
    }

    setLoading(true);

    try {
      let userData;
      if (mode === "signup") {
        userData = await api.auth.register(username, email, password);
        setSuccess("Account created successfully!");
      } else {
        userData = await api.auth.login(email, password);
        setSuccess("Signed in successfully!");
      }

      setTimeout(() => {
        onAuthSuccess(userData);
      }, 800);
    } catch (err) {
      setError(
        err.message || "Authentication failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (platform) => {
    setError("");
    setSuccess("");
    setLoading(true);
    // Social sign-in is disabled to prevent accidental creation
    // of real accounts during development and testing.
    setError(`Social sign-in (${platform}) is disabled in this build.`);
    setLoading(false);
  };

  return (
    <div id="auth-view" className="max-w-md w-full mx-auto animate-fade-in-up">
      {/* Top Banner or Welcome Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-text-main uppercase tracking-tight">
          {mode === "signin" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-text-muted mt-2 text-sm max-w-xs mx-auto leading-relaxed">
          {mode === "signin"
            ? "Sign in to access your saved history and premium game modes."
            : "Join EduPlay today to save your games and track your progress."}
        </p>
      </div>

      {/* Main card box container */}
      <div className="bg-surface-container comic-border comic-shadow-lg p-6 sm:p-8">
        {/* Toggle Mode Tabs */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
              setSuccess("");
            }}
            className={`py-2 text-sm font-black uppercase comic-border transition-all duration-150 cursor-pointer ${
              mode === "signin"
                ? "bg-primary text-white comic-shadow-sm translate-y-0"
                : "bg-surface text-text-muted hover:bg-outline-variant/20 hover:text-text-main"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
              setSuccess("");
            }}
            className={`py-2 text-sm font-black uppercase comic-border transition-all duration-150 cursor-pointer ${
              mode === "signup"
                ? "bg-primary text-white comic-shadow-sm translate-y-0"
                : "bg-surface text-text-muted hover:bg-outline-variant/20 hover:text-text-main"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 bg-danger/10 text-danger comic-border p-3 text-sm font-semibold mb-4 animate-fade-in-up">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="flex items-center gap-2 bg-success/10 text-success comic-border p-3 text-sm font-semibold mb-4 animate-fade-in-up">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field (Sign Up only) */}
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-text-main tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                Username
              </label>
              <input
                id="auth-username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="alexmercer"
                disabled={loading}
                className="w-full comic-border px-4 py-2.5 text-sm font-medium text-text-main placeholder-text-muted/50 bg-surface focus:outline-none focus:border-primary transition-colors duration-150"
              />
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-text-main tracking-wider flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-primary" />
              Email Address
            </label>
            <input
              id="auth-email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              disabled={loading}
              className="w-full comic-border px-4 py-2.5 text-sm font-medium text-text-main placeholder-text-muted/50 bg-surface focus:outline-none focus:border-primary transition-colors duration-150"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase text-text-main tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-primary" />
              Password
            </label>
            <div className="relative">
              <input
                id="auth-password-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full comic-border pl-4 pr-10 py-2.5 text-sm font-medium text-text-main placeholder-text-muted/50 bg-surface focus:outline-none focus:border-primary transition-colors duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password Field (Sign Up only) */}
          {mode === "signup" && (
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-text-main tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="auth-confirm-password-input"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className="w-full comic-border pl-4 pr-10 py-2.5 text-sm font-medium text-text-main placeholder-text-muted/50 bg-surface focus:outline-none focus:border-primary transition-colors duration-150"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Extra options: Remember me & Forgot Password */}
          {mode === "signin" && (
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    className="sr-only peer"
                  />
                  <div className="w-4 h-4 bg-surface comic-border peer-checked:bg-primary peer-checked:after:opacity-100 after:content-[''] after:absolute after:left-[5px] after:top-[2px] after:w-[5px] after:h-[8px] after:border-r-[2px] after:border-b-[2px] after:border-white after:rotate-45 after:opacity-0 transition-all duration-150" />
                </div>
                <span className="text-xs font-bold text-text-muted hover:text-text-main transition-colors">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={() => setError("Password reset flow simulated.")}
                disabled={loading}
                className="text-xs font-bold text-primary hover:underline hover:text-primary-hover cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <button
            id="auth-submit-button"
            type="submit"
            disabled={loading}
            className={`w-full comic-border font-black text-sm uppercase py-3 flex items-center justify-center gap-2 transition-all duration-100 cursor-pointer mt-6 ${
              loading
                ? "bg-outline-variant text-text-muted cursor-not-allowed"
                : "bg-primary text-white comic-shadow-sm active:comic-shadow-sm-pressed hover:bg-primary-hover"
            }`}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : mode === "signin" ? (
              <>
                Sign In
                <LogIn className="w-4 h-4" strokeWidth={2.5} />
              </>
            ) : (
              <>
                Create Account
                <UserPlus className="w-4 h-4" strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute w-full border-t border-outline-variant" />
          <span className="relative bg-surface-container px-3 text-xs font-bold text-text-muted uppercase">
            Or continue with
          </span>
        </div>

        {/* Social Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSocialLogin("Google")}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-text-main bg-surface comic-border comic-shadow-sm hover:translate-[1px] hover:shadow-none active:translate-[2px] transition-all duration-100 cursor-pointer"
          >
            <svg
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              width="16"
              height="16"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin("GitHub")}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-text-main bg-surface comic-border comic-shadow-sm hover:translate-[1px] hover:shadow-none active:translate-[2px] transition-all duration-100 cursor-pointer"
          >
            <svg
              className="w-4 h-4 shrink-0 fill-current"
              viewBox="0 0 24 24"
              width="16"
              height="16"
            >
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            GitHub
          </button>
        </div>

        {/* Back link */}
        {onCancel && (
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-bold text-text-muted hover:text-text-main underline underline-offset-2 transition-colors cursor-pointer"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
