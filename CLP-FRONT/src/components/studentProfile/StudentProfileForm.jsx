import React from "react";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

const StudentProfileForm = () => {
  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <PageMeta title="User Profile" description="Student profile details" />
      <PageBreadcrumb pageTitle="Student Profile" />

      <ComponentCard title="User Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div><strong>Name:</strong> deepesh</div>
          <div><strong>Father's name:</strong> rajesh</div>
          <div><strong>Email:</strong> deepesh@gmail.com</div>
          <div><strong>Phone:</strong> 9522868685</div>
        </div>
      </ComponentCard>

      <ComponentCard title="Correspondence Address">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="md:col-span-3"><strong>Address:</strong> house no 106 aishbagh bhopal</div>
          <div><strong>State:</strong> Madhya Pradesh</div>
          <div><strong>City:</strong> bhopal</div>
          <div><strong>Pin Code:</strong> 462010</div>
          <div><strong>Is identity pic uploaded?</strong> Yes</div>
          <div className="md:col-span-3">
            <img
              src="/images/id-pic.png"
              alt="Identity"
              className="w-40 border border-gray-300 mt-2"
            />
          </div>
        </div>
      </ComponentCard>

      <ComponentCard title="Course Detail">
        <div className="text-sm">
          <strong className="block">Course:</strong>
          <span>Cyber Security Management & Compliance-CEDCLPCS-100</span>
        </div>
      </ComponentCard>

      <ComponentCard title="Department / Org. Name">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div><strong>Department:</strong> Others</div>
          <div><strong>Employee Type:</strong> Government Officers</div>
          <div><strong>Company Type:</strong> </div>
          <div><strong>Block:</strong> bhopal</div>
          <div><strong>District:</strong> Bhopal</div>
          <div><strong>State:</strong> Madhya Pradesh</div>
          <div><strong>Pin Code:</strong> 462010</div>
          <div className="md:col-span-3">
            <img
              src="/images/address-proof.png"
              alt="Proof"
              className="w-40 border border-gray-300 mt-2"
            />
          </div>
        </div>
      </ComponentCard>
    </div>
  );
};

export default StudentProfileForm;
