import React from "react";
import Button from "../../components/ui/button/Button";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

const ScheduleExamList = () => {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Meta & Breadcrumb */}
      <PageMeta title="Schedule Exam" description="Create and schedule new exams" />
      <PageBreadcrumb pageTitle="Schedule Exam" />

      {/* Form Card */}
      <ComponentCard title="Schedule Exam">
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Exam Name */}
          <input
            type="text"
            placeholder="Exam Name"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />

          {/* Exam Code */}
          <input
            type="text"
            placeholder="Exam Code"
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
          />

          {/* Course Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Course Type
            </label>
            <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300">
              <option>Select Course Type</option>
              <option>Online</option>
              <option>Offline</option>
            </select>
          </div>

          {/* Course Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Course Name
            </label>
            <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300">
              <option>Select Course name</option>
              <option>React JS</option>
              <option>Node JS</option>
            </select>
          </div>

          {/* Batch Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Batch Name:
            </label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 resize-none focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* Exam Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Exam Date:
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* Exam Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Exam Time:
            </label>
            <input
              type="time"
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* Exam Duration */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Exam Duration (in minutes):
            </label>
            <input
              type="number"
              placeholder="Duration"
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring focus:border-blue-300"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2">
            <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">
              Schedule Exam
            </Button>
          </div>
        </form>
      </ComponentCard>
    </div>
  );
};

export default ScheduleExamList;
