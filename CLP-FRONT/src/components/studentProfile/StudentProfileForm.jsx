import React, { useEffect, useState } from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

/**
 * Decode JWT safely (same as UserAddressCard & UserDropdown)
 */
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    console.error("Invalid token format:", e);
    return null;
  }
}

const StudentProfileForm = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.warn("No token found in localStorage");
        setLoading(false);
        return;
      }

      const payload = parseJwt(token);
      if (!payload) {
        console.warn("Invalid token payload");
        setLoading(false);
        return;
      }

      const userId =
        payload.id || payload.userId || payload._id || payload.sub || payload.aud;

      if (!userId) {
        console.warn("No user ID found in token payload", payload);
        setLoading(false);
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
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="p-6">
        <p className="text-red-500">Failed to load profile data.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <PageMeta title="User Profile" description="Student profile details" />
      <PageBreadcrumb pageTitle="Student Profile" />

      {/* User Information */}
      <ComponentCard title="User Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div><strong>Name:</strong> {userData.full_name}</div>
          <div><strong>Role:</strong> {userData.role || "-"}</div>
          <div><strong>Email:</strong> {userData.email}</div>
          <div><strong>Mobile:</strong> {userData.mobile || "-"}</div>
          <div><strong>Created At:</strong> {new Date(userData.created_at).toLocaleString()}</div>
        </div>
      </ComponentCard>

      {/* Correspondence Address */}
      {/* <ComponentCard title="Correspondence Address">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="md:col-span-3">
            <strong>Address:</strong> {userData.address || "-"}
          </div>
          <div><strong>State:</strong> {userData.state || "-"}</div>
          <div><strong>City:</strong> {userData.city || "-"}</div>
          <div><strong>Pin Code:</strong> {userData.pin_code || "-"}</div>
          <div>
            <strong>Is identity pic uploaded?</strong>{" "}
            {userData.identity_pic ? "Yes" : "No"}
          </div>
          {userData.identity_pic && (
            <div className="md:col-span-3">
              <img
                src={userData.identity_pic}
                alt="Identity"
                className="w-40 border border-gray-300 mt-2"
              />
            </div>
          )}
        </div>
      </ComponentCard> */}

      {/* Course Detail */}
      {/* <ComponentCard title="Course Detail">
        <div className="text-sm">
          <strong className="block">Course:</strong>
          <span>{userData.course_name || "-"}</span>
        </div>
      </ComponentCard> */}

      {/* Department / Org. Name */}
      {/* <ComponentCard title="Department / Org. Name">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div><strong>Department:</strong> {userData.department || "-"}</div>
          <div><strong>Employee Type:</strong> {userData.employee_type || "-"}</div>
          <div><strong>Company Type:</strong> {userData.company_type || "-"}</div>
          <div><strong>Block:</strong> {userData.block || "-"}</div>
          <div><strong>District:</strong> {userData.district || "-"}</div>
          <div><strong>State:</strong> {userData.state || "-"}</div>
          <div><strong>Pin Code:</strong> {userData.pin_code || "-"}</div>
          {userData.address_proof && (
            <div className="md:col-span-3">
              <img
                src={userData.address_proof}
                alt="Proof"
                className="w-40 border border-gray-300 mt-2"
              />
            </div>
          )}
        </div>
      </ComponentCard> */}
    </div>
  );
};

export default StudentProfileForm;
