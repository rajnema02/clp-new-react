import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

const InstructionPage = () => {
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id: examId } = useParams(); // ✅ Always get examId from URL

  useEffect(() => {
    const fetchExamData = async () => {
      try {
        if (!examId) {
          throw new Error("Exam ID not found in URL. Please navigate from the exam list.");
        }

        // Get access token
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          throw new Error("Authentication required. Please login again.");
        }

        // Fetch exam data
        const response = await axios.get(`/exam/getExamById/${examId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setExamData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching exam data:", err);
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    fetchExamData();
  }, [examId]);

  if (loading) {
    return (
      <div className="card">
        <div className="text-center p-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading exam instructions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center p-5 text-danger">
          <h5>Error Loading Exam</h5>
          <p>{error}</p>
          <Link to="/exams" className="btn btn-primary me-2">
            Back to Exams
          </Link>
          <button className="btn btn-secondary" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Navbar */}
      <div className="text-center bg-white">
        <div className="container-fluid py-3" style={{ backgroundColor: "#e3f2fd" }}>
          <h4><b>INSTRUCTION FOR EXAM</b></h4>
        </div>
      </div>
      <hr className="m-0" />
      <div className="py-3 text-center" style={{ backgroundColor: "#e3f2fd" }}>
        <h3>
          NOTE: IN ORDER TO PARTICIPATE IN THE EXAM KINDLY CLEAR WEB BROWSER COOKIES.
        </h3>
      </div>

      <div className="py-4">
        <div className="container py-4 px-lg-8">
          {/* Exam Details */}
          <div className="row content-align-center">
            <div className="col-6">Exam Name</div>
            <div className="col-6">{examData?.exam_name || "N/A"}</div>
            <div className="col-6">Exam Type</div>
            <div className="col-6">{examData?.course_type || "Objective"}</div>
            <div className="col-6">Course</div>
            <div className="col-6">{examData?.course_name || "N/A"}</div>
            <div className="col-6">Duration</div>
            <div className="col-6">{examData?.exam_duration || 90} minutes</div>
            <div className="col-6">Date</div>
            <div className="col-6">
              {examData?.exam_date
                ? new Date(examData.exam_date).toLocaleDateString()
                : "N/A"}
            </div>
            <div className="col-6">Time</div>
            <div className="col-6">{examData?.exam_time || "N/A"}</div>
          </div>

          <div className="mt-4">
            <h6 className="h3 lily-text mb-4">• No negative marking.</h6>
            <h6 className="h3 lily-text mb-4">• Candidates will get max three attempts.</h6>
            <h6 className="h3 lily-text mb-4">• Certification awarded by MPCON LIMITED.</h6>
            <h6 className="h3 lily-text mb-4">• Practice book available for preparation.</h6>
            <h6 className="h3 lily-text mb-4">• Students not allowed after 30 minutes of start.</h6>
            <h6 className="h3 lily-text mb-4">• Allocate time according to exam duration.</h6>
            <h6 className="h3 lily-text mb-4">• Do not refresh page or switch tabs.</h6>
            <h6 className="h3 lily-text mb-4">• Keep laptop charged / desktop on UPS.</h6>
          </div>
        </div>
      </div>

      <div className="p-5 text-center bg-light">
        {examId ? (
          <Link to={`/student-question-paper/${examId}`} className="btn btn-success btn-lg">
            Start Exam
          </Link>
        ) : (
          <button className="btn btn-secondary btn-lg" disabled>
            Exam ID not found
          </button>
        )}
      </div>
    </div>
  );
};

export default InstructionPage;
