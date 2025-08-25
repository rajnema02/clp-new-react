import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiService from "../../Services/api.service";

const ResultList = () => {
  const { id: examId } = useParams();

  // Data states
  const [resultList, setResultList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [examData, setExamData] = useState({});

  // UI states
  const [showAttendance, setShowAttendance] = useState(false);
  const [reScheduleExamForm, setReScheduleExamForm] = useState(false);
  const [uploadCertificateForm, setUploadCertificateForm] = useState(false);
  const [clearState, setClearState] = useState(false);
  const [loading, setLoading] = useState(false);

  // Buttons
  const [processResultButton, setProcessResultButton] = useState(false);
  const [generateCertificateButton, setGenerateCertificateButton] = useState(true);
  const [downloadCertificateButton, setDownloadCertificateButton] = useState(false);
  const [uploadCertificateButton, setUploadCertificateButton] = useState(false);
  const [createBatchButton, setCreateBatchButton] = useState(false);
  const [viewCertificate, setViewCertificate] = useState(false);
  const [viewParticipationCertificate, setViewParticipationCertificate] = useState(false);

  // Counts
  const [resultCount, setResultCount] = useState("-");
  const [passedCount, setPassedCount] = useState("-");
  const [failedCount, setFailedCount] = useState("-");
  const [totalCount, setTotalCount] = useState("-");

  // File Upload
  const [selectedFiles, setSelectedFiles] = useState(null);

  // PDF toggle
  const [passPdf, setPassPdf] = useState(false);
  const [failPdf, setFailPdf] = useState(false);

  // Current view state
  const [currentView, setCurrentView] = useState("all"); // "all", "passed", "failed", "attendance"

  // Re-schedule form fields
  const [newExamData, setNewExamData] = useState({
    exam_name: "",
    exam_code: "",
    course_name: "",
    course_type: "",
    exam_date: "",
    exam_time: "",
  });

  useEffect(() => {
    fetchExamData();
    fetchAllResults();
    getTotalCount();
    checkIfAlreadyGenerated();
    checkIfReportsAlreadyProcessed();
  }, [examId]);

  const fetchExamData = async () => {
    try {
      const resp = await apiService.get(`exam/${examId}`);
      if (resp) {
        setExamData(resp);
        setNewExamData(prev => ({
          ...prev,
          course_name: resp.course_name || "",
          course_type: resp.course_type || ""
        }));
        
        // Check if processing time has started (similar to Angular logic)
        const examHour = resp.exam_time?.split(":")[0];
        const examMinutes = resp.exam_time?.split(":")[1];
        const examDate = new Date(resp.exam_date);
        examDate.setHours(examHour);
        examDate.setMinutes(examMinutes);
        
        const nowTime = new Date();
        // Enable process button (you can add your time logic here)
        setProcessResultButton(true);
      }
    } catch (error) {
      console.error("Error fetching exam data:", error);
    }
  };

  const getTotalCount = async () => {
    try {
      const resp = await apiService.get("answerSheet/getTotalCount", { exam_id: examId });
      setTotalCount(resp?.TotalCount || "-");
    } catch (error) {
      console.error("Error fetching total count:", error);
    }
  };

  // Fetch all results (main function)
  const fetchAllResults = async () => {
    setLoading(true);
    resetViews();
    setCurrentView("all");
    
    try {
      console.log("Fetching results for exam_id:", examId);
      const resp = await apiService.get("examReport/getExamReport", { exam_id: examId });
      
      console.log("API Response:", resp);

      if (resp?.success) {
        // Set the data regardless of whether ResultList has items or not
        setResultList(resp.ResultList || []);
        setResultCount(resp.TotalCount || 0);
        setPassedCount(resp.PassedCount || 0);
        setFailedCount(resp.FailedCount || 0);
        
        if (resp.ResultList && resp.ResultList.length > 0) {
          console.log("Results loaded successfully:", resp.ResultList.length, "results");
        } else {
          console.log("No results found, but API call was successful");
        }
      } else {
        console.log("API returned success: false", resp?.message);
        setResultList([]);
        setResultCount(0);
        setPassedCount(0);
        setFailedCount(0);
        if (resp?.message) {
          alert(resp.message);
        }
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      setResultList([]);
      setResultCount(0);
      setPassedCount(0);
      setFailedCount(0);
      alert("Error fetching results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Process results (for when results need to be calculated first)
  const processResults = async () => {
    setLoading(true);
    try {
      console.log("Processing results for exam_id:", examId);
      
      // This would typically call an API to process/calculate results first
      // For now, we'll just fetch the results
      const resp = await apiService.get("examReport/getExamReport", { exam_id: examId });
      
      console.log("Process Results API Response:", resp);
      
      if (resp?.success) {
        setResultList(resp.ResultList || []);
        setResultCount(resp.TotalCount || 0);
        setPassedCount(resp.PassedCount || 0);
        setFailedCount(resp.FailedCount || 0);
        setProcessResultButton(false);
        
        if (resp.ResultList && resp.ResultList.length > 0) {
          alert("Results processed successfully!");
          console.log("Results processed:", resp.ResultList.length, "results");
        } else {
          alert("Results processed but no data found");
        }
      } else {
        alert(resp?.message || "Error processing results");
        setResultList([]);
        setResultCount(0);
        setPassedCount(0);
        setFailedCount(0);
      }
    } catch (error) {
      console.error("Error processing results:", error);
      alert("Error processing results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPassedStudents = async () => {
    setLoading(true);
    resetViews();
    setCurrentView("passed");
    setViewCertificate(true);
    setClearState(true);
    setPassPdf(true);
    setFailPdf(false);
    
    try {
      console.log("Fetching passed students for exam_id:", examId);
      const resp = await apiService.get("examReport/getPassedList", { exam_id: examId });
      
      console.log("Passed Students API Response:", resp);
      
      if (resp?.success) {
        setResultList(resp.PassedStudentList || []);
        setPassedCount(resp.TotalCount || 0);
        
        if (resp.PassedStudentList && resp.PassedStudentList.length > 0) {
          console.log("Passed students loaded:", resp.PassedStudentList.length);
        } else {
          console.log("No passed students found");
        }
      } else {
        alert(resp?.message || "No passed students found!");
        setResultList([]);
        setPassedCount(0);
      }
    } catch (error) {
      console.error("Error fetching passed students:", error);
      alert("Error fetching passed students. Please try again.");
      setResultList([]);
      setPassedCount(0);
    } finally {
      setLoading(false);
    }
  };

  const getFailedStudents = async () => {
    setLoading(true);
    resetViews();
    setCurrentView("failed");
    setClearState(true);
    setPassPdf(false);
    setFailPdf(true);
    
    try {
      console.log("Fetching failed students for exam_id:", examId);
      
      // Check if this is the last attempt
      const examResp = await apiService.get("exam/checkIfExamIsLastAttempt", { id: examId });
      if (examResp?.success) {
        setCreateBatchButton(true);
      } else {
        setViewParticipationCertificate(true);
      }

      const resp = await apiService.get("examReport/getFailedList", { exam_id: examId });
      
      console.log("Failed Students API Response:", resp);
      
      if (resp?.success) {
        setResultList(resp.FailedStudentList || []);
        setFailedCount(resp.TotalCount || 0);
        
        if (resp.FailedStudentList && resp.FailedStudentList.length > 0) {
          console.log("Failed students loaded:", resp.FailedStudentList.length);
        } else {
          console.log("No failed students found");
        }
      } else {
        alert(resp?.message || "No failed students found!");
        setResultList([]);
        setFailedCount(0);
      }
    } catch (error) {
      console.error("Error fetching failed students:", error);
      alert("Error fetching failed students. Please try again.");
      setResultList([]);
      setFailedCount(0);
    } finally {
      setLoading(false);
    }
  };

  const showAttendanceList = async () => {
    setLoading(true);
    resetViews();
    setCurrentView("attendance");
    setShowAttendance(true);
    setClearState(true);
    
    try {
      const resp = await apiService.post("answerSheet/showAttendenceList", { exam_id: examId });
      setStudentList(resp || []);
    } catch (error) {
      console.error("Error fetching attendance list:", error);
      alert("Error fetching attendance list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reScheduleExam = async () => {
    try {
      const resp = await apiService.get("exam/checkIfAlreadyRescheduled", { id: examId });
      if (!resp?.success) {
        setClearState(false);
        setReScheduleExamForm(true);
      } else {
        alert(resp?.message);
      }
    } catch (error) {
      console.error("Error checking reschedule:", error);
    }
  };

  const submitReScheduleExam = async () => {
    // Basic validation
    if (!newExamData.exam_name || !newExamData.exam_code || !newExamData.exam_date || !newExamData.exam_time) {
      alert("Please fill all required fields!");
      return;
    }

    try {
      const data = { newExamData, exam_id: examId };
      const resp = await apiService.post("exam/reScheduleExam", data);
      if (resp?.message) {
        alert(resp.message);
      } else {
        alert("Exam Re-Scheduled Successfully!!");
      }
      setReScheduleExamForm(false);
    } catch (error) {
      console.error("Error rescheduling exam:", error);
      alert("Please fill required fields!!");
    }
  };

  const resetViews = () => {
    setViewParticipationCertificate(false);
    setViewCertificate(false);
    setShowAttendance(false);
    setCreateBatchButton(false);
    setUploadCertificateForm(false);
    setReScheduleExamForm(false);
    setPassPdf(false);
    setFailPdf(false);
    setClearState(false);
  };

  const checkIfReportsAlreadyProcessed = async () => {
    try {
      const resp = await apiService.get("answerSheet/checkIfAlreadyProcessed", { examId });
      if (resp?.success) {
        setProcessResultButton(false);
      }
    } catch (error) {
      console.error("Error checking report status:", error);
    }
  };

  const checkIfAlreadyGenerated = async () => {
    try {
      const resp = await apiService.get("certificate/checkIfGenerated", { examId });
      if (resp?.success) {
        setGenerateCertificateButton(false);
        setDownloadCertificateButton(true);
        setUploadCertificateButton(true);
      }
    } catch (error) {
      console.error("Error checking certificate generation:", error);
    }
  };

  const generateCertificates = async () => {
    try {
      const resp = await apiService.get("certificate/download-pdf", { exam_id: examId });
      if (resp) {
        setGenerateCertificateButton(false);
        setDownloadCertificateButton(true);
        setUploadCertificateButton(true);
        alert("Certificates generated successfully!!");
      } else {
        alert("No certificates to download!");
      }
    } catch (error) {
      console.error("Error generating certificates:", error);
    }
  };

  const downloadCertificates = () => {
    window.open(`${process.env.REACT_APP_API_URL}/certificate/download-certificates?exam_id=${examId}`, "_blank");
  };

  const uploadCertificates = () => {
    setUploadCertificateForm(true);
  };

  const onFileSelected = (event) => {
    setSelectedFiles(event.target.files);
  };

  const onSubmitUpload = async () => {
    if (!selectedFiles) {
      alert("No files selected!");
      return;
    }
    
    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const resp = await apiService.post("certificate/upload", formData);
      if (resp?.success) {
        setUploadCertificateForm(false);
        setUploadCertificateButton(false);
        alert("Certificates uploaded successfully!");
      } else {
        alert(resp?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading certificates:", error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-pink-500 -mx-4 -mt-6 mb-6 px-4 py-8">
        <div className="container mx-auto">
          <div className="header-body"></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-xl font-bold text-gray-800">Exam Report</h4>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {clearState && (
              <button 
                onClick={fetchAllResults} 
                className="px-3 py-2 text-yellow-600 hover:text-yellow-800 underline"
                disabled={loading}
              >
                Clear Filter
              </button>
            )}

            <button 
              onClick={showAttendanceList} 
              className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              disabled={loading}
            >
              <i className="fa fa-users mr-1"></i>
              View Attendance [{totalCount}]
            </button>
            
            {processResultButton && (
              <button 
                onClick={processResults} 
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                disabled={loading}
              >
                <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-circle-notch'} mr-1`}></i>
                Process Results
              </button>
            )}

            <button 
              onClick={fetchAllResults} 
              className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
              disabled={loading}
            >
              <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-list'} mr-1`}></i>
              All Results [{resultCount}]
            </button>
            
            <a 
              href={`/exam/print-pdf/2/${examId}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              <i className="fa fa-file-pdf-o mr-1"></i>
              Export PDF
            </a>
            
            <button 
              onClick={getPassedStudents} 
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              disabled={loading}
            >
              <i className={`fa ${loading && currentView === 'passed' ? 'fa-spinner fa-spin' : 'fa-check'} mr-1`}></i>
              Passed Students [{passedCount}]
            </button>
            
            {passPdf && (
              <a 
                href={`/exam/print-pdf/1/${examId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                <i className="fa fa-file-pdf-o mr-1"></i>
                Export Pass PDF
              </a>
            )}
            
            <button 
              onClick={getFailedStudents} 
              className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              disabled={loading}
            >
              <i className={`fa ${loading && currentView === 'failed' ? 'fa-spinner fa-spin' : 'fas fa-times'} mr-1`}></i>
              Failed Students [{failedCount}]
            </button>
            
            {failPdf && (
              <a 
                href={`/exam/print-pdf/0/${examId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                <i className="fa fa-file-pdf-o mr-1"></i>
                Export Fail PDF
              </a>
            )}
            
            {generateCertificateButton && (
              <button 
                onClick={generateCertificates} 
                className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
              >
                <i className="fa fa-circle-notch mr-1"></i>
                Generate Certificates
              </button>
            )}
            
            {downloadCertificateButton && (
              <button 
                onClick={downloadCertificates} 
                className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
              >
                <i className="fa fa-download mr-1"></i>
                Download Certificates
              </button>
            )}
            
            {uploadCertificateButton && (
              <button 
                onClick={uploadCertificates} 
                className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
              >
                <i className="fa fa-upload mr-1"></i>
                Upload Certificates
              </button>
            )}
          </div>
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-4">
            <i className="fa fa-spinner fa-spin text-2xl text-blue-600"></i>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}

        {/* Re-Schedule Exam Form */}
        {reScheduleExamForm && !uploadCertificateForm && (
          <div className="mb-6 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Schedule Exam</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="Exam Name" 
                value={newExamData.exam_name} 
                onChange={(e) => setNewExamData({...newExamData, exam_name: e.target.value})} 
                className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input 
                type="text" 
                placeholder="Exam Code" 
                value={newExamData.exam_code} 
                onChange={(e) => setNewExamData({...newExamData, exam_code: e.target.value})} 
                className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input 
                type="text" 
                placeholder="Course Name" 
                value={newExamData.course_name} 
                disabled
                className="p-3 border rounded bg-gray-100 text-gray-600"
              />
              <input 
                type="text" 
                value={newExamData.course_type} 
                disabled
                className="p-3 border rounded bg-gray-100 text-gray-600"
              />
              <div>
                <label className="block text-sm font-medium mb-1">Exam Date:</label>
                <input 
                  type="date" 
                  value={newExamData.exam_date} 
                  onChange={(e) => setNewExamData({...newExamData, exam_date: e.target.value})} 
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Exam Time:</label>
                <input 
                  type="time" 
                  value={newExamData.exam_time} 
                  onChange={(e) => setNewExamData({...newExamData, exam_time: e.target.value})} 
                  className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button 
                onClick={submitReScheduleExam} 
                className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Schedule Exam
              </button>
            </div>
          </div>
        )}

        {/* Upload Certificates Form */}
        {uploadCertificateForm && (
          <div className="mb-6 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Upload Certificates:</h2>
            <div className="flex items-center gap-4">
              <input 
                type="file" 
                onChange={onFileSelected} 
                multiple 
                className="flex-1 p-2 border rounded"
              />
              <button 
                onClick={onSubmitUpload} 
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Upload
              </button>
            </div>
          </div>
        )}

        {/* Re-Schedule Button */}
        {createBatchButton && (
          <div className="text-right mb-4">
            <button 
              onClick={reScheduleExam} 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              <i className="fa fa-check-square mr-1"></i>
              Re-Schedule Exam for failed students
            </button>
          </div>
        )}

        {/* Current View Indicator */}
        {!loading && currentView !== "all" && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-800 font-medium">
              Current View: {
                currentView === "passed" ? "Passed Students" :
                currentView === "failed" ? "Failed Students" :
                currentView === "attendance" ? "Attendance List" : "All Results"
              }
            </p>
          </div>
        )}

        {/* Attendance Table */}
        {showAttendance && !loading && (
          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold mb-3">Attendance List</h3>
            {studentList.length > 0 ? (
              <table className="w-full text-sm text-center border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 border">S.No</th>
                    <th className="px-4 py-3 border">Students Name</th>
                    <th className="px-4 py-3 border">Email</th>
                    <th className="px-4 py-3 border">Mobile</th>
                    <th className="px-4 py-3 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentList.map((student, idx) => (
                    <tr key={idx} className="border hover:bg-gray-50">
                      <td className="px-4 py-3 border">{idx + 1}</td>
                      <td className="px-4 py-3 border">{student.full_name}</td>
                      <td className="px-4 py-3 border">{student.email}</td>
                      <td className="px-4 py-3 border">{student.mobile}</td>
                      <td className="px-4 py-3 border">
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          student.attendenceStatus === "Present" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {student.attendenceStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No attendance data found
              </div>
            )}
          </div>
        )}

        {/* Results Table */}
        {!showAttendance && !reScheduleExamForm && !uploadCertificateForm && !loading && (
          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold mb-3">
              {currentView === "passed" ? "Passed Students" :
               currentView === "failed" ? "Failed Students" : "Exam Results"}
            </h3>
            
            {/* Debug Info - Remove this in production */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <strong>Debug Info:</strong> Found {resultList.length} results, 
                Current View: {currentView}, 
                Loading: {loading.toString()}
              </div>
            )}
            
            {resultList.length > 0 ? (
              <table className="w-full text-sm text-center border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 border">S.No</th>
                    <th className="px-4 py-3 border">Students Name</th>
                    <th className="px-4 py-3 border">Total Answered</th>
                    <th className="px-4 py-3 border">Correct Answers</th>
                    <th className="px-4 py-3 border">Incorrect Answers</th>
                    <th className="px-4 py-3 border">Total Marks</th>
                    <th className="px-4 py-3 border">Marks Obtained</th>
                    <th className="px-4 py-3 border">Grade Obtained</th>
                    <th className="px-4 py-3 border">Result</th>
                    {currentView === "all" && <th className="px-4 py-3 border">Attendance</th>}
                  </tr>
                </thead>
                <tbody>
                  {resultList.map((result, idx) => (
                    <tr key={result._id || idx} className="border hover:bg-gray-50">
                      <td className="px-4 py-3 border">{idx + 1}</td>
                      <td className="px-4 py-3 border font-medium">
                        {result.Student_name || result.full_name || "N/A"}
                      </td>
                      <td className="px-4 py-3 border">{result.Answered || "0"}</td>
                      <td className="px-4 py-3 border text-green-600 font-medium">{result.CorrectAnswers || "0"}</td>
                      <td className="px-4 py-3 border text-red-600 font-medium">{result.IncorrectAnswers || "0"}</td>
                      <td className="px-4 py-3 border">{result.TotalMarks || "0"}</td>
                      <td className="px-4 py-3 border font-semibold">{result.StudentMarks || "0"}</td>
                      <td className="px-4 py-3 border">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          result.grade === "A+" || result.grade === "A" ? "bg-green-100 text-green-700" :
                          result.grade === "B+" || result.grade === "B" ? "bg-blue-100 text-blue-700" :
                          result.grade === "C+" || result.grade === "C" ? "bg-yellow-100 text-yellow-700" :
                          result.grade === "D" || result.grade === "F" ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {result.grade || "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 border">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          result.Result === "Pass" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {result.Result || "Fail"}
                        </span>
                      </td>
                      {currentView === "all" && (
                        <td className="px-4 py-3 border">
                          <span className={`text-xs font-medium ${result.Absent ? "text-red-600" : "text-green-600"}`}>
                            {result.Absent ? "Absent" : "Present"}
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <i className="fa fa-clipboard-list text-4xl text-gray-300 mb-3"></i>
                <h4 className="text-lg font-semibold text-gray-600 mb-2">No Data Available</h4>
                <p>
                  {currentView === "passed" ? "No passed students found for this exam" :
                   currentView === "failed" ? "No failed students found for this exam" :
                   "No results found for this exam"}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Statistics Summary */}
        {!loading && !showAttendance && !reScheduleExamForm && !uploadCertificateForm && resultList.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <h4 className="text-lg font-semibold text-blue-800">Total Students</h4>
              <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg text-center">
              <h4 className="text-lg font-semibold text-indigo-800">Results Processed</h4>
              <p className="text-2xl font-bold text-indigo-600">{resultCount}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <h4 className="text-lg font-semibold text-green-800">Passed</h4>
              <p className="text-2xl font-bold text-green-600">{passedCount}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <h4 className="text-lg font-semibold text-red-800">Failed</h4>
              <p className="text-2xl font-bold text-red-600">{failedCount}</p>
            </div>
          </div>
        )}

        {/* Participation Certificate Link */}
        {viewParticipationCertificate && (
          <div className="mt-4 text-center">
            <a 
              href={`/certificate/participation/${examId}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 inline-block"
            >
              <i className="fa fa-certificate mr-2"></i>
              Download Participation Certificates
            </a>
          </div>
        )}

        {/* No Data Message */}
        {!loading && !showAttendance && !reScheduleExamForm && !uploadCertificateForm && resultList.length === 0 && (
          <div className="text-center py-12">
            <i className="fa fa-clipboard-list text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Data Available</h3>
            <p className="text-gray-500">
              {processResultButton 
                ? "Click 'Process Results' to calculate and display exam results." 
                : "No exam results found for this exam."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultList;