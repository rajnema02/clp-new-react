import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../../Services/api.service";
import Button from "../../components/ui/button/Button";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  const fetchDepartments = async () => {
    try {
      const res = await apiService.get("/department");
      if (res?.data) {
        setDepartments(res.data);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Do you really want to disable this data?")) {
      try {
        const res = await apiService.delete(`/department/${id}`);
        if (res) {
          alert("Data is successfully disabled.");
          fetchDepartments();
        }
      } catch (error) {
        console.error("Error disabling department:", error);
      }
    }
  };

  useEffect(() => {
  const fetchDepartments = async () => {
    try {
      const res = await apiService.get("/department");
      if (Array.isArray(res.data?.data)) {
        setDepartments(res.data.data);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
    }
  };

  fetchDepartments();
}, []);

  return (
    <>
      <PageMeta title="Department List" />
      <PageBreadcrumb items={["Master", "Department List"]} />
      <ComponentCard title="Department">
        <div className="flex justify-end mb-4">
          <Button onClick={() => navigate("/department-create")} variant="success">
            + New Department
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 font-semibold">Sr. No</th>
                <th className="px-4 py-2 font-semibold">Department Title</th>
                <th className="px-4 py-2 font-semibold">Department Description</th>
                <th className="px-4 py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {departments?.map((item, index) => (
                <tr key={item._id}>
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2">
                    {/* Edit option if needed */}
                    {/* <Button className="mr-2" variant="warning">Edit</Button> */}
                    <Button
                      onClick={() => handleDelete(item._id)}
                      variant="danger"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {departments.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    No departments found.
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

export default DepartmentList;
