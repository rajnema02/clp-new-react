import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiService from "../../Services/api.service";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Button from "../../components/ui/button/Button";

const CourseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    course_type: "",
    course_name: "",
    course_duration: "",
    course_code: "",
    fees: "",
    course_content: "",
    course_eligibilty: "",
    description: "",
  });

  useEffect(() => {
    apiService
      .get(`/course/${id}`)
      .then((res) => {
        setFormData(res.data || {});
      })
      .catch((err) => console.error("Error fetching course", err));
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiService.put(`/course/${id}`, formData);
      navigate("/course-list");
    } catch (err) {
      console.error("Error updating course", err);
    }
  };

  return (
    <>
      <PageMeta title="Edit Course " description="Edit course details" />
      <PageBreadcrumb pageTitle="Edit Course" />

      <div className="space-y-6">
        <ComponentCard title="Edit Course">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <input className="input" name="course_type" value={formData.course_type} onChange={handleChange} placeholder="Course Type" />
            <input className="input" name="course_name" value={formData.course_name} onChange={handleChange} placeholder="Course Name" />
            <input className="input" name="course_duration" value={formData.course_duration} onChange={handleChange} placeholder="Duration" />
            <input className="input" name="course_code" value={formData.course_code} onChange={handleChange} placeholder="Course Code" />
            <input className="input" name="fees" value={formData.fees} onChange={handleChange} placeholder="Fees" />
            <input className="input" name="course_eligibilty" value={formData.course_eligibilty} onChange={handleChange} placeholder="Eligibility" />
            <textarea className="input col-span-2" name="description" value={formData.description} onChange={handleChange} placeholder="Description" />
            <textarea className="input col-span-2" name="course_content" value={formData.course_content} onChange={handleChange} placeholder="Course Content" />
            <div className="col-span-2 flex justify-end">
              <Button type="submit" variant="primary">Update</Button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
};

export default CourseEdit;
