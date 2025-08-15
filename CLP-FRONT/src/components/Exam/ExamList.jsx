import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table/index";
import Button from "../../components/ui/button/Button";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import apiService from "../../Services/api.service";
import { Navigate } from "react-router";
import { useNavigate } from "react-router-dom";

const ExamList = () => {
  const [examData, setExamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch exam list from API
  const fetchExamList = async () => {
    try {
      const res = await apiService.get("/exam/getList");
      if (res.data && res.data.data) {
        setExamData(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching exam list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExamList();
  }, []);

  return (
    <>
      <PageMeta
        title="Exam List | TailAdmin"
        description="This is the exam list table page in TailAdmin"
      />

      <PageBreadcrumb pageTitle="Exam List" />
      
      <div className="space-y-6">
        <ComponentCard title="Exam List">
        <Button size="sm" variant="primary" onClick={() => navigate("/schedule-exam-list")}>
                    + Create Exam
      </Button>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              {loading ? (
                <p className="p-4 text-center text-gray-500">Loading exams...</p>
              ) : (
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                        Exam Name
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                        Exam Code
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                        Course Type
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                        Batch Name
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                        Exam Date
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                        Exam Time
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                        Exam Status
                      </TableCell>
                      <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHeader>

                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {examData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="px-5 py-4 text-center text-gray-500">
                          No exams found
                        </TableCell>
                      </TableRow>
                    ) : (
                      examData.map((exam) => (
                        <TableRow key={exam._id}>
                          <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">
                            {exam.exam_name}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                            {exam.exam_code}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                            {exam.course_type}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                            {exam.batch_id?.batch_name || "N/A"}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                            {new Date(exam.exam_date).toLocaleDateString("en-GB")}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                            {exam.exam_time}
                          </TableCell>
                          <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                            <span
                              className={`px-2 py-1 rounded text-white text-xs ${
                                exam.exam_status === "upcoming"
                                  ? "bg-green-500"
                                  : "bg-red-400"
                              }`}
                            >
                              {exam.exam_status.toUpperCase()}
                            </span>
                          </TableCell>
                          <TableCell className="px-5 py-4">
                            <Button size="sm" variant="default">
                              Show Result
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
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

export default ExamList;
