import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../Services/api.service";
import Button from "../../components/ui/button/Button";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

const AboutProgramCreate = () => {
  const [formData, setFormData] = useState({ title: "", file: null });
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData((prev) => ({ ...prev, file: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.file) {
      setError("Both Title and File are required.");
      return;
    }

    try {
      const form = new FormData();
      form.append("title", formData.title);
      form.append("file", formData.file);

      await apiService.post("/about-program", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      navigate("/about-program-list");
    } catch (err) {
      console.error("Error submitting program:", err);
      setError("Failed to create program. Try again.");
    }
  };

  return (
    <>
      <PageMeta title="Add About Program" />
      <PageBreadcrumb title="Add About Program" />

      <ComponentCard>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Program Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="file" className="block text-sm font-medium text-gray-700">
              Upload File (PDF) <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              id="file"
              name="file"
              accept="application/pdf"
              onChange={handleChange}
              className="mt-1 block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer bg-white focus:outline-none"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="pt-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
              Submit
            </Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
};

export default AboutProgramCreate;
