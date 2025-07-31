const createError = require("http-errors");
const mongoose = require("mongoose");
const Model = require("../Models/ExamReport.model");
const puppeteer = require("puppeteer");
const fs = require("fs");

module.exports = {
  getExamReport: async (req, res, next) => {
    try {
      const { id } = req.query;
      const reportData = await Model.findOne({
        _id: mongoose.Types.ObjectId(id),
      });
      const studentList = await Model.find({
        Result: "Pass",
        Exam_id: mongoose.Types.ObjectId(exam_id),
      });
        console.log("passList",studentList.length);
      res.json(reportData);
      return;
    } catch (error) {
      next(error);
    }
  },
  getResultList: async (req, res, next) => {
    try {
      // console.log('get result list called')
      const { exam_id } = req.query;
      console.log(exam_id);
      const resultList = await Model.find({
        Exam_id: mongoose.Types.ObjectId(exam_id),
      });
      // console.log("this is result list", resultList);
      if (resultList.length > 0) {
        const count = resultList.length;
        const passedList = await Model.find({
          Result: "Pass",
          Exam_id: mongoose.Types.ObjectId(exam_id),
        });
        const passedCount = passedList.length;
        const failedList = await Model.find({
          Result: "Fail",
          Exam_id: mongoose.Types.ObjectId(exam_id),
        });
        const failedCount = failedList.length;
        res.json({
          ResultList: resultList,
          TotalCount: count,
          PassedCount: passedCount,
          FailedCount: failedCount,
        });
        return;
      } else {
        res.json({ message: "No results processed yet!" });
        return;
      }
    } catch (error) {
      next(error);
    }
  },
  passedList: async (req, res, next) => {
    try {
      const { exam_id } = req.query;
      const studentList = await Model.find({
        Result: "Pass",
        Exam_id: mongoose.Types.ObjectId(exam_id),
      });
      if (studentList) {
        const count = studentList.length;
        res.json({ TotalCount: count, PassedStudentList: studentList });
        return;
      } else {
        res.json({ message: "No passed students found" });
        return;
      }
    } catch (next) {
      nerxt(error);
    }
  },
  failedList: async (req, res, next) => {
    try {
      const { exam_id } = req.query;
      const studentList = await Model.find({
        Result: "Fail",
        Exam_id: mongoose.Types.ObjectId(exam_id),
      });
      if (studentList) {
        const count = studentList.length;
        res.json({ TotalCount: count, FailedStudentList: studentList });
        return;
      } else {
        res.json({ message: "No failed students found" });
        return;
      }
    } catch (next) {
      nerxt(error);
    }
  },
  downloadCertificatePDF: async (req, res, next) => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto("https://example.com"); // Replace with the URL of the page you want to generate PDF from

      const pdfOptions = {
        path: "output.pdf", // Specify the path where the PDF file will be saved
        format: "A4",
      };
      await page.pdf(pdfOptions);
      await browser.close();

      const pdfPath = __dirname + "/output.pdf"; // Modify the path if needed
      const pdfBuffer = fs.readFileSync(pdfPath);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="output.pdf"');
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: "Error generating PDF" });
    }
  },
  getStudentsCertificates: async (req, res, next) => {
    try {
      const { studentId } = req.query;
      const studentAllReports = await Model.aggregate([
        {
          $match: {
            Student_id: mongoose.Types.ObjectId(studentId),
          },
        },
        {
          $lookup:{
            from: "exams",
            localField: "Exam_id",
            foreignField: "_id",
            as: "examObject"
          }
        },
        {
            $unwind: {
              path: "$examObject",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              "examObject.exam_name": 1,
              "certificatePath": 1,
              "grade":1

            }
          }

      ]);
      const allReports = [];
      if (studentAllReports) {
        for (stuReport of studentAllReports) {
          if (stuReport.certificatePath) {
            allReports.push(stuReport);
          }
        }
        if (allReports.length) {
          res.json({ success: true, reports: allReports });
          return;
        } else {
          res.json({
            success: false,
            message: "No certificates generated yet!!!!",
          });
          return;
        }
      } else {
        res.json({
          success: false,
          message: "No reports yet!!!!",
        });
        return;
      }
    } catch (error) {
      next(error);
    }
  },
  getFinalExamReport: async (req, res, next) => {
    const Model = require("../Models/ExamReport.model");
    const Exam = require("../Models/Exam.model");
    const User = require("../Models/Auth.model");

    try {
      const { examId } = req.query;
      const examData = await Exam.findOne({
        _id: mongoose.Types.ObjectId(examId),
      });
      // console.log("Exam Data>>>", examData);
      const batchId = examData.batch_id[0];
      const allStudents = await User.find({
        batch: mongoose.Types.ObjectId(batchId),
      });
      // console.log(allStudents);
      const allExams = await Exam.find({ batch_id: { $in: [batchId] } });
      // console.log(allExams);
      const allExamReports = [];
      for (let exam of allExams) {
        const examReports = await Model.find({ Exam_id: exam._id });
        let examData = {
          ExamName: exam.exam_name,
          examReports: examReports,
          length: examReports.length,
        };
        allExamReports.push(...examReports);
      }
      DoubleFinalReports = [];
      for (let student of allStudents) {
        let studentReports = [];
        for (let report of allExamReports) {
          if (String(report.Student_id) == String(student._id)) {
            // console.log(student);
            studentReports.push(report);
          }
        }
        let studentData = {
          StudentName: student.full_name,
          StudentId: student._id,
          StudentOffice: student.office,
          StudentDistrict: student.district,
          StudentReport: studentReports,
        };
        DoubleFinalReports.push(studentData);
      }

      res.send({ success: true, Reports: DoubleFinalReports });

      return;
    } catch (error) {
      next(error);
    }

  },

};
