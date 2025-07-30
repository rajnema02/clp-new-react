import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table/index";
import Button from "../ui/button/Button";
import PageBreadcrumb from "../common/PageBreadCrumb";
import ComponentCard from "../common/ComponentCard";
import PageMeta from "../common/PageMeta";

// Dummy data for exams
const examData = [
  {
    id: 1,
    courseName: "ReactJS Mastery",
    examDate: "2025-08-10",
    examTime: "10:00 AM",
    examStatus: "Scheduled",
  },
  {
    id: 2,
    courseName: "Node.js Fundamentals",
    examDate: "2025-08-15",
    examTime: "2:00 PM",
    examStatus: "Scheduled",
  },
];

const StudentExamList = () => {
  return (
    <>
      <PageMeta
        title="Student Exam List | TailAdmin"
        description="This is the student exam list view for exams"
      />

      <PageBreadcrumb pageTitle="Exam List" />

      <div className="space-y-6">
        <ComponentCard title="Your Exams">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Course Name
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

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {examData.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">
                        {exam.courseName}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {exam.examDate}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {exam.examTime}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {exam.examStatus}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <Button size="sm" variant="default">
                          Start Exam
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default StudentExamList;
