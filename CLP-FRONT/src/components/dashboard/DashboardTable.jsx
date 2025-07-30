import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../components/ui/table/index";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { MoreVertical } from "lucide-react";

const tabs = [
  "Form Pending",
  "Form Filled",
  "Rejected Form",
  "Spam Form",
  "Profile Verified",
];

const students = [
  {
    id: 1,
    name: "Ashish kumar lodhi",
    status: ["Form pending", "Profile Incomplete", "Profile Spam"],
    photo: "/images/placeholders/photo.png",
    identity: "/images/placeholders/identity.png",
    receipt: "/images/placeholders/receipt.png",
    mobile: "8770084303",
    email: "ashishlodhi687@gmail.com",
    regDate: "27/07/2025 10:26 AM",
    district: "--",
    transactionId: "--",
    transactionDate: "--",
  },
  {
    id: 2,
    name: "RANJEET KUMAR KUSHWAHA",
    status: ["Form pending", "Profile Incomplete"],
    photo: "/images/placeholders/photo.png",
    identity: "/images/placeholders/identity.png",
    receipt: "/images/placeholders/receipt.png",
    mobile: "9589131576",
    email: "ranjeetkushwaha1991@gmail.com",
    regDate: "25/07/2025 04:49 PM",
    district: "--",
    transactionId: "--",
    transactionDate: "--",
  },
  {
    id: 3,
    name: "Prashant Dwivedi",
    status: ["Form pending"],
    photo: "/images/placeholders/photo.png",
    identity: "/images/placeholders/identity.png",
    receipt: "/images/placeholders/receipt.png",
    mobile: "7224092028",
    email: "prashantdwivedi9752@gmail.com",
    regDate: "21/07/2025 07:39 AM",
    district: "--",
    transactionId: "--",
    transactionDate: "--",
  },
];

export default function DashboardTable() {
  const [selectedTab, setSelectedTab] = useState("Form Pending");
  const [openActionId, setOpenActionId] = useState(null);

  const toggleActionMenu = (id) => {
    setOpenActionId((prevId) => (prevId === id ? null : id));
  };

  return (
    <div className="overflow-x-auto overflow-y-hidden w-full">
      <div className="p-6 min-w-[1100px] bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Header Tabs */}
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <div className="text-xl font-semibold text-gray-800">Students List</div>
          <div className="flex flex-wrap gap-4 items-center">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`text-sm font-medium ${
                  selectedTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                } pb-1`}
                onClick={() => setSelectedTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Export + Filter Section */}
        <div className="flex justify-between items-center mb-4">
          <Button className="bg-cyan-500 text-white hover:bg-cyan-600 text-sm">
            Export To CSV
          </Button>
          <div className="text-sm text-gray-500">
            Showing results from 1 to 20 of 631
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-6 gap-3 mb-3 text-sm">
          <input
            type="date"
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Search district"
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Transaction ID"
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="date"
            className="border border-gray-300 rounded px-3 py-2"
          />
          <div></div>
          <Button variant="outline" className="flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 100 2h14a1 1 0 100-2H3zM3 10a1 1 0 100 2h10a1 1 0 100-2H3zM3 16a1 1 0 100 2h6a1 1 0 100-2H3z" />
            </svg>
            Filter
          </Button>
        </div>

        {/* Table */}
        <Table>
          <TableHeader className="bg-gray-50 text-sm text-gray-600">
            <TableRow>
              <TableCell className="min-w-[200px]">Applicant Details</TableCell>
              <TableCell className="min-w-[120px]">Mobile</TableCell>
              <TableCell className="min-w-[180px]">Email</TableCell>
              <TableCell className="min-w-[160px]">Reg. Date</TableCell>
              <TableCell className="min-w-[120px]">District</TableCell>
              <TableCell className="min-w-[150px]">Transaction ID</TableCell>
              <TableCell className="min-w-[160px]">Transaction Date</TableCell>
              <TableCell className="min-w-[160px]">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="text-sm">
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="font-medium text-gray-800">{student.name}</div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {student.status.map((status, idx) => (
                        <Badge
                          key={idx}
                          size="sm"
                          color={
                            status.toLowerCase().includes("spam")
                              ? "destructive"
                              : status.toLowerCase().includes("incomplete")
                              ? "warning"
                              : "info"
                          }
                        >
                          {status}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-4 mt-2">
                      <div className="text-center">
                        <img
                          src={student.photo}
                          alt="photo"
                          className="w-10 h-10 object-cover border rounded"
                        />
                        <div className="text-xs text-gray-500 mt-1">Photo</div>
                      </div>
                      <div className="text-center">
                        <img
                          src={student.identity}
                          alt="identity"
                          className="w-10 h-10 object-cover border rounded"
                        />
                        <div className="text-xs text-gray-500 mt-1">Identity</div>
                      </div>
                      <div className="text-center">
                        <img
                          src={student.receipt}
                          alt="receipt"
                          className="w-10 h-10 object-cover border rounded"
                        />
                        <div className="text-xs text-gray-500 mt-1">Receipt</div>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{student.mobile}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.regDate}</TableCell>
                <TableCell>{student.district}</TableCell>
                <TableCell>{student.transactionId}</TableCell>
                <TableCell>{student.transactionDate}</TableCell>
                <TableCell className="relative">
                  <button onClick={() => toggleActionMenu(student.id)}>
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                  {openActionId === student.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border rounded z-50 p-2 text-sm">
                      <div className="cursor-pointer hover:bg-gray-100 px-3 py-1 rounded">View Receipt</div>
                      <div className="cursor-pointer hover:bg-gray-100 px-3 py-1 rounded">View Profile</div>
                      <div className="cursor-pointer hover:bg-gray-100 px-3 py-1 rounded">Update Password</div>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
