const router = require("express").Router();
const { verifyAccessToken } = require("../Helpers/jwt_helper");
const QuestionController = require("../Controllers/QuestionFile.controller");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
const express = require("express");
const upload = multer({ dest: "uploads/" });
const QuestionModel = require("../Models/Question.model");
const DepartmentModel = require("../Models/Department.model");
const XLSX = require('xlsx');

router.post("/uploadBulkQuestions", upload.single("file"), (req, res) => {
    try {
  // The uploaded file is available at req.file.path
  const filePath = req.file.path;
  const fileData = JSON.parse(req.body.data);
// console.log(fileData);

  // Pass the file path to the Excel parsing logic
  // Handle parsing and saving to MongoDB here
  // Read the Excel file
  const workbook = XLSX.readFile(filePath);

  // Extract the first worksheet from the workbook
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  // Convert the worksheet data to JSON format
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
 // console.log(jsonData);
 for(let data of jsonData){
   data.created_at= Date.now();
   data.course_type= fileData.course_type;
   data.course_name = fileData.course_name;

 }
  // console.log(jsonData);
  QuestionModel.insertMany(jsonData)
    .then(() => {
      res.status(200).json({ message: "Data imported successfully." });
    })
    .catch((error) => {
        console.log(error);
      res.status(500).json({ error: "An error occured" });
    });
    } catch (e) {
        console.log(e);
        throw e;
    }
});


router.post("/uploadBulkDepartment", upload.single("file"), (req, res) => {
  // The uploaded file is available at req.file.path
  const filePath = req.file.path;
//   const fileData = JSON.parse(req.body.data);
// console.log(fileData);

  // Pass the file path to the Excel parsing logic
  // Handle parsing and saving to MongoDB here
  // Read the Excel file
  const workbook = XLSX.readFile(filePath);

  // Extract the first worksheet from the workbook
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  // Convert the worksheet data to JSON format
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
 console.log(jsonData);
 for(let data of jsonData){
   data.created_at= Date.now();   
 }
  DepartmentModel.insertMany(jsonData)
    .then(() => {
      res.status(200).json({ message: "Data imported successfully." });
    })
    .catch((error) => {
      res.status(500).json({ error: "An error occured" });
    });
});
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.static(path.resolve(__dirname, "public")));

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file, originalName);
  },
});

// router.post("/importQuestions", upload.single("file"), QuestionController.importQuestions);

module.exports = router;
