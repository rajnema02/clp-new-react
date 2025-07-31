import { useState } from "react";
import { Link } from "react-router";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";

export default function AdminSignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen w-full px-4 bg-white dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div>
          <div className="mb-5 sm:mb-8 text-center">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Admin Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Register as an admin to manage the platform.
            </p>
          </div>

          <form>
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* First Name */}
                <div>
                  <Label>
                    First Name <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="admin-fname"
                    name="admin-fname"
                    placeholder="Enter your first name"
                  />
                </div>
                {/* Last Name */}
                <div>
                  <Label>
                    Last Name <span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="admin-lname"
                    name="admin-lname"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <Label>
                  Admin Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="email"
                  id="admin-email"
                  name="admin-email"
                  placeholder="Enter your admin email"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <Label>
                  Mobile Number <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="tel"
                  id="admin-mobile"
                  name="admin-mobile"
                  placeholder="Enter your mobile number"
                />
              </div>

              {/* Password */}
              <div>
                <Label>
                  Password <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Enter a strong password"
                    type={showPassword ? "text" : "password"}
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

              {/* Terms */}
              <div className="flex items-center gap-3">
                <Checkbox
                  className="w-5 h-5"
                  checked={isChecked}
                  onChange={setIsChecked}
                />
                <p className="inline-block font-normal text-gray-500 dark:text-gray-400 text-sm">
                  I agree to the{" "}
                  <span className="text-gray-800 dark:text-white/90">
                    Terms and Conditions
                  </span>{" "}
                  and{" "}
                  <span className="text-gray-800 dark:text-white">
                    Privacy Policy
                  </span>
                </p>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                >
                  Create Admin Account
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5 text-center">
            <p className="text-sm font-normal text-gray-700 dark:text-gray-400">
              Already an admin?{" "}
              <Link
                to="/admin-login"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
