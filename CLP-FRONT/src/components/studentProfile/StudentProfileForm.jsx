import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaPrint } from "react-icons/fa";
import apiService from "../../Services/api.service";
import environment from "../../environments/environments";

const StudentProfileForm = () => {
  const [courseUserData, setCourseUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return console.error("User ID not found in localStorage.");
        const res = await apiService.get(`/user/${userId}`);
        setCourseUserData(res.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const fileUrl = (path) => (path ? `${environment.apiUrl}/${path}` : "/no-image");

  const handlePrint = () => {
    const printContents = document.getElementById("printArea").innerHTML;
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write("<html><head><title>Print</title></head><body>");
    printWindow.document.write(printContents);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  if (loading) return <div className="text-center my-5">Loading...</div>;

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between mb-3 print-hidden">
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <FaArrowLeft className="mr-2" /> Back
        </button>
        <button className="btn btn-success" onClick={handlePrint}>
          <FaPrint className="mr-2" /> Print
        </button>
      </div>

      <div className="card shadow-lg p-4" id="printArea">
        <style>{`
          @media print {
            .print-hidden { display: none !important; }
          }
          .label-title {
            font-weight: bold;
            color: #1a1a40;
          }
        `}</style>

        <h5 className="label-title mb-3">User information</h5>
        <div className="row">
          <Info label="Name" value={courseUserData.full_name} />
          <Info label="Father's name" value={courseUserData.father_name} />
          <Info label="Email" value={courseUserData.email} />
          <Info label="Phone" value={courseUserData.mobile} />
          <ImageView src={fileUrl(courseUserData.profile_photo)} label="Profile Photo" />
        </div>

        <hr />
        <h5 className="label-title mb-3">Correspondence Address</h5>
        <div className="row">
          <Info label="Address" value={courseUserData.home_address} />
          <Info label="State" value={courseUserData.state} />
          <Info label="City" value={courseUserData.city} />
          <Info label="Pin Code" value={courseUserData.postal_code} />
        </div>

        <div className="row mt-3">
          <Info label="Is identity pic uploaded?" value={courseUserData.profile_photo ? "Yes" : "No"} />
        </div>

        <hr />
        <h6 className="label-title mb-3">Course Detail:</h6>
        <div className="row">
          <Info label="Course Detail" value={courseUserData.course_code} />
          <ImageView src={fileUrl(courseUserData.payment_file)} label="Payment Slip" />
        </div>

        <hr />
        <h5 className="label-title mb-3">Department/Org. Name</h5>
        <div className="row">
          <Info label="Department" value={courseUserData.department} />
          <Info label="Employee Type" value={courseUserData.employeeType} />
          <Info label="Company Type" value={courseUserData.companyType} />
          <Info label="Company" value={courseUserData.company} />
          <Info label="Block" value={courseUserData.block} />
          <Info label="State" value={courseUserData.state} />
          <Info label="District" value={courseUserData.district} />
          <Info label="Pin Code" value={courseUserData.pin_code} />
        </div>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="col-md-4 mb-3">
    <strong>{label}:</strong> <span className="ml-2">{value || "-"}</span>
  </div>
);

const ImageView = ({ src, label }) => (
  <div className="col-md-4 mb-3 text-center">
    <strong>{label}</strong>
    <div>
      <img
        src={src}
        alt={label}
        className="img-thumbnail mt-1"
        style={{ width: "120px", height: "100px", objectFit: "cover" }}
      />
      <p className="text-muted">No image</p>
    </div>
  </div>
);

export default StudentProfileForm;