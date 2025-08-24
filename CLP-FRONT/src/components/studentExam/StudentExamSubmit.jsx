import React from "react";
import { useNavigate } from "react-router-dom";

const StudentExamSubmit = () => {
  const navigate = useNavigate();

  const goBackToHome = () => {
    navigate("/student-dashboard");
  };

  return (
    <div className="submit">
      <div className="container mt-7 pb-5">
        <div className="row justify-content-center">
          <div className="col-lg-12 col-md-8">
            <div className="card bg-secondary shadow border-0">
              <div className="card-header bg-transparent">
                <h1 className="text-red">
                  Your Exam Has Been Successfully Submitted!! <br />
                  Your Result will be Announced within next 2 Working days!!
                </h1>
                <br />
              </div>
              <div className="card-body">
                <hr />
                <div className="row">
                  <div className="col text-left">
                    <button
                      className="btn btn-secondary"
                      onClick={goBackToHome}
                    >
                      <i className="fa fa-angle-left" aria-hidden="true"></i>{" "}
                      Go Back To Home
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentExamSubmit;
