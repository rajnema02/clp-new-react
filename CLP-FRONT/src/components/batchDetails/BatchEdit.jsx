import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiService from "../../Services/api.service";

const BatchEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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

  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    apiService.get(`/batch/${id}`).then((res) => {
      setFormData(res.data || {});
    });
  }, [id]);

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
      .put(`/batch/${id}`, formData)
      .then(() => navigate("/batch-list"))
      .catch((err) => console.error("Failed to update batch", err));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Edit Batch</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <input className="border p-2 rounded" name="batch_name" value={formData.batch_name} placeholder="Batch Name" onChange={handleChange} />
        <input className="border p-2 rounded" name="course_name" value={formData.course_name} placeholder="Course Name" onChange={handleChange} />
        <input className="border p-2 rounded" name="course_type" value={formData.course_type} placeholder="Course Type" onChange={handleChange} />
        <input className="border p-2 rounded" name="course_code" value={formData.course_code} placeholder="Course Code" onChange={handleChange} />
        <input className="border p-2 rounded col-span-2" name="disclaimer" value={formData.disclaimer} placeholder="Disclaimer" onChange={handleChange} />
        
        <div className="col-span-2">
          <label className="font-medium">Days:</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {weekDays.map((day) => (
              <label key={day} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  name="days"
                  value={day}
                  checked={formData.days?.includes(day)}
                  onChange={handleChange}
                />
                {day}
              </label>
            ))}
          </div>
        </div>

        <input type="date" className="border p-2 rounded" name="startDate" value={formData.startDate} onChange={handleChange} />
        <input type="date" className="border p-2 rounded" name="endDate" value={formData.endDate} onChange={handleChange} />
        <input type="time" className="border p-2 rounded" name="startTime" value={formData.startTime} onChange={handleChange} />
        <input type="time" className="border p-2 rounded" name="endTime" value={formData.endTime} onChange={handleChange} />

        <label className="flex items-center gap-2">
          <input type="checkbox" name="is_exam" checked={formData.is_exam} onChange={handleChange} /> Exam?
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isAuditExam" checked={formData.isAuditExam} onChange={handleChange} /> Audit?
        </label>

        <input className="border p-2 rounded" name="total_no_of_questions" value={formData.total_no_of_questions} placeholder="Total Questions" onChange={handleChange} />
        <input className="border p-2 rounded" name="percent_of_course_questions" value={formData.percent_of_course_questions} placeholder="% Course Questions" onChange={handleChange} />

        <button type="submit" className="col-span-2 bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600">
          Update
        </button>
      </form>
    </div>
  );
};

export default BatchEdit;
