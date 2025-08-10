// src/components/UserDropdown.jsx
import { useState, useEffect } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    console.error("Invalid token format:", e);
    return null;
  }
}

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const closeDropdown = () => setIsOpen(false);

  const handleSignOut = () => {
    logout();
    navigate(isAdmin ? "/admin-login" : "/login");
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.warn("No token found in localStorage");
        return;
      }

      const payload = parseJwt(token);
      if (!payload) {
        console.warn("Invalid token payload");
        return;
      }

      // Added 'aud' as last fallback for userId
      const userId =
        payload.id || payload.userId || payload._id || payload.sub || payload.aud;

      if (!userId) {
        console.warn("No user ID found in token payload", payload);
        return;
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const profileUrl = `${baseUrl}/auth/profile/${userId}`;

      try {
        const response = await fetch(profileUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          const text = await response.text();
          throw new Error(
            `Server returned HTML instead of JSON. Received: ${text.substring(0, 80)}...`
          );
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch profile");
        }

        const data = await response.json();
        setUserData(data.user || data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      }
    };

    fetchProfile();
  }, [isAdmin]);

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <span className="block mr-1 font-medium text-sm">
          {userData?.full_name || "User"}
        </span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-300 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-3 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4"
      >
        {/* User Info */}
        <div className="pb-3 mb-3 border-b border-gray-200 dark:border-gray-700">
          <span className="block font-medium text-gray-800 dark:text-gray-200">
            {userData?.full_name || "Loading..."}
          </span>
          <span className="block text-xs text-gray-500 dark:text-gray-400">
            {userData?.email || ""}
          </span>
        </div>

        {/* Profile Link */}
        <ul className="flex flex-col gap-2">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Profile
            </DropdownItem>
          </li>
        </ul>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className="mt-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-left transition-colors"
        >
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
