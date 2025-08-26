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
  const [showAttendence, setShowAttendence] = useState(false);
  const [reScheduleExamForm, setReScheduleExamForm] = useState(false);
  const [uploadCertificateForm, setUploadCertificateForm] = useState(false);
  const [clearState, setClearState] = useState(false);
  const [loading, setLoading] = useState(false);
  const [absentShow, setAbsentShow] = useState(true);

  // Buttons
  const [processResultButton, setProcessResultButton] = useState(false);
  const [generateCertificateButton, setGenerateCertificateButton] = useState(true);
  const [downloadCertificateButton, setDownloadCertificateButton] = useState(false);
  const [uploadCertificateButton, setUploadCertificateButton] = useState(false);
  const [createBatchButton, setCreateBatchButton] = useState(false);
  const [viewCertificate, setViewCertificate] = useState(false);
  const [viewParticipationCertificate, setViewParticipationCertificate] = useState(false);

  // Counts
  const [count, setCount] = useState("-");
  const [resultCount, setResultCount] = useState("-");
  const [passedCount, setPassedCount] = useState("-");
  const [failedCount, setFailedCount] = useState("-");

  // File Upload
  const [selectedFiles, setSelectedFiles] = useState(null);

  // PDF toggle
  const [passPdf, setPassPdf] = useState(false);
  const [failPdf, setFailPdf] = useState(false);

  // Current view state
  const [currentView, setCurrentView] = useState("all");

  // Error state
  const [error, setError] = useState(null);

  // Environment
  const env = "localhost:3000";

  useEffect(() => {
    fetchExamData();
    getResultList();
    getTotalCount();
    checkIfAlreadyGenerated();
    checkIfReportsAlreadyProcessed();
  }, [examId]);

  const fetchExamData = async () => {
    try {
      const resp = await apiService.get(`exam/${examId}`, {});
      console.log("Exam Data Response:", resp);
      
      // Handle Axios response wrapper - extract data
      const responseData = resp?.data || resp;
      console.log("Exam Data:", responseData);
      
      if (responseData) {
        setExamData(responseData);
        
        // Calculate if processing time has started (similar to Angular logic)
        if (responseData.exam_time && responseData.exam_date) {
          const examHour = responseData.exam_time.split(":")[0];
          const examMinutes = responseData.exam_time.split(":")[1];
          const examDate = new Date(responseData.exam_date);
          examDate.setHours(examHour);
          examDate.setMinutes(examMinutes);
          const nowTime = new Date();
          
          // Enable process button (commented condition from Angular)
          setProcessResultButton(true);
        }
      }
    } catch (error) {
      console.error("Error fetching exam data:", error);
      setError("Failed to load exam data");
    }
  };

  const getTotalCount = async () => {
    try {
      const resp = await apiService.get("answerSheet/getTotalCount", { exam_id: examId });
      console.log("Total Count Response:", resp);
      
      // Handle Axios response wrapper - extract data
      const responseData = resp?.data || resp;
      console.log("Total Count Data:", responseData);
      
      setCount(responseData?.TotalCount || "-");
    } catch (error) {
      console.error("Error fetching total count:", error);
    }
  };

  // Main result list function (matches Angular getResultList)
  const getResultList = async () => {
    setLoading(true);
    setError(null);
    resetViews();
    setCurrentView("all");
    
    try {
      console.log("=== FETCHING RESULT LIST ===");
      console.log("Exam ID:", examId);
      
      // Use correct Angular endpoint
      const resp = await apiService.get("examReport/getResultList/", { exam_id: examId });
      
      console.log("=== RESULT LIST RESPONSE ===");
      console.log("Raw Response:", resp);
      console.log("Response type:", typeof resp);
      
      // Handle Axios response wrapper - extract data
      const responseData = resp?.data || resp;
      console.log("Response Data:", responseData);
      console.log("Response Data type:", typeof responseData);
      
      if (responseData && responseData.ResultList) {
        console.log("Setting result list:", responseData.ResultList);
        setResultList(responseData.ResultList);
        setResultCount(responseData.TotalCount || responseData.ResultList.length);
        setPassedCount(responseData.PassedCount || 0);
        setFailedCount(responseData.FailedCount || 0);
        console.log("resultList set successfully");
      } else {
        console.log("No ResultList found in response");
        if (processResultButton) {
          alert(responseData?.message || "No results found");
        }
        setResultList([]);
        setResultCount("-");
        setPassedCount("-");
        setFailedCount("-");
        setError(responseData?.message || "No results found");
      }
    } catch (error) {
      console.error("=== FETCH ERROR ===");
      console.error("Error:", error);
      console.error("Error response:", error.response);
      
      setResultList([]);
      setResultCount("-");
      setPassedCount("-");
      setFailedCount("-");
      setError("Error fetching results. Please try again.");
    } finally {
      setLoading(false);
      console.log("=== FETCH COMPLETE ===");
    }
  };

  // Process results using Angular's getExamReport logic
  const getExamReport = async () => {
    setLoading(true);
    setError(null);
    resetViews();
    setCurrentView("all");
    
    try {
      console.log("Processing results for exam_id:", examId);
      
      // Use Angular's endpoint for processing
      const resp = await apiService.post("answerSheet/showResultsToAdmin", { exam_id: examId });
      console.log("Process Results Response:", resp);
      
      // Handle Axios response wrapper - extract data
      const responseData = resp?.data || resp;
      console.log("Process Results Data:", responseData);
      
      // After processing, get the updated result list
      await getResultList();
      
      alert("Results processed successfully!");
    } catch (error) {
      console.error("Error processing results:", error);
      alert("Error processing results. Please try again.");
      setError("Error processing results");
    } finally {
      await checkIfReportsAlreadyProcessed();
      setLoading(false);
    }
  };

  const getPassedStudents = async () => {
    setLoading(true);
    setError(null);
    
    // Set states matching Angular
    setUploadCertificateForm(false);
    setViewParticipationCertificate(false);
    setViewCertificate(true);
    setClearState(true);
    setReScheduleExamForm(false);
    setAbsentShow(false);
    setCreateBatchButton(false);
    setPassPdf(true);
    setFailPdf(false);
    setShowAttendence(false);
    setCurrentView("passed");
    
    try {
      const resp = await apiService.get("examReport/getPassedList", { exam_id: examId });
      console.log("Passed Students Response:", resp);
      
      // Handle Axios response wrapper - extract data
      const responseData = resp?.data || resp;
      console.log("Passed Students Data:", responseData);
      
      if (responseData && responseData.PassedStudentList) {
        if (responseData.PassedStudentList.length <= 0) {
          alert("No passed students found!");
        } else {
          setResultList(responseData.PassedStudentList);
          setPassedCount(responseData.TotalCount || responseData.PassedStudentList.length);
        }
      } else {
        alert("No passed students found!");
        setResultList([]);
        setPassedCount(0);
      }
    } catch (error) {
      console.error("Error fetching passed students:", error);
      setError("Error fetching passed students. Please try again.");
      setResultList([]);
      setPassedCount(0);
    } finally {
      setLoading(false);
    }
  };

  const getFailedStudents = async () => {
    setLoading(true);
    setError(null);
    
    // Set states matching Angular
    setUploadCertificateForm(false);
    setViewCertificate(false);
    setPassPdf(false);
    setFailPdf(true);
    setClearState(true);
    setReScheduleExamForm(false);
    setAbsentShow(true);
    setShowAttendence(false);
    setCurrentView("failed");
    
    try {
      // Check if this is the last attempt
      try {
        const examResp = await apiService.get("exam/checkIfExamIsLastAttempt", { id: examId });
        const examResponseData = examResp?.data || examResp;
        if (examResponseData?.success === true) {
          setCreateBatchButton(true);
        } else {
          setViewParticipationCertificate(true);
        }
      } catch (e) {
        console.log("Could not check last attempt:", e);
      }

      const resp = await apiService.get("examReport/getFailedList", { exam_id: examId });
      console.log("Failed Students Response:", resp);
      
      // Handle Axios response wrapper - extract data
      const responseData = resp?.data || resp;
      console.log("Failed Students Data:", responseData);
      
      if (responseData && responseData.FailedStudentList) {
        setResultList(responseData.FailedStudentList);
        setFailedCount(responseData.TotalCount || responseData.FailedStudentList.length);
      } else {
        setError("No failed students found!");
        setResultList([]);
        setFailedCount(0);
      }
    } catch (error) {
      console.error("Error fetching failed students:", error);
      setError("Error fetching failed students. Please try again.");
      setResultList([]);
      setFailedCount(0);
    } finally {
      setLoading(false);
    }
  };

  const showAttendenceList = async () => {
    setLoading(true);
    setError(null);
    
    // Set states matching Angular
    setViewParticipationCertificate(false);
    setViewCertificate(false);
    setClearState(true);
    setCreateBatchButton(false);
    setReScheduleExamForm(false);
    setCurrentView("attendance");
    
    try {
      const resp = await apiService.post("answerSheet/showAttendenceList", { exam_id: examId });
      console.log("Attendance Response:", resp);
      
      // Handle Axios response wrapper - extract data
      const responseData = resp?.data || resp;
      console.log("Attendance Data:", responseData);
      
      const attendanceList = Array.isArray(responseData) ? responseData : [];
      setStudentList(attendanceList);
      setShowAttendence(true);
      
      if (attendanceList.length === 0) {
        setError("No attendance data found");
      }
    } catch (error) {
      console.error("Error fetching attendance list:", error);
      setError("Error fetching attendance list. Please try again.");
      setStudentList([]);
    } finally {
      setLoading(false);
    }
  };

  const reScheduleExam = async () => {
    setViewCertificate(false);
    
    try {
      const resp = await apiService.get("exam/checkIfAlreadyRescheduled", { id: examId });
      console.log(resp);
      if (resp?.success === false) {
        setClearState(false);
        setReScheduleExamForm(true);
      } else if (resp?.success === true) {
        alert(resp?.message);
      }
    } catch (error) {
      console.error("Error checking reschedule:", error);
    }
  };

  const submitReScheduleExam = async (formData) => {
    if (!formData.exam_name || !formData.exam_code || !formData.exam_date || !formData.exam_time) {
      alert("Please fill required fields!!");
      return;
    }

    try {
      const data = {
        newExamData: formData,
        exam_id: examId
      };
      
      const resp = await apiService.post("exam/reScheduleExam", data);
      console.log(resp);
      
      if (resp?.message) {
        alert(resp.message);
        setReScheduleExamForm(false);
      } else {
        alert("Exam Re-Scheduled Successfully!!");
        setReScheduleExamForm(false);
      }
    } catch (error) {
      console.error("Error rescheduling exam:", error);
      alert("Please fill required fields!!");
    }
  };

  const resetViews = () => {
    setViewParticipationCertificate(false);
    setViewCertificate(false);
    setShowAttendence(false);
    setCreateBatchButton(false);
    setUploadCertificateForm(false);
    setReScheduleExamForm(false);
    setPassPdf(false);
    setFailPdf(false);
    setClearState(false);
    setError(null);
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
      if (resp?.success === true) {
        setGenerateCertificateButton(false);
        setDownloadCertificateButton(true);
        setUploadCertificateButton(true);
      } else {
        console.log(resp?.message);
      }
    } catch (error) {
      console.error("Error checking certificate generation:", error);
    }
  };

  const generateCertificates = async () => {
    try {
      const resp = await apiService.get("certificate/download-pdf", { exam_id: examId });
      if (resp) {
        console.log(resp);
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
    window.open(`${env.REACT_APP_API_URL}/certificate/download-certificates?exam_id=${examId}`, "_blank");
  };

  const uploadCertificates = () => {
    setUploadCertificateForm(true);
  };

  const onFileSelected = (event) => {
    setSelectedFiles(event.target.files);
  };

  const onSubmitUpload = async () => {
    if (!selectedFiles) {
      console.log("No files selected");
      return;
    }
    
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("files", selectedFiles[i]);
    }
    
    console.log(formData);
    
    try {
      const resp = await apiService.post("certificate/upload", formData);
      if (resp?.success) {
        setUploadCertificateForm(false);
        setUploadCertificateButton(false);
        alert("Certificates uploaded successfully!");
        console.log(resp);
      } else {
        alert(resp?.message || "Upload failed");
      }
    } catch (error) {
      console.error("Error uploading certificates:", error);
    }
  };

  const handleReScheduleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    submitReScheduleExam(data);
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
                onClick={getResultList} 
                className="px-3 py-2 text-yellow-600 hover:text-yellow-800 underline"
                disabled={loading}
              >
                Clear Filter
              </button>
            )}

            <button 
              onClick={showAttendenceList} 
              className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
              disabled={loading}
            >
              <i className="fas fa-list mr-1"></i>
              View Attendence List [{count}]
            </button>

            {processResultButton && (
              <button 
                onClick={getExamReport} 
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                disabled={loading}
              >
                <i className={`fa ${loading ? 'fa-spinner fa-spin' : 'fa-circle-notch'} mr-1`}></i>
                Process Results [{resultCount}]
              </button>
            )}

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
              View Passed Students [{passedCount}]
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
              View Failed Students [{failedCount}]
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

            {/* <button 
              onClick={showAttendenceList} 
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              disabled={loading}
            >
              <i className="fas fa-list mr-1"></i>
              View Attendence List [{count}]
            </button> */}
          </div>
        </div>

        {/* Debug Console Output */}
        {/* <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
          <strong>Debug Info:</strong> 
          <br />Found {resultList.length} results
          <br />Current View: {currentView}
          <br />Loading: {loading.toString()}
          <br />Error: {error || 'none'}
          <br />Result Count: {resultCount}
          <br />Passed Count: {passedCount}
          <br />Failed Count: {failedCount}
          <br />Total Count: {count}
          <br />Process Result Button: {processResultButton.toString()}
          <br />Show Attendence: {showAttendence.toString()}
          <br />Student List Length: {studentList.length}
          <br /><strong>Check browser console for detailed logs</strong>
          <br /><strong>Raw Result List:</strong> {JSON.stringify(resultList).substring(0, 200)}...
        </div> */}

        {/* Error Message */}
        {error && !loading && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <i className="fa fa-exclamation-triangle text-red-500 mr-2"></i>
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

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
            <form onSubmit={handleReScheduleSubmit} className="p-3 mt-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  name="exam_name" 
                  type="text" 
                  placeholder="Exam Name" 
                  defaultValue={examData.exam_name || ""}
                  className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  name="exam_code" 
                  type="text" 
                  placeholder="Exam Code" 
                  defaultValue={examData.exam_code || ""}
                  className="p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input 
                  name="course_name" 
                  type="text" 
                  placeholder="Course Name" 
                  defaultValue={examData.course_name || ""}
                  disabled
                  className="p-3 border rounded bg-gray-100 text-gray-600"
                />
                <input 
                  name="course_type" 
                  type="text" 
                  defaultValue={examData.course_type || ""}
                  disabled
                  className="p-3 border rounded bg-gray-100 text-gray-600"
                />
                <div>
                  <label className="block text-sm font-medium mb-1">Exam Date:</label>
                  <input 
                    name="exam_date" 
                    type="date" 
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Exam Time:</label>
                  <input 
                    name="exam_time" 
                    type="time" 
                    className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Schedule Exam
                </button>
              </div>
            </form>
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
        {showAttendence && !loading && (
          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold mb-3">Attendance List</h3>
            {studentList.length > 0 ? (
              <table className="w-full text-sm text-center border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 border">Students Name</th>
                    <th className="px-4 py-3 border">Email</th>
                    <th className="px-4 py-3 border">Mobile</th>
                    <th className="px-4 py-3 border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentList.map((student, idx) => (
                    <tr key={idx} className="border hover:bg-gray-50">
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
                <i className="fa fa-users text-4xl text-gray-300 mb-3"></i>
                <h4 className="text-lg font-semibold text-gray-600 mb-2">No Attendance Data</h4>
                <p>No attendance information found for this exam</p>
              </div>
            )}
          </div>
        )}

        {/* Results Table */}
        {!showAttendence && !reScheduleExamForm && !uploadCertificateForm && !loading && (
          <div className="overflow-x-auto">
            <h3 className="text-lg font-semibold mb-3">
              {currentView === "passed" ? "Passed Students" :
               currentView === "failed" ? "Failed Students" : "Exam Results"}
            </h3>
            
            {resultList.length > 0 ? (
              <table className="w-full text-sm text-center border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 border">Students Name</th>
                    <th className="px-4 py-3 border">Total Answered</th>
                    <th className="px-4 py-3 border">Correct Answers</th>
                    <th className="px-4 py-3 border">Incorrect Answers</th>
                    <th className="px-4 py-3 border">Total Marks</th>
                    <th className="px-4 py-3 border">Marks Obtained</th>
                    <th className="px-4 py-3 border">Grade Obtained</th>
                    <th className="px-4 py-3 border">Result</th>
                    {!viewCertificate && <th className="px-4 py-3 border">Attendence</th>}
                  </tr>
                </thead>
                <tbody>
                  {resultList.map((result, idx) => (
                    <tr key={result._id || idx} className="border hover:bg-gray-50">
                      <td className="px-4 py-3 border font-medium">
                        {result.Student_name ? result.Student_name : result.full_name}
                      </td>
                      <td className="px-4 py-3 border">{result.Answered ? result.Answered : "0"}</td>
                      <td className="px-4 py-3 border text-green-600 font-medium">{result.CorrectAnswers ? result.CorrectAnswers : "0"}</td>
                      <td className="px-4 py-3 border text-red-600 font-medium">{result.IncorrectAnswers ? result.IncorrectAnswers : "0"}</td>
                      <td className="px-4 py-3 border">{result.TotalMarks ? result.TotalMarks : "0"}</td>
                      <td className="px-4 py-3 border font-semibold">{result.StudentMarks ? result.StudentMarks : "0"}</td>
                      <td className="px-4 py-3 border">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          result.grade === "A+" || result.grade === "A" ? "bg-green-100 text-green-700" :
                          result.grade === "B+" || result.grade === "B" ? "bg-blue-100 text-blue-700" :
                          result.grade === "C+" || result.grade === "C" ? "bg-yellow-100 text-yellow-700" :
                          result.grade === "D" || result.grade === "F" ? "bg-orange-100 text-orange-700" :
                          "bg-gray-100 text-gray-700"
                        }`}>
                          {result.grade ? result.grade : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 border">
                        {result.Result === "Pass" ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                            {result.Result}
                          </span>
                        ) : result.Result === "Fail" ? (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                            {result.Result}
                          </span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
                            Fail
                          </span>
                        )}
                      </td>
                      {!viewCertificate && (
                        <td className="px-4 py-3 border">
                          <span className={`text-xs font-medium ${!result.Absent ? "text-green-600" : "text-red-600"}`}>
                            {!result.Absent ? "Present" : "Absent"}
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
        {!loading && !showAttendence && !reScheduleExamForm && !uploadCertificateForm && resultList.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <h4 className="text-lg font-semibold text-blue-800">Total Students</h4>
              <p className="text-2xl font-bold text-blue-600">{count}</p>
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
        {!loading && !showAttendence && !reScheduleExamForm && !uploadCertificateForm && resultList.length === 0 && !error && (
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