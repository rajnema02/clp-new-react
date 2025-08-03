import React from 'react';
import Button from "../../components/ui/button/Button";

const StudentDashboard = () => {
  return (
    <div className="p-6">
      {/* Header Banner */}
      <div className="flex justify-center items-center bg-blue-100 rounded-xl py-6 mb-10">
        <div className="flex flex-col items-center">
          <img 
            src="/path-to-your-logo.png" // Replace this with the actual path to the CEDMAP logo
            alt="CEDMAP Logo" 
            className="h-20 mb-4" 
          />
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-800">Student CLP Exam Portal</h1>
            <h2 className="text-xl font-semibold text-gray-800">Madhya Pradesh (CLP)</h2>
            <p className="text-sm text-gray-600">Under Department of MSME, Govt of Madhya Pradesh</p>
          </div>
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
        <Button variant="outline" size="lg" className="w-full">
          Demo Exam
        </Button>
        <Button variant="outline" size="lg" className="w-full text-blue-600">
          Open Demo Exam
        </Button>
        <Button variant="outline" size="lg" className="w-full">
          Certificate
        </Button>
        <Button variant="outline" size="lg" className="w-full text-red-500">
          No certificates generated yet!!!!!
        </Button>
      </div>
    </div>
  );
};

export default StudentDashboard;
