import { useState, useEffect } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import apiService from "../../Services/api.service";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [authid, setAuthid] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (admin) {
      try {
        const parsedAdmin = JSON.parse(admin);
        if (parsedAdmin?.id) {
          navigate("/", { replace: true });
        }
      } catch (error) {
        localStorage.removeItem('admin');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!authid.trim() || !password.trim()) {
      toast.error("Please fill in all fields", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const credentials = {
        authid: authid.trim(),
        password: password.trim(),
        remember: isChecked
      };

      await login(credentials, true);
      
      toast.success("Login successful! Redirecting...", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: true,
      });

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);

    } catch (error) {
      console.error("Login error:", error);
      
      let errorMessage = "Login failed. Please try again.";
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Invalid credentials. Please check your email/mobile and password.";
          setPassword("");
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
      });

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4 bg-white dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="mb-5 sm:mb-8 text-center">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Admin Log In
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Enter your admin credentials to access the panel.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            <div>
              <Label htmlFor="authid">
                Email or Mobile <span className="text-error-500">*</span>
              </Label>
              <Input 
                id="authid"
                type="text"
                placeholder="admin@example.com or mobile number" 
                value={authid}
                onChange={(e) => setAuthid(e.target.value)}
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="password">
                Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id="remember-me"
                  checked={isChecked} 
                  onChange={() => setIsChecked(!isChecked)}
                  disabled={loading}
                />
                <label 
                  htmlFor="remember-me"
                  className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400 cursor-pointer select-none"
                >
                  Keep me logged in
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 disabled:opacity-50"
                onClick={() => navigate("/forgot-password")}
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            <div>
              <Button 
                className="w-full" 
                size="sm" 
                type="submit" 
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Logging in...
                  </span>
                ) : (
                  "Log In as Admin"
                )}
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
            Not an admin?{" "}
            <button
              type="button"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400 disabled:opacity-50"
              onClick={() => navigate("/admin-signup")}
              disabled={loading}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}