import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiService from "../../Services/api.service";

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const navigate = useNavigate();

  const fetchBatches = () => {
    apiService
      .get("/batch")
      .then((res) => {
        // Handle both array and {data: array} cases
        const fetched = Array.isArray(res.data) ? res.data : res.data.data || [];
        setBatches(fetched);
      })
      .catch((err) => console.error("Failed to fetch batches", err));
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this batch?")) return;
    try {
      await apiService.delete(`/batch/${id}`);
      fetchBatches();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete batch");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Batches</h2>
        <Link
          to="/batch-create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          + Create New Batch
        </Link>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Batch Name",
                "Course Type",
                "Course Name",
                "Batch Days",
                "Batch Start Time",
                "Batch End Time",
                "Total Questions",
                "% Course Questions",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {batches.length > 0 ? (
              batches.map((batch) => (
                <tr
                  key={batch._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2 border-b">{batch.batch_name}</td>
                  <td className="px-4 py-2 border-b">{batch.course_type}</td>
                  <td className="px-4 py-2 border-b">{batch.course_name}</td>
                  {/* <td className="px-4 py-2 border-b">{batch.course_code}</td>
                  <td className="px-4 py-2 border-b">{batch.disclaimer}</td> */}
                  <td className="px-4 py-2 border-b">
                    {(batch.days || []).join(", ")}
                  </td>
                  {/* <td className="px-4 py-2 border-b">{batch.startDate}</td>
                  <td className="px-4 py-2 border-b">{batch.endDate}</td> */}
                  <td className="px-4 py-2 border-b">{batch.startTime}</td>
                  <td className="px-4 py-2 border-b">{batch.endTime}</td>
                  {/* <td className="px-4 py-2 border-b">
                    {batch.is_exam ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {batch.isAuditExam ? "Yes" : "No"}
                  </td> */}
                  <td className="px-4 py-2 border-b">
                    {batch.total_no_of_questions ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {batch.percent_of_course_questions ?? "-"}
                  </td>
                  <td className="px-4 py-2 border-b flex gap-2">
                  <Link
                      to={`/batch-alloted-student/${batch._id}`}
                      className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      View Alloted Students
                    </Link>
                    <Link
                      to={`/batch-allotment/${batch._id}`}
                      className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Allot Batch
                    </Link>

                    <Link
                      to={`/batch-edit/${batch._id}`}
                      className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(batch._id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="15"
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No batches found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BatchList;
