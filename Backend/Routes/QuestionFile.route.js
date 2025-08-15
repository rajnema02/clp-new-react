const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const XLSX = require("xlsx");
const QuestionModel = require("../Models/Question.model");
const DepartmentModel = require("../Models/Department.model");

// ================= Multer Storage Setup =================
function createStorage(subfolder) {
  const uploadDir = path.join(__dirname, `../uploads/${subfolder}`);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
}

// Allow only .xlsx
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".xlsx") {
    cb(null, true);
  } else {
    cb(new Error("Only .xlsx files are allowed"), false);
  }
}

// Multer uploaders
const uploadQuestions = multer({ storage: createStorage("question"), fileFilter });
const uploadDepartments = multer({ storage: createStorage("department"), fileFilter });

// ================= Bulk Upload Questions =================
router.post("/uploadBulkQuestions", uploadQuestions.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const { course_type, course_name } = req.body;

    const workbook = XLSX.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    let jsonData = XLSX.utils.sheet_to_json(worksheet);

    // Normalize and ensure required fields
    jsonData = jsonData.map((data) => ({
      ...data,
      created_at: new Date(),
      course_type,
      course_name,
      marks: data.marks != null && data.marks !== "" ? Number(data.marks) : 0 // Default to 0 if missing
    }));

    await QuestionModel.insertMany(jsonData);

    res.status(200).json({ message: "Questions imported successfully" });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ error: error.message || "An error occurred while importing questions" });
  }
});

// ================= Bulk Upload Departments =================
router.post("/uploadBulkDepartment", uploadDepartments.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = XLSX.readFile(req.file.path);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet).map((data) => ({
      ...data,
      created_at: new Date(),
    }));

    await DepartmentModel.insertMany(jsonData);

    res.status(200).json({ message: "Departments imported successfully" });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ error: error.message || "An error occurred while importing departments" });
  }
});

module.exports = router;
