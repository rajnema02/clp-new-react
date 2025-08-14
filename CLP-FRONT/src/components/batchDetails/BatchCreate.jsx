import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../Services/api.service";

const BatchCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    batch_name: "",
    course_name: "",
    course_type: "",
    course_code: "",
    disclaimer: "",
    days: [],
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    is_exam: false,
    isAuditExam: false,
    total_no_of_questions: "",
    percent_of_course_questions: ""
  });

  const [courseList, setCourseList] = useState([]);
  const [errors, setErrors] = useState({});


const handleCourseTypeChange = async (e) => {
  const selectedType = e.target.value;

  // Update formData
  setFormData({ ...formData, course_type: selectedType, course_name: "" });

  // Clear previous error for course_type
  setErrors({ ...errors, course_type: "" });

  if (!selectedType) {
    setCourseList([]);
    return;
  }

  try {
    const res = await apiService.get("/course", {
      params: { course_type: selectedType },
    });
    setCourseList(res.data.data || []);
  } catch (err) {
    console.error("Error fetching courses by type", err);
    setCourseList([]);
  }
};


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "days") {
      const newDays = checked
        ? [...formData.days, value]
        : formData.days.filter((day) => day !== value);
      setFormData({ ...formData, days: newDays });
    } else if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    apiService
      .post("/batch", formData)
      .then(() => navigate("/batch-list"))
      .catch((err) => console.error("Failed to create batch", err));
  };

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Create New Batch</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <input className="border p-2 rounded" name="batch_name" placeholder="Batch Name" onChange={handleChange} />
        <input className="border p-2 rounded " name="disclaimer" placeholder="Discription" onChange={handleChange} />
<div>
  <select
    className="border p-2 rounded"
    name="course_type"
    value={formData.course_type}
    onChange={handleCourseTypeChange} // custom handler
  >
    <option value="">Select Course Type</option>
    <option value="Training program for Govt Organisation">
      Training program for Govt Organisation
    </option>
    <option value="Special Training Program">Special Training Program</option>
    <option value="Internship Program">Internship Program</option>
    <option value="Regular">Regular Courses</option>
    <option value="E-Learning Course">E-Learning Course</option>
  </select>
  {errors.course_type && (
    <p className="text-red-500 text-sm">{errors.course_type}</p>
  )}
</div>

<div>
  <select
    className="border p-2 rounded"
    name="course_name"
    value={formData.course_name}
    onChange={handleChange}
  >
    <option value="">Select Course Name</option>
    {courseList.map((course) => (
      <option key={course._id} value={course.course_name}>
        {course.course_name}
      </option>
    ))}
  </select>
  {errors.course_name && (
    <p className="text-red-500 text-sm">{errors.course_name}</p>
  )}
</div>

        
        <div className="col-span-2">
          <label className="font-medium">Days:</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {weekDays.map((day) => (
              <label key={day} className="flex items-center gap-1">
                <input type="checkbox" name="days" value={day} onChange={handleChange} />
                {day}
              </label>
            ))}
          </div>
        </div>

        <input type="date" className="border p-2 rounded" name="startDate" onChange={handleChange} />
        <input type="date" className="border p-2 rounded" name="endDate" onChange={handleChange} />
        <input type="time" className="border p-2 rounded" name="startTime" onChange={handleChange} />
        <input type="time" className="border p-2 rounded" name="endTime" onChange={handleChange} />

        {/* <label className="flex items-center gap-2">
          <input type="checkbox" name="is_exam" onChange={handleChange} /> Exam?
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isAuditExam" onChange={handleChange} /> Audit?
        </label> */}

        <input className="border p-2 rounded" name="total_no_of_questions" placeholder="Total Questions" onChange={handleChange} />
        <input className="border p-2 rounded" name="percent_of_course_questions" placeholder="% Course Questions" onChange={handleChange} />

        <button type="submit" className="col-span-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Create
        </button>
      </form>
    </div>
  );
};

export default BatchCreate;
