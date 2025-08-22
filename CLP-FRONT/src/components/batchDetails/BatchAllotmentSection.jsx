import React, { useEffect, useState } from "react";
import apiService from "../../Services/api.service";
import { useParams } from "react-router-dom";

const BatchAllotmentSection = () => {
  const { id } = useParams();
  const [batchList, setBatchList] = useState(null);
  const [userList, setUserList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState([]);

  const page = 1;
  const limit = 10000;
  const is_inactive = false;

  const getBatchId = async () => {
    try {
      const resp = await apiService.get(`/batch/${id}`);
      setBatchList(resp.data);
    } catch (error) {
      console.error("Error fetching batch:", error);
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
      });

      const resp = await apiService.get(`/user/batchAllotmentList?${queryParams}`);
      const list = resp.data.data;
      setUserList(list);

      const preSelected = list.filter((o) => o.batch === id).map((o) => o._id);
      setSelectedStudent(preSelected);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (id) {
      getBatchId();
      getUserList();
    }
  }, [id]);

  const selectStud = (stdId) => {
    setSelectedStudent((prev) =>
      prev.includes(stdId) ? prev.filter((o) => o !== stdId) : [...prev, stdId]
    );
  };

  const isSelected = (stdId) => selectedStudent.includes(stdId);

  const allotToBatch = async () => {
    if (!window.confirm("Are you Sure !!!")) return;
    try {
      // Fixed: Pass the data as the request body, not as part of the URL
      const data = { batch: selectedStudent };
      const resp = await apiService.put(`/user/batch/${id}`, data);
      if (resp) {
        alert("Students are allocated in batch Successfully");
        getUserList();
      }
    } catch (error) {
      console.error("Error allotting batch:", error);
    }
  };

  return (
    <div className="p-6">
      {/* Title Section */}
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Batch Allotment Section</h1>

      {/* Batch name & button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          Batch name : <span className="font-normal">{batchList?.batch_name || "Loading..."}</span>
        </h3>

        {selectedStudent.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              <b>{selectedStudent.length}</b> Students Selected
            </span>
            <button
              onClick={allotToBatch}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Allot Students to the Batch
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full text-left text-gray-800">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-3 w-12"></th>
              <th className="p-3 font-semibold">USER NAME</th>
              <th className="p-3 font-semibold">REGISTRATION DATE</th>
              <th className="p-3 font-semibold">FORM SUBMITTED</th>
              <th className="p-3 font-semibold">VERIFICATION STATUS</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((item) => (
              <tr
                key={item._id}
                onClick={() => selectStud(item._id)}
                className={`cursor-pointer border-b border-gray-100 hover:bg-gray-100 ${
                  isSelected(item._id) ? "bg-gray-200" : ""
                }`}
              >
                <td className="p-3">
                  <input
                    type="checkbox"
                    checked={isSelected(item._id)}
                    onChange={() => selectStud(item._id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 accent-red-500"
                  />
                </td>
                <td className="p-3">{item.full_name}</td>
                <td className="p-3">{new Date(item.created_at).toLocaleString()}</td>
                <td className="p-3">{item.formStatus ? "Yes" : "No"}</td>
                <td className="p-3">{item.is_profileVerified ? "Yes" : "No"}</td>
              </tr>
            ))}

            {userList.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No students available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BatchAllotmentSection;