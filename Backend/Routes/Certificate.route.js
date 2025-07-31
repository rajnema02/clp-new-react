const puppeteer = require("puppeteer");
const fs = require("fs");
const router = require("express").Router();
const Controller = require("../Controllers/Certificate.controller");
const multer = require("multer");
const path = require("path");
const ExamReportModel = require("./../Models/ExamReport.model");
const mongoose = require("mongoose");


const upload = multer({
  dest: path.join(__dirname, "./../certificates/signed-certificates"),
});

router.get("/download-pdf", Controller.downloadPDF2);//For generating certificates
router.get("/download-certificates", Controller.downloadCertificates);//For downloading certificates
router.get("/checkIfGenerated", Controller.checkIfAlreadyGenerated);
router.get("/checkIfDownloaded", Controller.checkIfAlreadyDownloaded);
router.post("/upload", upload.array("files"), async(req, res) => {

  // console.log(req);
  // const {formData} = req.query;
  // console.log(formData);
  // const {exam_id} = req.query;
  // console.log(exam_id);
  // return;
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }


  const uploadedFiles = req.files;

  // Process and save the files
  for (let i = 0; i < uploadedFiles.length; i++) {
    const file = uploadedFiles[i];
    const originalName = file.originalname;
    const exam_id = originalName.split("-")[0];
    const student_id_PDF =  originalName.split("-")[1];
    console.log(student_id_PDF);

    const student_id = student_id_PDF.split(".")[0];
    // console.log(exam_id);

    // console.log(exam_id);

    

    const dir = path.join(
      __dirname,
      `./../certificates/signed-certificates/signed-${exam_id}`
    );
    // console.log(dir);
    //   const newDir = './new-dir';
    if (!fs.existsSync(dir)) {
      console.log("making folder", fs.existsSync(dir));
      fs.mkdir(dir, (e) => {
        if (e) {
          console.error(e);
        } else {
          console.log("Success");
        }
      });
    }

    const filePath = file.path;
    
    const newFilePath = path.join(
      `certificates/signed-certificates/signed-${exam_id}/${originalName}`
    );
    // const newFilePath = `C:/Users/lenovo/Documents/GitHub/mpcon_v1/api-v2/certificates/signed-certificates/signed-${exam_id}/${originalName}`;
    fs.rename(filePath, newFilePath, (err) => {
      if (err) {
        console.error("Error renaming file:", err);
      } else {
        console.log("File renamed successfully.");
      }
    });
    // console.log("Student certificate filepath",newFilePath);

    const studentReport = await ExamReportModel.findOne({Exam_id: mongoose.Types.ObjectId(exam_id), Student_id: mongoose.Types.ObjectId(student_id)});
    // console.log("FILE ASSIGNED TO STUDENT_ID>>"studentReport.Student_id);
    const updatedExamReport = await ExamReportModel.updateOne({Exam_id: mongoose.Types.ObjectId(exam_id), Student_id: mongoose.Types.ObjectId(student_id)}, {$set: {certificatePath: newFilePath}})
    console.log("FILE PATH SAVED >>",`File ${originalName} saved to ${newFilePath}`);
    console.log("FILE ACKNOWLEDGE STATUS>>>",updatedExamReport);
  };

  return res.json({succee: true, message: "Files uploaded successfully" });
});

module.exports = router;
