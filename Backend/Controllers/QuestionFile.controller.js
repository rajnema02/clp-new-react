const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const app = express();
const upload = multer({ dest: "uploads/" });
const QuestionModel = require("../Models/Question.model");
const path = require("path");
const XLSX = require("xlsx");
var fs = require("fs")


// app.post("/upload", upload.single("file"), (req, res) => {
//   // The uploaded file is available at req.file.path
//   const filePath = req.file.path;

//   // Pass the file path to the Excel parsing logic
//   // Handle parsing and saving to MongoDB here
// });


// var upload = multer({ storage: store }).single("file")


module.exports = {
  uploadBulkQuestion: async (req, res, next) => {
    try {

    
      const filePath = req.file;
      // Read the Excel file
      console.log('Reading Excel file')
      const workbook = XLSX.readFile(filePath);

      // Extract the first worksheet from the workbook
      const worksheet = workbook.Sheets[workbook.Sheets[0]];

      // Convert the worksheet data to JSON format
      const jsonData = XLSX.utils.sheet_to_json(worksheet).map(o=>{
        o.is_inactive = false;
        return o
      });
      QuestionModel.insertMany(jsonData).then(() => {
        res.status(200).json({ message: "Data imported successfully." });
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  },
};
