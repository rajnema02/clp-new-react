import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../Services/api.service";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";

const CourseCreate = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    course_type: "",
    course_name: "",
    course_duration: "",
    course_code: "",
    fees: "",
    course_eligibilty: "",
    course_content: null, // store file instead of text
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    if (e.target.name === "course_content") {
      setFormData({ ...formData, course_content: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    setErrors({ ...errors, [e.target.name]: "" }); // clear error when typing
  };

  const validateForm = () => {
    let newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (
        key === "course_content" &&
        (formData[key] === null || formData[key] === "")
      ) {
        newErrors[key] = "Please upload a file";
      } else if (
        key !== "course_content" &&
        (!formData[key] || formData[key].toString().trim() === "")
      ) {
        newErrors[key] = "This field is required";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      await apiService.post("/course", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/course-list");
    } catch (err) {
      console.error("Error creating course", err);
    }
  };

  return (
    <>
      <PageMeta title="Create Course" description="Create a new course" />
      <PageBreadcrumb pageTitle="Create Course" />

      <div className="space-y-6">
        <ComponentCard title="Create Course">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <div>
  <select
    className="input"
    name="course_type"
    value={formData.course_type}
    onChange={handleChange}
  >
    <option value="">Select Course Type</option>
    <option value="Training program for Govt Organisation">Training program for Govt Organisation</option>
    <option value="Internship Program">Internship Program</option>
    <option value="Regular Course">Regular Course </option>
    <option value="E-Learning Course">E-Learning Course</option>
  </select>
  {errors.course_type && (
    <p className="text-red-500 text-sm">{errors.course_type}</p>
  )}
</div>


            <div>
              <input
                className="input"
                name="course_name"
                value={formData.course_name}
                onChange={handleChange}
                placeholder="Course Name"
              />
              {errors.course_name && (
                <p className="text-red-500 text-sm">{errors.course_name}</p>
              )}
            </div>

            <div>
              <input
                className="input"
                name="course_duration"
                value={formData.course_duration}
                onChange={handleChange}
                placeholder="Duration"
              />
              {errors.course_duration && (
                <p className="text-red-500 text-sm">{errors.course_duration}</p>
              )}
            </div>

            <div>
              <input
                className="input"
                name="course_code"
                value={formData.course_code}
                onChange={handleChange}
                placeholder="Course Code"
              />
              {errors.course_code && (
                <p className="text-red-500 text-sm">{errors.course_code}</p>
              )}
            </div>

            <div>
              <input
                className="input"
                name="fees"
                value={formData.fees}
                onChange={handleChange}
                placeholder="Fees"
              />
              {errors.fees && (
                <p className="text-red-500 text-sm">{errors.fees}</p>
              )}
            </div>

            <div>
              <input
                className="input"
                name="course_eligibilty"
                value={formData.course_eligibilty}
                onChange={handleChange}
                placeholder="Eligibility"
              />
              {errors.course_eligibilty && (
                <p className="text-red-500 text-sm">
                  {errors.course_eligibilty}
                </p>
              )}
            </div>

            {/* File Upload for Course Content */}
            <div className="col-span-2">
              <input
                type="file"
                name="course_content"
                onChange={handleChange}
                className="input w-full"
              />
              {errors.course_content && (
                <p className="text-red-500 text-sm">{errors.course_content}</p>
              )}
            </div>

            <div className="col-span-2 flex justify-end">
              <Button type="submit" variant="primary">
                Create
              </Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
};

export default CourseCreate;
