// src/pages/student/StudentExamList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../Services/api.service";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table/index";
import Button from "../../components/ui/button/Button";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

/**
 * Decode JWT token safely (same as UserAddressCard.jsx)
 */
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    console.error("Invalid token format:", e);
    return null;
  }
}

const StudentExamList = () => {
  const [examList, setExamList] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // --- helper to check submitted status from backend ---
  const getExamSubmittedStatus = async (exam, userId) => {
    try {
      const data = { userId, examId: exam._id };
      const resp = await apiService.post("exam/getExamSubmittedStatus", data);

      if (resp.data?.message === true) {
        return { ...exam, exam_status: "Submitted" };
      }
    } catch (err) {
      console.error("Error checking submitted status:", err);
    }
    return exam;
  };

  // --- helper to calculate exam status ---
  const getExamStatus = (exam) => {
    const now = new Date();

    const examDate = new Date(exam.exam_date);
    const [hours, minutes] = exam.exam_time?.split(":") || ["0", "0"];

    examDate.setHours(parseInt(hours, 10));
    examDate.setMinutes(parseInt(minutes, 10));

    const examStart = examDate;
    const examEnd = new Date(
      examStart.getTime() + parseInt(exam.exam_duration, 10) * 60000
    );

    if (
      now.getDate() === examStart.getDate() &&
      now.getMonth() === examStart.getMonth() &&
      now.getFullYear() === examStart.getFullYear()
    ) {
      if (now < examStart) return "Upcoming";
      if (now >= examStart && now <= examEnd) return "Ongoing";
      if (now > examEnd) return "Exam Over";
    } else if (now < examStart) {
      return "Upcoming";
    } else if (now > examEnd) {
      return "Exam Over";
    }

    return "Unknown";
  };

  const fetchExams = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setErrorMsg("No access token found. Please login again.");
      return;
    }

    const payload = parseJwt(token);
    if (!payload) {
      setErrorMsg("Invalid token. Please login again.");
      return;
    }

    // Match UserAddressCard logic
    const userId =
      payload.id || payload.userId || payload._id || payload.sub || payload.aud;

    if (!userId || userId.length !== 24) {
      setErrorMsg("Invalid user ID. Please login again.");
      return;
    }

    try {
      const response = await apiService.get(
        `/exam/getRescheduledExams/${userId}`
      );

      if (response.data?.exams) {
        let updatedExams = await Promise.all(
          response.data.exams.map(async (exam) => {
            let status = getExamStatus(exam);
            let updatedExam = { ...exam, exam_status: status };

            if (status === "Ongoing" || status === "Exam Over") {
              updatedExam = await getExamSubmittedStatus(updatedExam, userId);
            }

            return updatedExam;
          })
        );
        setExamList(updatedExams);
      } else {
        setErrorMsg(response.data?.message || "Failed to fetch exams.");
      }
    } catch (error) {
      console.error("Failed to fetch exams:", error);
      setErrorMsg("Something went wrong while fetching exams.");
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleStartExam = (examId) => {
    localStorage.setItem("examId", examId);
    navigate(`/student-instructions/${examId}`);
  };

  return (
    <>
      <PageMeta
        title="Student Exam List"
        description="View upcoming and rescheduled exams"
      />
      <PageBreadcrumb pageTitle="Exam List" />

      <div className="space-y-6">
        <ComponentCard title="Your Exams">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {errorMsg ? (
                <div className="p-4 text-red-600 text-center">{errorMsg}</div>
              ) : (
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader>Course Name</TableCell>
                      <TableCell isHeader>Exam Date</TableCell>
                      <TableCell isHeader>Exam Time</TableCell>
                      <TableCell isHeader>Exam Status</TableCell>
                      <TableCell isHeader>Action</TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {examList.length > 0 ? (
                      examList.map((exam) => (
                        <TableRow key={exam._id}>
                          <TableCell>{exam.course_name}</TableCell>
                          <TableCell>
                            {new Date(exam.exam_date).toLocaleDateString("en-GB")}
                          </TableCell>
                          <TableCell>{exam.exam_time}</TableCell>
                          <TableCell>
                            <span
                              className={`badge badge-pill ${
                                exam.exam_status === "Upcoming"
                                  ? "badge-success"
                                  : exam.exam_status === "Ongoing"
                                  ? "badge-primary"
                                  : exam.exam_status === "Exam Over"
                                  ? "badge-danger"
                                  : exam.exam_status === "Submitted"
                                  ? "badge-warning"
                                  : "badge-secondary"
                              }`}
                            >
                              {exam.exam_status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {exam.exam_status === "Ongoing" && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleStartExam(exam._id)}
                              >
                                Start Exam
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-5">
                          No exams available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default StudentExamList;
