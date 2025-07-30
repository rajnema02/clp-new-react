import React from "react";
import { Download, Upload } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "../../components/ui/table/index";
import Button from "../../components/ui/button/Button";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

const BulkUploadList = () => {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Title and Download Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-100 p-4 rounded">
        <h2 className="text-xl font-bold text-gray-800">Questions Upload</h2>
        <Button variant="default" className="mt-4 sm:mt-0 bg-cyan-400 hover:bg-cyan-500 text-white">
          <Download className="mr-2 h-4 w-4" />
          Download Sample Format
        </Button>
      </div>

      {/* Main Upload Form and Notes */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Upload Form */}
        <div className="flex-1 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Course Type</label>
            <select className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300">
              <option>Select Course Type</option>
              <option>Online</option>
              <option>Offline</option>
            </select>
          </div>

          <div>
            <input type="file" className="block w-full text-sm text-gray-600 border border-gray-300 rounded px-3 py-2 file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200" />
          </div>

          <Button className="bg-rose-300 hover:bg-rose-400 text-white">
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>

        {/* Right Notes Section */}
        <div className="bg-blue-100 rounded p-4 lg:max-w-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Notes</h3>
          <ul className="list-decimal list-inside text-gray-600 space-y-1 text-sm">
            <li>Click here to download sample format.</li>
            <li>
              Check uploaded questions count with detected count to ensure all
              data is processed.
            </li>
          </ul>
          <p className="mt-2 text-gray-600 text-sm">
            Click on process button after ensuring all data is accurate as per
            your knowledge.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadList;
