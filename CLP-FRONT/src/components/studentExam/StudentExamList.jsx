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

const StudentExamList = () => {
  const [examList, setExamList] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const getExamStatus = (exam) => {
    const now = Date.now();
    const examStart = new Date(`${exam.exam_date}T${exam.exam_time}`).getTime();
    const examEnd = new Date(exam.endTime).getTime();

    if (now < examStart) return "Upcoming";
    if (now >= examStart && now <= examEnd) return "Ongoing";
    if (now > examEnd) return "Exam Over";
    return "Unknown";
  };

  const fetchExams = async () => {
    const userId = localStorage.getItem("userId");

    if (!userId || userId.length !== 24) {
      setErrorMsg("Invalid user ID. Please login again.");
      return;
    }

    try {
      const response = await apiService.get(`/exam/getRescheduledExams/${userId}`);
      if (response.data.success) {
        const updatedExams = response.data.exams.map((exam) => ({
          ...exam,
          exam_status: getExamStatus(exam),
        }));
        setExamList(updatedExams);
      } else {
        setErrorMsg("Failed to fetch exams.");
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
    navigate("/exams/instruction");
  };

  return (
    <>
      <PageMeta title="Student Exam List | TailAdmin" description="View upcoming and rescheduled exams" />
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
                      <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">Course Name</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">Exam Date</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">Exam Time</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">Exam Status</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">Action</TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {examList.length > 0 ? (
                      examList.map((exam) => (
                        <TableRow key={exam._id}>
                          <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">
                            {exam.course_name}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                            {new Date(exam.exam_date).toLocaleDateString("en-GB")}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                            {exam.exam_time}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-theme-sm">
                            <span className={`badge badge-pill ${
                              exam.exam_status === "Upcoming" ? "badge-success" :
                              exam.exam_status === "Ongoing" ? "badge-primary" :
                              exam.exam_status === "Exam Over" ? "badge-danger" :
                              "badge-warning"
                            }`}>
                              {exam.exam_status}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            {exam.exam_status === "Ongoing" && (
                              <Button size="sm" variant="default" onClick={() => handleStartExam(exam._id)}>
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
