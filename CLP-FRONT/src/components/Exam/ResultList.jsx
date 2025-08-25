import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import apiService from "../../Services/api.service";

const ResultList = () => {
  const { id: examId } = useParams();

  const [resultList, setResultList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [examData, setExamData] = useState({});
  const [showAttendance, setShowAttendance] = useState(false);

  // Button controls
  const [processResultButton, setProcessResultButton] = useState(false);
  const [generateCertificateButton, setGenerateCertificateButton] = useState(true);
  const [downloadCertificateButton, setDownloadCertificateButton] = useState(false);
  const [uploadCertificateButton, setUploadCertificateButton] = useState(false);
  const [uploadCertificateForm, setUploadCertificateForm] = useState(false);
  const [createBatchButton, setCreateBatchButton] = useState(false);
  const [viewCertificate, setViewCertificate] = useState(false);
  const [viewParticipationCertificate, setViewParticipationCertificate] = useState(false);

  // Counts
  const [resultCount, setResultCount] = useState("-");
  const [passedCount, setPassedCount] = useState("-");
  const [failedCount, setFailedCount] = useState("-");

  // File Upload
  const [selectedFiles, setSelectedFiles] = useState(null);

  useEffect(() => {
    fetchExamData();
    getResultList();
    checkIfAlreadyGenerated();
    checkIfReportsAlreadyProcessed();
  }, [examId]);

  const fetchExamData = async () => {
    try {
      const resp = await apiService.get(`exam/${examId}`);
      if (resp) {
        setExamData(resp);
        setProcessResultButton(true);
      }
    } catch (error) {
      console.error("Error fetching exam data:", error);
    }
  };

  const getResultList = async () => {
    resetViews();
    try {
      const resp = await apiService.get("examReport/getResultList", { exam_id: examId });
      if (resp?.ResultList) {
        setResultList(resp.ResultList);
        setResultCount(resp.TotalCount || "-");
        setPassedCount(resp.PassedCount || "-");
        setFailedCount(resp.FailedCount || "-");
      } else if (processResultButton) {
        alert(resp?.message || "No results found");
      }
    } catch (error) {
      console.error("Error fetching result list:", error);
    }
  };

  const getPassedStudents = async () => {
    resetViews();
    setViewCertificate(true);
    try {
      const resp = await apiService.get("examReport/getPassedList", { exam_id: examId });
      if (resp?.PassedStudentList?.length > 0) {
        setResultList(resp.PassedStudentList);
        setPassedCount(resp.TotalCount || "-");
      } else {
        alert("No passed students found!");
      }
    } catch (error) {
      console.error("Error fetching passed students:", error);
    }
  };

  const getFailedStudents = async () => {
    resetViews();
    try {
      const examResp = await apiService.get("exam/checkIfExamIsLastAttempt", { id: examId });
      if (examResp?.success) setCreateBatchButton(true);
      else setViewParticipationCertificate(true);

      const resp = await apiService.get("examReport/getFailedList", { exam_id: examId });
      if (resp?.FailedStudentList) {
        setResultList(resp.FailedStudentList);
        setFailedCount(resp.TotalCount || "-");
      }
    } catch (error) {
      console.error("Error fetching failed students:", error);
    }
  };

  const showAttendanceList = async () => {
    resetViews();
    setShowAttendance(true);
    try {
      const resp = await apiService.post("answerSheet/showAttendenceList", { exam_id: examId });
      setStudentList(resp || []);
    } catch (error) {
      console.error("Error fetching attendance list:", error);
    }
  };

  const getExamReport = async () => {
    resetViews();
    try {
      await apiService.post("answerSheet/showResultsToAdmin", { exam_id: examId });
      getResultList();
      checkIfReportsAlreadyProcessed();
    } catch (error) {
      console.error("Error processing exam report:", error);
    }
  };

  const resetViews = () => {
    setViewParticipationCertificate(false);
    setViewCertificate(false);
    setShowAttendance(false);
    setCreateBatchButton(false);
    setUploadCertificateForm(false);
  };

  const checkIfReportsAlreadyProcessed = async () => {
    try {
      const resp = await apiService.get("answerSheet/checkIfAlreadyProcessed", { examId });
      if (resp?.success) setProcessResultButton(false);
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
        alert("Certificates generated successfully!");
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

  const uploadCertificates = () => setUploadCertificateForm(true);

  const onFileSelected = (event) => setSelectedFiles(event.target.files);

  const onSubmitUpload = async () => {
    if (!selectedFiles) {
      alert("No files selected!");
      return;
    }
    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => formData.append("files", file));

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
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Student Results</h2>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {processResultButton && (
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700" onClick={getExamReport}>
            Process Results [{resultCount}]
          </button>
        )}
        {generateCertificateButton && (
          <button className="px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600" onClick={generateCertificates}>
            Generate Certificates
          </button>
        )}
        {downloadCertificateButton && (
          <button className="px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600" onClick={downloadCertificates}>
            Download Certificates
          </button>
        )}
        {uploadCertificateButton && (
          <button className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700" onClick={uploadCertificates}>
            Upload Certificates
          </button>
        )}
        <button className="px-3 py-2 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600" onClick={getResultList}>
          Clear Filter
        </button>
        <button className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700" onClick={getPassedStudents}>
          View Passed Students [{passedCount}]
        </button>
        <button className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700" onClick={getFailedStudents}>
          View Failed Students [{failedCount}]
        </button>
        <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700" onClick={showAttendanceList}>
          View Attendance
        </button>
      </div>

      {/* Upload Certificates */}
      {uploadCertificateForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h4 className="text-lg font-semibold mb-2">Upload Certificates</h4>
          <input type="file" onChange={onFileSelected} multiple className="mb-3" />
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700" onClick={onSubmitUpload}>
            Upload
          </button>
        </div>
      )}

      {/* Attendance or Results */}
      {showAttendance ? (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="w-full text-sm text-center border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Student Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Mobile</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {studentList.map((student, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{student.full_name}</td>
                  <td className="px-4 py-2">{student.email}</td>
                  <td className="px-4 py-2">{student.mobile}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        student.attendenceStatus === "Present"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {student.attendenceStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="w-full text-sm text-center border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Student Name</th>
                <th className="px-4 py-2">Total Answered</th>
                <th className="px-4 py-2">Correct Answers</th>
                <th className="px-4 py-2">Incorrect Answers</th>
                <th className="px-4 py-2">Total Marks</th>
                <th className="px-4 py-2">Marks Obtained</th>
                <th className="px-4 py-2">Grade Obtained</th>
                <th className="px-4 py-2">Result</th>
                <th className="px-4 py-2">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {resultList.map((result, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{result.Student_name || result.full_name}</td>
                  <td className="px-4 py-2">{result.Answered || 0}</td>
                  <td className="px-4 py-2">{result.CorrectAnswers || 0}</td>
                  <td className="px-4 py-2">{result.IncorrectAnswers || 0}</td>
                  <td className="px-4 py-2">{result.TotalMarks || 0}</td>
                  <td className="px-4 py-2">{result.StudentMarks || 0}</td>
                  <td className="px-4 py-2">{result.grade || "-"}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        result.Result === "Pass"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {result.Result || "Fail"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`font-semibold ${
                        result.Absent ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {result.Absent ? "Absent" : "Present"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ResultList;
