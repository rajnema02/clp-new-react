import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiService from "../../Services/api.service";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";

const AboutProgramList = () => {
  const [courseList, setCourseList] = useState([]);
  const env = {
    url: import.meta.env.VITE_API_URL || "http://localhost:3000",
  };

  useEffect(() => {
    getProgramList();
  }, []);

  const getProgramList = async () => {
    try {
      const resp = await apiService.get("/about-program");
      if (resp?.data?.data) {
        setCourseList(resp.data.data);
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const disableMessage = async (id) => {
    const confirmDelete = window.confirm("Do you really want to disable this message?");
    if (!confirmDelete) return;

    try {
      const resp = await apiService.delete(`/about-program/${id}`);
      if (resp) {
        alert("Message is successfully disabled.");
        getProgramList();
      }
    } catch (error) {
      console.error("Error deleting program:", error);
    }
  };

  return (
    <>
      <PageMeta title="About Program" />
      <PageBreadcrumb title="About Program List" />
      <ComponentCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">About Program</h3>
          <Link to="/about-program-create">
            <Button variant="success">+ New Program</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Sr. No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Program Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Program File</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {courseList.length > 0 ? (
                courseList.map((item, index) => (
                  <tr key={item._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      <a
                        href={`${env.url}${item.file || "no-image"}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        <i className="fa fa-download"></i> View File
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => disableMessage(item._id)}
                      >
                        <i className="fas fa-trash mr-1"></i> Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                    No programs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ComponentCard>
    </>
  );
};

export default AboutProgramList;
