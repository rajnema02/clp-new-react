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

// Dummy batch data
const batchData = [
  {
    id: 1,
    batchName: "Frontend Bootcamp",
    courseType: "Online",
    courseName: "ReactJS Mastery",
    startTime: "2025-08-01",
    endTime: "2025-09-30",
    batchDays: "Mon, Wed, Fri",
    totalQuestions: 150,
    courseQuestionPercentage: 80,
  },
  {
    id: 2,
    batchName: "Backend Essentials",
    courseType: "Offline",
    courseName: "Node.js Fundamentals",
    startTime: "2025-07-15",
    endTime: "2025-10-15",
    batchDays: "Tue, Thu",
    totalQuestions: 120,
    courseQuestionPercentage: 60,
  },
];

const BatchDetails = () => {
  return (
    <>
      <PageMeta
        title="Batch Details Table | TailAdmin"
        description="This is the batch details table page in TailAdmin"
      />

      <PageBreadcrumb pageTitle="Batch Details" />

      <div className="space-y-6">
        <ComponentCard title="Batch List">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Batch Name
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Course Type
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Course Name
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Batch Start Time
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Batch End Time
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Batch Days
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Total Questions
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      % of Course Questions
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {batchData.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">
                        {batch.batchName}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {batch.courseType}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {batch.courseName}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {batch.startTime}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {batch.endTime}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {batch.batchDays}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {batch.totalQuestions}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {batch.courseQuestionPercentage}%
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline">
                            View Allotted
                          </Button>
                          <Button size="sm" variant="default">
                            Allot Batch
                          </Button>
                          <Button size="sm" variant="secondary">
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive">
                            Delete
                          </Button>
                        </div>
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

export default BatchDetails;