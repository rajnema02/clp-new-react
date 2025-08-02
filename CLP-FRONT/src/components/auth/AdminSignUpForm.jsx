import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import apiService from "../../Services/api.service";

export default function AdminSignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    mobile: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isChecked) {
      const msg = "Please agree to the terms and conditions";
      alert(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);

    try {
      const response = await apiService.post('auth/authsignup', formData);

      localStorage.setItem("accessToken", response.data.token);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("admin", JSON.stringify({
        id: response.data.id,
        full_name: response.data.full_name,
        email: response.data.email,
        mobile: response.data.mobile,
        role: response.data.role
      }));

      alert("Account created successfully!");
      toast.success("Account created successfully!");
      setTimeout(() => navigate("/admin-login"), 1500);

    } catch (error) {
      const errorMsg = error.response?.data?.message || 
        error.response?.data?.error || 
        "Registration failed. Please try again.";
      alert(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4 bg-white dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="mb-5 sm:mb-8 text-center">
          <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
            Admin Sign Up
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Register as an admin to manage the platform.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <Label>
                Full Name <span className="text-error-500">*</span>
              </Label>
              <Input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <Label>
                Email <span className="text-error-500">*</span>
              </Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your admin email"
                required
              />
            </div>

            <div>
              <Label>
                Mobile Number <span className="text-error-500">*</span>
              </Label>
              <Input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter your mobile number"
                required
              />
            </div>

            <div>
              <Label>
                Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox checked={isChecked} onChange={setIsChecked} />
              <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                I agree to the{" "}
                <span className="text-gray-800 dark:text-white/90">
                  Terms and Conditions
                </span>{" "}
                and{" "}
                <span className="text-gray-800 dark:text-white">
                  Privacy Policy
                </span>
              </span>
            </div>

            <div>
              <Button 
                className="w-full" 
                size="sm" 
                type="submit" 
                disabled={loading}
              >
                {loading ? "Creating account..." : "Create Admin Account"}
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
            Already an admin?{" "}
            <button
              type="button"
              className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              onClick={() => navigate("/admin-login")}
            >
              Log In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
