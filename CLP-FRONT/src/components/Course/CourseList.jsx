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

// Dummy course data
const courseData = [
  {
    id: 1,
    courseCode: "CS101",
    courseType: "Online",
    courseName: "Introduction to React",
    courseFees: "₹5,000",
    courseDuration: "6 weeks",
  },
  {
    id: 2,
    courseCode: "CS201",
    courseType: "Offline",
    courseName: "Advanced Node.js",
    courseFees: "₹8,000",
    courseDuration: "8 weeks",
  },
];

const CourseList = () => {
  return (
    <>
      <PageMeta
        title="Course List | TailAdmin"
        description="This is the course list page in TailAdmin"
      />
      <PageBreadcrumb pageTitle="Courses" />

      <div className="space-y-6">
        <ComponentCard title="Courses Table">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Course Code
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Course Type
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Course Name
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Course Fees
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Course Duration
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {courseData.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">
                        {course.courseCode}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {course.courseType}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {course.courseName}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {course.courseFees}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {course.courseDuration}
                      </TableCell>
                      <TableCell className="px-5 py-4 space-x-2 flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary">
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive">
                          Delete
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

export default CourseList;
