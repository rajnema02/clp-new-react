import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../Services/api.service";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";

const DepartmentCreate = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      alert("Please fill all the necessary details");
      return;
    }

    try {
      const res = await apiService.post("/department", formData);
      if (res) {
        alert("Content Uploaded Successfully!!!");
        navigate("/department-list");
      }
    } catch (error) {
      console.error("Error creating department:", error);
      alert("Server error occurred");
    }
  };

  return (
    <>
      <PageMeta title="Create Department" />
      <PageBreadcrumb items={["Master", "Departments", "Create"]} />

      <ComponentCard title="Create Department">
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Title
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                placeholder="Enter department title"
              />
              <p className="text-xs text-gray-500 mt-1">Title</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-500"
                placeholder="Enter department description"
              />
              <p className="text-xs text-gray-500 mt-1">Description</p>
            </div>
          </div>

          <div className="flex justify-center pt-6">
            <Button type="submit">Create</Button>
          </div>
        </form>
      </ComponentCard>
    </>
  );
};

export default DepartmentCreate;
