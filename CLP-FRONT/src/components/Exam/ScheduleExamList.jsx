import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../Services/api.service";

const ScheduleExamList = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    exam_name: "",
    exam_code: "",
    course_type: "",
    course_name: "",
    batch_id: [],
    exam_date: "",
    exam_time: "",
    exam_duration: ""
  });

  const [courseList, setCourseList] = useState([]);
  const [batchList, setBatchList] = useState([]);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCourseTypeChange = async (e) => {
    const selectedType = e.target.value;
    let duration = "0";

    switch (selectedType) {
      case "Training program for Govt Organisation":
      case "Special Training Program":
      case "Internship Program":
        duration = "90";
        break;
      case "Regular Course":
      case "E-Learning Course":
        duration = "60";
        break;
      default:
        duration = "0";
    }

    setFormData((prev) => ({
      ...prev,
      course_type: selectedType,
      course_name: "",
      batch_id: [],
      exam_duration: duration
    }));

    setErrors((prev) => ({ ...prev, course_type: "" }));

    if (!selectedType) {
      setCourseList([]);
      return;
    }

    try {
      const res = await apiService.get("/course", {
        params: { course_type: selectedType }
      });
      setCourseList(res.data?.data || []);
      setBatchList([]);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourseList([]);
    }
  };

  const handleCourseNameChange = async (e) => {
    const selectedCourseName = e.target.value;

    setFormData((prev) => ({
      ...prev,
      course_name: selectedCourseName,
      batch_id: [],
    }));
    setErrors((prev) => ({ ...prev, course_name: "" }));

    if (!selectedCourseName) {
      setBatchList([]);
      return;
    }

    try {
      const res = await apiService.get("/batch", {
        params: { course_name: selectedCourseName },
      });
      setBatchList(res.data?.length ? res.data : []);
    } catch (err) {
      console.error("Error fetching batch list", err);
      setBatchList([]);
    }
  };

  const handleBatchChange = (e) => {
    setFormData((prev) => ({ ...prev, batch_id: [e.target.value] }));
    setErrors((prev) => ({ ...prev, batch_id: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (let key in formData) {
      if (!formData[key] || (Array.isArray(formData[key]) && formData[key].length === 0)) {
        setErrors((prev) => ({ ...prev, [key]: "This field is required" }));
        return;
      }
    }

    try {
      console.log("Submitting exam data:", formData);
      const res = await apiService.post("/exam", formData);
      if (res.data) {
        alert(res.data.message || "Exam scheduled successfully");
        navigate("/exam-list");
      }
    } catch (err) {
      console.error("Error scheduling exam:", err);
      alert("Error scheduling exam");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Schedule Exam</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <input
          className="border p-2 rounded"
          name="exam_name"
          placeholder="Exam Name"
          value={formData.exam_name}
          onChange={handleChange}
        />
        {errors.exam_name && <p className="text-red-500 text-sm">{errors.exam_name}</p>}

        <input
          className="border p-2 rounded"
          name="exam_code"
          placeholder="Exam Code"
          value={formData.exam_code}
          onChange={handleChange}
        />
        {errors.exam_code && <p className="text-red-500 text-sm">{errors.exam_code}</p>}

        <div>
          <select
            className="border p-2 rounded w-full"
            name="course_type"
            value={formData.course_type}
            onChange={handleCourseTypeChange}
          >
            <option value="">Select Course Type</option>
            <option value="Training program for Govt Organisation">
              Training program for Govt Organisation
            </option>
            <option value="Special Training Program">
              Special Training Program
            </option>
            <option value="Internship Program">Internship Program</option>
            <option value="Regular Course">Regular Course</option>
            <option value="E-Learning Course">E-Learning Course</option>
          </select>
          {errors.course_type && <p className="text-red-500 text-sm">{errors.course_type}</p>}
        </div>

        <div>
          <select
            className="border p-2 rounded w-full"
            name="course_name"
            value={formData.course_name}
            onChange={handleCourseNameChange}
          >
            <option value="">Select Course Name</option>
            {courseList.map((course) => (
              <option key={course._id} value={course.course_name}>
                {course.course_name}
              </option>
            ))}
          </select>
          {errors.course_name && <p className="text-red-500 text-sm">{errors.course_name}</p>}
        </div>

        <div>
          <select
            className="border p-2 rounded w-full"
            name="batch_id"
            value={formData.batch_id[0] || ""}
            onChange={handleBatchChange}
          >
            <option value="">Select Batch Name</option>
            {batchList.map((batch) => (
              <option key={batch._id} value={batch._id}>
                {batch.batch_name}
              </option>
            ))}
          </select>
          {errors.batch_id && <p className="text-red-500 text-sm">{errors.batch_id}</p>}
        </div>

        <input
          type="date"
          className="border p-2 rounded"
          name="exam_date"
          value={formData.exam_date}
          onChange={handleChange}
        />
        {errors.exam_date && <p className="text-red-500 text-sm">{errors.exam_date}</p>}

        <input
          type="time"
          className="border p-2 rounded"
          name="exam_time"
          value={formData.exam_time}
          onChange={handleChange}
        />
        {errors.exam_time && <p className="text-red-500 text-sm">{errors.exam_time}</p>}

        <input
          className="border p-2 rounded"
          name="exam_duration"
          placeholder="Duration (Minutes)"
          value={formData.exam_duration}
          onChange={handleChange}
        />
        {errors.exam_duration && <p className="text-red-500 text-sm">{errors.exam_duration}</p>}

        <button
          type="submit"
          className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Create
        </button>
      </form>
    </div>
  );
};

export default ScheduleExamList;
