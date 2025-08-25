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
import { useNavigate } from "react-router-dom";

const ExamList = () => {
  const [examData, setExamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Convert date to timestamp
  const timeInSeconds = (date) => new Date(date).getTime();

  // Difference in ms
  const timeDifference = (date1, date2) => new Date(date2).getTime() - new Date(date1).getTime();

  const fetchExamList = async () => {
    try {
      const res = await apiService.get("/exam/getList");
      if (res.data && res.data.data) {
        const exams = res.data.data;

        // Process each exam like Angular does
        const updatedExams = await Promise.all(
          exams.map(async (exam) => {
            let newExamDate = new Date(exam.exam_date);

            // extract hours & minutes
            const [examStartHours, examStartMinutes] = exam.exam_time?.split(":").map(Number) || [0, 0];
            newExamDate.setHours(examStartHours);
            newExamDate.setMinutes(examStartMinutes);

            const today = new Date();

            // calculate exam end time
            const duration = parseInt(exam.exam_duration || "0", 10);
            const examEndTime = new Date(newExamDate.getTime() + duration * 60000);

            // Calculate status
            const diffStart = timeDifference(today, newExamDate);
            const diffEnd = timeDifference(today, examEndTime);

            if (diffStart > 0) {
              exam.exam_status = "Upcoming";
            } else if (diffStart <= 0 && diffEnd > 0) {
              exam.exam_status = "Ongoing";
            } else if (diffEnd <= 0) {
              exam.exam_status = "Exam Over";
            }

            // Fetch batch name (first batch only like Angular)
            if (exam.batch_id && exam.batch_id.length > 0) {
              try {
                const batchRes = await apiService.get(`/batch/${exam.batch_id[0]}`);
                exam.batch_name = batchRes.data?.batch_name || "N/A";
              } catch (err) {
                exam.batch_name = "N/A";
              }
            } else {
              exam.batch_name = "N/A";
            }

            return exam;
          })
        );

        setExamData(updatedExams);
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
        title="Exam List"
        description="This is the exam list table page in Clp"
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
                      <TableCell isHeader>Exam Name</TableCell>
                      <TableCell isHeader>Exam Code</TableCell>
                      <TableCell isHeader>Course Type</TableCell>
                      <TableCell isHeader>Batch Name</TableCell>
                      <TableCell isHeader>Exam Date</TableCell>
                      <TableCell isHeader>Exam Time</TableCell>
                      <TableCell isHeader>Exam Status</TableCell>
                      <TableCell isHeader>Action</TableCell>
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
                          <TableCell>{exam.exam_name}</TableCell>
                          <TableCell>{exam.exam_code}</TableCell>
                          <TableCell>{exam.course_type}</TableCell>
                          <TableCell>{exam.batch_name}</TableCell>
                          <TableCell>
                            {new Date(exam.exam_date).toLocaleDateString("en-GB")}
                          </TableCell>
                          <TableCell>{exam.exam_time}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded text-white text-xs ${
                                exam.exam_status === "Upcoming"
                                  ? "bg-green-500"
                                  : exam.exam_status === "Ongoing"
                                  ? "bg-blue-500"
                                  : "bg-red-500"
                              }`}
                            >
                              {exam.exam_status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {exam.exam_status === "Exam Over" && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => navigate(`/result-list/${exam._id}`)}
                              >
                                Show Result
                              </Button>
                            )}
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
