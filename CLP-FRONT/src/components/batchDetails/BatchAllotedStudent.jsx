import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiService from "../../Services/api.service";
import environment from "../../environments/environments";

// Simple CSV export function
const exportToCsv = (filename, rows) => {
  const processRow = (row) => {
    return Object.values(row)
      .map((val) => `"${val}"`)
      .join(",");
  };
  const csvFile = [Object.keys(rows[0]).join(","), ...rows.map(processRow)].join("\n");
  const blob = new Blob([csvFile], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const BatchAllotedStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batchInfo, setBatchInfo] = useState(null);
  const [userList, setUserList] = useState([]);
  const [listCount, setListCount] = useState(0);

  const page = 1;
  const limit = 1000;
  const is_inactive = false;

  useEffect(() => {
    if (id) {
      getBatchInfo();
      getUserList();
    }
    // eslint-disable-next-line
  }, [id]);

  const getBatchInfo = async () => {
    try {
      const resp = await apiService.get(`/batch/${id}`);
      setBatchInfo(resp.data);
    } catch (err) {
      console.error("Error fetching batch:", err);
    }
  };

  const getUserList = async () => {
    try {
      const queryParams = new URLSearchParams({
        page,
        limit,
        is_inactive,
        role: "user",
        is_profileVerified: true,
        batch: id,
      });
      const resp = await apiService.get(`/user?${queryParams}`);
      setUserList(resp.data.data);
      setListCount(resp.data.meta?.total || 0);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const removeFromBatch = async (userId) => {
    if (!window.confirm("Remove this student from batch?")) return;
    try {
      const data = { batch: id };
      await apiService.delete(`/user/${userId}/batch`, { data });
      getUserList();
    } catch (err) {
      console.error("Error removing from batch:", err);
    }
  };

  const handleExportCsv = () => {
    if (userList.length === 0) return alert("No students to export");
    const exportData = userList.map((user) => ({
      "Student Name": user.full_name,
      "Reg. Date": new Date(user.created_at).toLocaleString(),
      "Verified Student": user.is_profileVerified ? "Yes" : "No",
      District: user.district || "",
    }));
    exportToCsv("student_allotment.csv", exportData);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Student Allotment List</h1>

      {/* Batch Name & Actions */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Batch name : <span className="font-normal">{batchInfo?.batch_name || "Loading..."}</span>
        </h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportCsv}
            className="bg-sky-400 hover:bg-sky-500 text-white px-4 py-2 rounded shadow flex items-center"
          >
            <i className="fa fa-download mr-2" /> Export To CSV
          </button>
          <a
            href={`/batch/batch-detail/${batchInfo?._id}`}
            target="_blank"
            rel="noreferrer"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow flex items-center"
          >
            <i className="fa fa-download mr-2" /> Export to PDF
          </a>
          <a
            href={`/batch/batch-address/${batchInfo?._id}`}
            target="_blank"
            rel="noreferrer"
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded shadow flex items-center"
          >
            <i className="fa fa-download mr-2" /> Address Details
          </a>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-left text-gray-800">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-3 font-semibold">#</th>
              <th className="p-3 font-semibold">USER NAME</th>
              <th className="p-3 font-semibold">REGISTRATION DATE</th>
              <th className="p-3 font-semibold">FORM SUBMITTED</th>
              <th className="p-3 font-semibold">VERIFICATION STATUS</th>
              <th className="p-3 font-semibold">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((item, idx) => (
              <tr key={item._id} className="border-b border-gray-100">
                <td className="p-3">{idx + 1}</td>
                <td className="p-3">{item.full_name}</td>
                <td className="p-3">{new Date(item.created_at).toLocaleString()}</td>
                <td className="p-3">{item.formStatus ? "Yes" : "No"}</td>
                <td className="p-3">{item.is_profileVerified ? "Yes" : "No"}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => navigate(`/profile/${item._id}`)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded text-sm"
                  >
                    View profile
                  </button>
                  <button
                    onClick={() => removeFromBatch(item._id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {userList.length === 0 && (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BatchAllotedStudent;
