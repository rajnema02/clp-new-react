import React, { useState } from "react";
import { Download, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Button from "../ui/button/Button";
import api from "../../Services/api.service"; // Your API helper (like CoreApiService)
import fileService from "../../Services/file-service"; // Should have uploadBulkQuestions

const BulkUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [courseType, setCourseType] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseList, setCourseList] = useState([]);
  const [notGeneral, setNotGeneral] = useState(false);
  const [uploadButtonStatus, setUploadButtonStatus] = useState(false);

  const getCourseList = async (type) => {
    setCourseList([]);
    if (type === "General") {
      setNotGeneral(false);
    } else {
      setNotGeneral(true);
      try {
        const resp = await api.get("course", { course_type: type });
        setCourseList(resp.data || []);
      } catch (err) {
        console.error("Error fetching course list:", err);
      }
    }
  };

  const onFileSelected = (e) => {
    if (e.target.files.length) {
      const file = e.target.files[0];
      if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        setSelectedFile(file);
        setUploadButtonStatus(true);
      } else {
        setSelectedFile(null);
        setUploadButtonStatus(false);
        alert("Please upload file in .xlsx format only!!");
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!courseType || (notGeneral && !courseName)) {
      alert("Please fill all the details!");
      return;
    }
    if (!selectedFile) {
      alert("No file selected");
      return;
    }

    try {
      const resp = await fileService.uploadBulkQuestions(
        selectedFile,
        courseType,
        courseName
      );
      alert(resp.message || "File uploaded successfully!");
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const downloadSampleExcel = () => {
    const sampleHeaders = [
      {
        question: "",
        regional: "",
        option_1: "",
        option_2: "",
        option_3: "",
        option_4: "",
        answer: "",
        number_of_options: "",
        marks: "",
        difficulty_level: "",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(sampleHeaders);
    const workbook = { Sheets: { "Sample Format": worksheet }, SheetNames: ["Sample Format"] };
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blobData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blobData, "question-upload-sample-format.xlsx");
  };

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-700 text-white py-6 px-4 rounded-md mb-6">
        <h2 className="text-xl font-bold">Questions Upload</h2>
      </div>

      {/* Card */}
      <div className="bg-white shadow-md rounded-md p-4">
        {/* Navbar */}
        <div className="bg-blue-100 px-4 py-2 rounded flex justify-between items-center">
          <h2 className="text-lg font-semibold">Questions Upload</h2>
          <Button
            variant="info"
            onClick={downloadSampleExcel}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            <Download className="mr-2 h-4 w-4" /> Download Sample Format
          </Button>
        </div>

        {/* Form + Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Left: Upload Form */}
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <h5 className="font-semibold">Course Type</h5>
              <select
                value={courseType}
                onChange={(e) => {
                  setCourseType(e.target.value);
                  getCourseList(e.target.value);
                }}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="" disabled>Select Course Type</option>
                <option value="General Question">General Question</option>
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
            </div>

            {notGeneral && (
              <div>
                <h5 className="font-semibold">Course Name</h5>
                <select
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  required
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="" disabled>Select Course Name</option>
                  {courseList.map((course, idx) => (
                    <option key={idx} value={course.course_name}>
                      {course.course_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <input
              type="file"
              onChange={onFileSelected}
              className="block w-full border rounded px-3 py-2 mt-2"
            />

            <Button
              type="submit"
              disabled={!uploadButtonStatus}
              className={`bg-yellow-400 hover:bg-yellow-500 text-white ${!uploadButtonStatus && "opacity-50 cursor-not-allowed"}`}
            >
              <Upload className="mr-2 h-4 w-4" /> Upload
            </Button>
          </form>

          {/* Right: Notes */}
          <div className="bg-blue-50 rounded p-4">
            <h3 className="font-semibold mb-2">Notes</h3>
            <p>1. Click here to download sample format.</p>
            <p>2. Check uploaded questions count with detected count to ensure all data is processed.</p>
            <p>Click on process button after ensuring all data is accurate as per your knowledge.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkUpload;