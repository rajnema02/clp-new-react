import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../Services/api.service";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";

const MessageCreate = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    message_type: "",
    message_description: "",
    messageFile: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "messageFile" ? files[0] : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.message_type) newErrors.message_type = "Message type is required";
    if (!formData.message_description.trim())
      newErrors.message_description = "Message description is required";
    if (!formData.messageFile) newErrors.messageFile = "Please upload a file";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({ message_type: "", message_description: "", messageFile: null });
    document.getElementById("fileInput").value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = new FormData();
      payload.append("message_description", formData.message_description);
      payload.append("alert_message", formData.message_type === "alert");
      payload.append("messageFile", formData.messageFile);

      await apiService.post("/message", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Message created successfully!");
      resetForm();

      // ✅ Navigate to message list page after creation
      navigate("/message-list");
    } catch (err) {
      console.error("Error creating message", err);
      alert("Failed to create message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Create Message" description="Create a new message or alert" />
      <PageBreadcrumb pageTitle="Create Message" />

      <div className="space-y-6">
        <ComponentCard title="Create Message / Alert">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {/* Message Type */}
            <div>
              <select
                className="input"
                name="message_type"
                value={formData.message_type}
                onChange={handleChange}
              >
                <option value="">Select Message Type</option>
                <option value="alert">Alert / Message For Home Page</option>
                <option value="batch">Batch Announcement</option>
              </select>
              {errors.message_type && (
                <p className="text-red-500 text-sm">{errors.message_type}</p>
              )}
            </div>

            {/* Message Description */}
            <div className="md:col-span-2">
              <textarea
                className="input"
                name="message_description"
                value={formData.message_description}
                onChange={handleChange}
                placeholder="Enter message description..."
                rows={3}
              />
              {errors.message_description && (
                <p className="text-red-500 text-sm">{errors.message_description}</p>
              )}
            </div>

            {/* File Upload */}
            <div className="md:col-span-2">
              <input
                type="file"
                id="fileInput"
                name="messageFile"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleChange}
                className="input w-full"
              />
              {errors.messageFile && (
                <p className="text-red-500 text-sm">{errors.messageFile}</p>
              )}
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
};

export default MessageCreate;
