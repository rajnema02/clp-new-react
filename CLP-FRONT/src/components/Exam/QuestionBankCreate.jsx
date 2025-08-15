import React, { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import apiService from "../../Services/api.service"; // adjust path if needed
import { useNavigate } from "react-router-dom";

const QuestionBankCreate = () => {
  const navigate = useNavigate();

  const [courseList, setCourseList] = useState([]);
  const [courseType, setCourseType] = useState("");
  const [notGeneral, setNotGeneral] = useState(false);
  const [fourOption, setFourOption] = useState(true);

  const [formData, setFormData] = useState({
    course_type: "",
    course_name: "",
    number_of_options: "",
    difficulty_level: "",
    regional_language: "",
    question: "",
    option_1: "",
    option_2: "",
    option_3: "",
    option_4: "",
    correct_answer: "",
    marks: ""
  });

  // Fetch course list when course_type changes
  useEffect(() => {
    if (courseType === "General") {
      setNotGeneral(false);
      setCourseList([]);
    } else if (courseType) {
      setNotGeneral(true);
      apiService
        .get("/course", { params: { course_type: courseType } })
        .then((resp) => {
          setCourseList(resp.data.data || []);
        })
        .catch((err) => console.error("Error fetching courses:", err));
    }
  }, [courseType]);

  // Handle normal input/select changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "course_type") {
      setCourseType(value);
    }

    if (name === "number_of_options") {
      setFourOption(value === "4");
    }
  };

  // Handle CKEditor changes
  const handleEditorChange = (name, data) => {
    setFormData((prev) => ({ ...prev, [name]: data }));
  };

  // Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    apiService
      .post("/question", formData)
      .then(() => {
        navigate("/question-bank-list");
      })
      .catch((err) => console.error("Error creating question:", err));
  };

  return (
    <>
      <div className="header bg-gradient-danger pb-8 pt-5 pt-md-8">
        <div className="container-fluid">
          <div className="header-body"></div>
        </div>
      </div>

      <div className="container-fluid mt--7">
        <div className="row">
          <div className="col">
            <div className="card card-profile bg-secondary shadow">
              <div className="card-body">
                <nav
                  className="navbar navbar-light"
                  style={{ backgroundColor: "#e3f2fd" }}
                >
                  <h3>Question Master Form</h3>
                </nav>

                <div className="py-4">
                  <div className="container py-4">
                    <form onSubmit={handleSubmit}>
                      <h5>Course Type</h5>
                      <select
                        name="course_type"
                        value={formData.course_type}
                        onChange={handleChange}
                        className="form-select form-control"
                        required
                      >
                        <option value="" disabled>
                          Select Course Type
                        </option>
                        <option value="General">General Question</option>
                        <option value="Training program for Govt Organisation">
                          Training program for Govt Organisation
                        </option>
                        <option value="Special Training Program">
                          Special Training Program
                        </option>
                        <option value="Internship Program">
                          Internship Program
                        </option>
                        <option value="Regular">Regular Course</option>
                        <option value="E-Learning Course">
                          E-Learning Course
                        </option>
                      </select>

                      {notGeneral && (
                        <>
                          <h5>Course Name</h5>
                          <select
                            name="course_name"
                            value={formData.course_name}
                            onChange={handleChange}
                            className="form-control form-control-alternative"
                          >
                            <option value="" disabled>
                              Select Course Name
                            </option>
                            {courseList.map((course, i) => (
                              <option key={i} value={course.course_name}>
                                {course.course_name}
                              </option>
                            ))}
                          </select>
                        </>
                      )}

                      <h5>Number of Options</h5>
                      <select
                        name="number_of_options"
                        value={formData.number_of_options}
                        onChange={handleChange}
                        className="form-control form-control-alternative"
                      >
                        <option value="">Please Select Options</option>
                        <option value="2">2</option>
                        <option value="4">4</option>
                      </select>

                      <h5>Difficulty Level</h5>
                      <select
                        name="difficulty_level"
                        value={formData.difficulty_level}
                        onChange={handleChange}
                        className="form-control form-control-alternative"
                      >
                        <option value="">Please Select</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>

                      <h5>Question's Language</h5>
                      <select
                        name="regional_language"
                        value={formData.regional_language}
                        onChange={handleChange}
                        className="form-control form-control-alternative"
                      >
                        <option value="">Please Select</option>
                        <option value="english">English</option>
                        <option value="hindi">Hindi</option>
                      </select>

                      <div>
                        <h3>Enter question below</h3>
                        <CKEditor
                          editor={ClassicEditor}
                          data={formData.question}
                          onChange={(e, editor) =>
                            handleEditorChange("question", editor.getData())
                          }
                        />
                      </div>

                      <h3>Option 1.</h3>
                      <CKEditor
                        editor={ClassicEditor}
                        data={formData.option_1}
                        onChange={(e, editor) =>
                          handleEditorChange("option_1", editor.getData())
                        }
                      />

                      <h3>Option 2.</h3>
                      <CKEditor
                        editor={ClassicEditor}
                        data={formData.option_2}
                        onChange={(e, editor) =>
                          handleEditorChange("option_2", editor.getData())
                        }
                      />

                      {fourOption && (
                        <>
                          <h3>Option 3.</h3>
                          <CKEditor
                            editor={ClassicEditor}
                            data={formData.option_3}
                            onChange={(e, editor) =>
                              handleEditorChange("option_3", editor.getData())
                            }
                          />

                          <h3>Option 4.</h3>
                          <CKEditor
                            editor={ClassicEditor}
                            data={formData.option_4}
                            onChange={(e, editor) =>
                              handleEditorChange("option_4", editor.getData())
                            }
                          />
                        </>
                      )}

                      <h3>Correct Option</h3>
                      <input
                        type="text"
                        name="correct_answer"
                        value={formData.correct_answer}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Please Enter Correct Option"
                      />

                      <h3>Marks</h3>
                      <input
                        type="text"
                        name="marks"
                        value={formData.marks}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Please Enter Marks"
                      />

                      <div className="d-grid gap-2 col-6 mx-auto mt-3">
                        <button className="btn btn-success" type="submit">
                          Create Question
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuestionBankCreate;
