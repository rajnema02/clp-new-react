// src/components/UserAddressCard.jsx
import { useEffect, useState } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

/**
 * Decode JWT token safely (same as UserDropdown.jsx)
 */
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    console.error("Invalid token format:", e);
    return null;
  }
}

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [userData, setUserData] = useState(null);

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

      // Match UserDropdown's ID extraction order
      const userId =
        payload.id || payload.userId || payload._id || payload.sub || payload.aud;

      if (!userId) {
        console.warn("No user ID found in token payload", payload);
        return;
      }

      const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
      const profileUrl = `${baseUrl}/user/${userId}`;

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
  }, []);

  const handleSave = () => {
    // TODO: Implement profile update API call
    console.log("Saving profile changes...");
    closeModal();
  };

  if (!userData) {
    return (
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      {/* Profile Card */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Profile Details
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.full_name}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.email}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Mobile</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.mobile}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Role</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.role}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Audit Type</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {userData.auditType}
                </p>
              </div>

              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Created At</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {new Date(userData.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            Edit
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="relative w-full p-4 overflow-y-auto bg-white rounded-3xl dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Profile
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="px-2 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Full Name</Label>
                  <Input type="text" defaultValue={userData.full_name} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" defaultValue={userData.email} />
                </div>
                <div>
                  <Label>Mobile</Label>
                  <Input type="text" defaultValue={userData.mobile} />
                </div>
                <div>
                  <Label>Audit Type</Label>
                  <Input type="text" defaultValue={userData.auditType} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
