const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const XLSX = require("xlsx");
const QuestionModel = require("../Models/Question.model");

// ---------------- Multer Setup ----------------
function createStorage(subfolder) {
  const uploadDir = path.join(__dirname, `../uploads/${subfolder}`);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });
}

function fileFilter(req, file, cb) {
  if (path.extname(file.originalname).toLowerCase() === ".xlsx") {
    cb(null, true);
  } else {
    cb(new Error("Only .xlsx files are allowed"), false);
  }
}

const uploadQuestions = multer({ storage: createStorage("question"), fileFilter });

// ---------------- Bulk Upload Questions ----------------
router.post("/uploadBulkQuestions", uploadQuestions.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { course_type, course_name } = req.body;

    const workbook = XLSX.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    let jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (!jsonData.length) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    jsonData = jsonData.map((data) => ({
      question: data.question || "",
      regional: data.regional || "english",
      option_1: data.option_1 || "",
      option_2: data.option_2 || "",
      option_3: data.option_3 || "",
      option_4: data.option_4 || "",
     correct_answer: data.correct_answer || "",
      number_of_options: Number(data.number_of_options || 0),
      marks: Number(data.marks || 0),
      difficulty_level: data.difficulty_level || "Easy",
      created_at: new Date(),
      course_type,
      course_name: course_type === "General Question" ? "" : course_name,
      is_inactive: false
    }));

    await QuestionModel.insertMany(jsonData);

    res.status(200).json({ message: "Questions imported successfully", count: jsonData.length });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ error: error.message || "An error occurred while importing questions" });
  }
});

module.exports = router;
