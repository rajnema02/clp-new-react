import axios from "axios";

const API_URL = "http://localhost:3000/questionFile";

const uploadBulkQuestions = async (file, courseType, courseName) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("course_type", courseType);
  formData.append("course_name", courseName);

  const resp = await axios.post(`${API_URL}/uploadBulkQuestions`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return resp.data;
};

export default { uploadBulkQuestions };
