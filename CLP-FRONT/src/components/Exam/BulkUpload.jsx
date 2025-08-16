import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../Services/api.service";
import sampleFile from "../../assets/question-upload-sample-format.xlsx"; // <-- place your sample file here


const BulkUpload = () => {
  const [courseType, setCourseType] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseList, setCourseList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleCourseTypeChange = async (e) => {
    const selectedType = e.target.value;
    setCourseType(selectedType);
    setCourseName("");
    setCourseList([]);
    setErrors((prev) => ({ ...prev, course_type: "" }));

    if (!selectedType || selectedType === "General Question") return;

    try {
      const res = await apiService.get("/course", { params: { course_type: selectedType } });
      setCourseList(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setCourseList([]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".xlsx")) {
      alert("Please upload an .xlsx file only.");
      return;
    }
    setSelectedFile(file);
    setErrors((prev) => ({ ...prev, file: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseType) return setErrors((prev) => ({ ...prev, course_type: "Course type is required" }));
    if (courseType !== "General Question" && !courseName)
      return setErrors((prev) => ({ ...prev, course_name: "Course name is required" }));
    if (!selectedFile) return setErrors((prev) => ({ ...prev, file: "File is required" }));

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("course_type", courseType);
    if (courseType !== "General Question") formData.append("course_name", courseName);

    setUploading(true);
    try {
      const resp = await apiService.post("/questionFile/uploadBulkQuestions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(`${resp.data.message} (${resp.data.count} questions added)`);
      navigate("/question-bank-list"); // ✅ Navigate after success
    } catch (err) {
      console.error("Upload failed:", err);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded">
     
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Bulk Upload Questions</h2>
        <a
          href={sampleFile}
          download="question-upload-sample-format.xlsx"
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
        >
          Download Sample FIle
        </a>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block mb-1 font-medium">Course Type</label>
          <select className="border p-2 rounded w-full" value={courseType} onChange={handleCourseTypeChange}>
            <option value="">Select Course Type</option>
            <option value="General Question">General Question</option>
            <option value="Training program for Govt Organisation">Training program for Govt Organisation</option>
            <option value="Special Training Program">Special Training Program</option>
            <option value="Internship Program">Internship Program</option>
            <option value="Regular Course">Regular Course</option>
            <option value="E-Learning Course">E-Learning Course</option>
          </select>
          {errors.course_type && <p className="text-red-500 text-sm">{errors.course_type}</p>}
        </div>

        {courseType !== "General Question" && (
          <div className="col-span-2">
            <label className="block mb-1 font-medium">Course Name</label>
            <select
              className="border p-2 rounded w-full"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
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
        )}

        <div className="col-span-2">
          <label className="block mb-1 font-medium">Upload Excel (.xlsx)</label>
          <input type="file" accept=".xlsx" onChange={handleFileChange} className="border p-2 rounded w-full" />
          {errors.file && <p className="text-red-500 text-sm">{errors.file}</p>}
        </div>

        <div className="col-span-2">
          <button
            type="submit"
            disabled={uploading}
            className={`w-full py-2 rounded text-white ${
              uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BulkUpload;
