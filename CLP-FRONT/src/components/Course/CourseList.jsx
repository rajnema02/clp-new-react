import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../Services/api.service";
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

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    apiService
      .get("/course")
      .then((res) => {
        setCourses(res.data.data || []);
      })
      .catch((err) => console.error("Error fetching courses", err));
  };

  const handleDelete = async (id) => {
  if (window.confirm("Are you sure you want to permanently delete this course?")) {
    console.log("Deleting course:", id); // Debug
    try {
      const res = await apiService.delete(`/course/${id}`);
      if (res.data.success) {
        alert("Course deleted successfully.");
        setCourses((prev) => prev.filter((c) => c._id !== id));
      } else {
        alert(res.data.message || "Delete failed.");
      }
    } catch (err) {
      console.error("Error deleting course:", err.response?.data || err.message);
      alert("An error occurred while deleting the course.");
    }
  }
};


  return (
    <>
      <PageMeta
        title="Course List "
        description="This is the course list page in CLP"
      />
      <PageBreadcrumb pageTitle="Course List" />

      <div className="space-y-6">
        <ComponentCard
          title="Course List"
          action={
            <Button size="sm" variant="primary" onClick={() => navigate("/course-create")}>
              Create Course
            </Button>
          }
        >
        <Button size="sm" variant="primary" onClick={() => navigate("/course-create")}>
              Create Course
            </Button>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto"> 
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">Course Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">Course Code</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">Type</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">Duration</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">Fees</TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">Action</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {courses.length > 0 ? (
                    courses.map((course) => (
                      <TableRow key={course._id}>
                        <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">{course.course_name}</TableCell>
                        <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{course.course_code}</TableCell>
                        <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{course.course_type}</TableCell>
                        <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{course.course_duration}</TableCell>
                        <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">{course.fees}</TableCell>
                        <TableCell className="px-5 py-4 flex gap-2">
                          <Button size="sm" variant="default" onClick={() => navigate(`/course-edit/${course._id}`)}>Edit</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(course._id)}>Delete</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="px-5 py-4 text-center text-gray-500 dark:text-gray-400">
                        No courses found.
                      </TableCell>
                    </TableRow>
                  )}
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
