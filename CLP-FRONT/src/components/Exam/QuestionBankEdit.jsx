import React, { useState, useEffect } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import apiService from "../../Services/api.service";
import { useNavigate, useParams } from "react-router-dom";

const QuestionBankEdit = () => {
  const { id } = useParams();
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
    marks: "",
  });

  // Fetch existing question data
  useEffect(() => {
    apiService
      .get(`/question/${id}`)
      .then((resp) => {
        const data = resp.data;
        setFormData(data);
        setCourseType(data.course_type);
        setFourOption(data.number_of_options === "4");
        setNotGeneral(data.course_type !== "General");

        // If course type is not General, fetch course list
        if (data.course_type !== "General") {
          apiService
            .get("/course", { params: { course_type: data.course_type } })
            .then((resp) => setCourseList(resp.data.data || []));
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "course_type") {
      setCourseType(value);
      setNotGeneral(value !== "General");

      if (value !== "General") {
        apiService
          .get("/course", { params: { course_type: value } })
          .then((resp) => setCourseList(resp.data.data || []));
      } else {
        setCourseList([]);
      }
    }

    if (name === "number_of_options") setFourOption(value === "4");
  };

  const handleEditorChange = (name, data) => {
    setFormData((prev) => ({ ...prev, [name]: data }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    apiService
      .put(`/question/${id}`, formData)
      .then(() => navigate("/question-bank-list"))
      .catch((err) => console.error(err));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Question</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Course Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course Type
            </label>
            <select
              name="course_type"
              value={formData.course_type}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select Course Type</option>
              <option value="General">General Question</option>
              <option value="Training program for Govt Organisation">
                Training program for Govt Organisation
              </option>
              <option value="Special Training Program">Special Training Program</option>
              <option value="Internship Program">Internship Program</option>
              <option value="Regular">Regular Course</option>
              <option value="E-Learning Course">E-Learning Course</option>
            </select>
          </div>

          {/* Course Name */}
          {notGeneral && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Name
              </label>
              <select
                name="course_name"
                value={formData.course_name}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Course Name</option>
                {courseList.map((course, i) => (
                  <option key={i} value={course.course_name}>
                    {course.course_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Number of Options, Difficulty, Language */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Options
              </label>
              <select
                name="number_of_options"
                value={formData.number_of_options}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Options</option>
                <option value="2">2</option>
                <option value="4">4</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty Level
              </label>
              <select
                name="difficulty_level"
                value={formData.difficulty_level}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                name="regional_language"
                value={formData.regional_language}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Language</option>
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
              </select>
            </div>
          </div>

          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
            <CKEditor
              editor={ClassicEditor}
              data={formData.question}
              onChange={(e, editor) => handleEditorChange("question", editor.getData())}
            />
          </div>

          {/* Options */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Option 1</label>
              <CKEditor
                editor={ClassicEditor}
                data={formData.option_1}
                onChange={(e, editor) => handleEditorChange("option_1", editor.getData())}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Option 2</label>
              <CKEditor
                editor={ClassicEditor}
                data={formData.option_2}
                onChange={(e, editor) => handleEditorChange("option_2", editor.getData())}
              />
            </div>
            {fourOption && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Option 3</label>
                  <CKEditor
                    editor={ClassicEditor}
                    data={formData.option_3}
                    onChange={(e, editor) => handleEditorChange("option_3", editor.getData())}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Option 4</label>
                  <CKEditor
                    editor={ClassicEditor}
                    data={formData.option_4}
                    onChange={(e, editor) => handleEditorChange("option_4", editor.getData())}
                  />
                </div>
              </>
            )}
          </div>

          {/* Correct Answer & Marks */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
              <input
                type="text"
                name="correct_answer"
                value={formData.correct_answer}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
              <input
                type="number"
                name="marks"
                value={formData.marks}
                onChange={handleChange}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow hover:bg-indigo-700 transition"
            >
              Update Question
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionBankEdit;
