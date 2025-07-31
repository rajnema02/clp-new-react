const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const Model = require("../Models/AuditExam.model");
const ExamReport = require("../Models/ExamReport.model");
const createError = require("http-errors");
const mongoose = require("mongoose");
const ModelName = "Assessment";
const { upload } = require("../Helpers/helper_functions");
var random = require("mongoose-random");
const AuditQuestionModel = require("../Models/AuditQuestion.model");
const _ = require("lodash");
const AuditAnswerSheetModel = require("../Models/AuditAnswerSheet.model");
const AuditAttendanceSheetModel = require("../Models/AuditAttendanceSheet.model");
const User = require("../Models/Auth.model");
const Batch = require("../Models/Batch.model");
const {
  sms1stAttempt,
  sms2ndAttempt,
  sms3rdAttempt,
  smsExamInstruction,
  AssessmentSubmit,
} = require("../Helpers/smsCalls");
// const AuditQuestion = require("../Models/AuditQuestion.model");

module.exports = {
  create: async (req, res, next) => {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return res.status(501).json({ error: err });
        }
        const data = req.body;

        console.log(data);

        const dataExists = await Model.findOne({
          exam_name: data.exam_name,
          is_inactive: false,
        });
        if (dataExists) {
          throw createError.Conflict(`${ModelName} already exists`);
        }
        const query = {};
        query.batch = data.batch_id[0];
        console.log(query.batch);
        // const batchData = await Batch.findOne({_id: mongoose.Types.ObjectId(data.batch_id)});
        const students = await User.find({ batch: { $in: [query.batch] } });
        const batchData = await Batch.findOne({
          _id: mongoose.Types.ObjectId(query.batch),
        });

        // const total_no_of_questions = batchData.total_no_of_questions;
        // const percent_of_course_questions =
        //   batchData.percent_of_course_questions;

        // if (
        //   !batchData.total_no_of_questions ||
        //   !batchData.percent_of_course_questions
        // ) {
        //   res.json({
        //     success: false,
        //     message: `Please define Question Scheme first in batch!!!`,
        //   });
        //   return;
        // }

        // // console.log(req.query);
        // const percent_of_general_questions = 100 - percent_of_course_questions;

        // const no_of_general_questions = Math.floor(
        //   (percent_of_general_questions * total_no_of_questions) / 100
        // );
        // console.log(
        //   "No. of general questions=>>>>>>>",
        //   no_of_general_questions
        // );

        // const no_of_course_questions =
        //   total_no_of_questions - no_of_general_questions;

        // console.log("No. of course questions=>>>>>>>", no_of_course_questions);
        // const courseQuestionsCount = await Question.find({
        //   course_name: batchData.course_name,
        //   is_inactive: false,
        // }).count();
        // console.log("course questions count", courseQuestionsCount);

        // if (courseQuestionsCount < no_of_course_questions) {
        //   res.json({
        //     success: false,
        //     message: `Not enough questions of ${batchData.course_name} course in question bank`,
        //   });
        //   return;
        // }
        // const generalQuestionsCount = await Question.find({
        //   course_type: "General",
        //   is_inactive: false,
        // }).count();
        // console.log("general questions Count", generalQuestionsCount);

        // if (generalQuestionsCount < no_of_general_questions) {
        //   res.json({
        //     success: false,
        //     message: `Not enough general questions in question bank`,
        //   });
        //   return;
        // }

        // const students = await User.aggregate([
        //   {
        //     $match: query,
        //   },
        //   {
        //     $project: {
        //       _id: 1
        //     },
        //   },
        //   // {
        //   //   $sort: sorting,
        //   // },
        //   // {
        //   //   $skip: _skip,
        //   // },
        //   // {
        //   //   $limit: _limit,
        //   // },
        // ]);
        console.log(students.length);
        data.exam_status = "upcoming";
        data.created_at = Date.now();

        data.is_inactive = false;
        if (data.course_type == "Special Training Program") {
          data.exam_attempt = 2;
        }
        const newData = new Model(data);
        const result = await newData.save();
        for (let index = 0; index < students.length; index++) {
          const element = students[index];
          const attendanceToSave = {
            user_id: element._id,
            user_name: element.full_name,
            batch_id: element.batch,
            exam_id: result._id,
            exam_name: result.exam_name,
          }
          const newAttendanceData = new AuditAttendanceSheetModel(attendanceToSave);
          const resultSavedAttendance = await newAttendanceData.save();
          console.log("students", element);
          if (element.auditType == 'Assessor') {
            const query = {
              questionType: 'Assessor', is_inactive: false,
            }
            const AuditQuestion = await AuditQuestionModel.aggregate([
              {
                $match: query
              },
              {
                $lookup: {
                  from: 'auditquescategories',
                  as: 'category',
                  localField: 'question_category',
                  foreignField: '_id'
                },
              },
              {
                $unwind: {
                  path: "$category",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $project: {
                  // Include other fields you want from the original collection
                  _id: 1,
                  question: 1,
                  priority: 1,
                  question_category: 1,
                  priority: 1,
                  questionType: 1,
                  // Example field from the original collection
                  // Include only the title from the category
                  category: {
                    title: 1
                  }
                }
              },

            ])
            AuditQuestion.forEach(async (ques) => {
              const quesToSave = {
                user_id: element._id,
                user_name: element.full_name,
                batch_id: element.batch,
                exam_id: result._id,
                exam_name: result.exam_name,
                question_id: ques._id,
                seen: false,
                question: ques.question,
                questionCategory: ques.category.title,
                userAnswer: null,
                status: "unanswered",
              }
              console.log("AssessorAuditQuestion", quesToSave);
              const newQuesData = new AuditAnswerSheetModel(quesToSave);
              const resultSavedQues = await newQuesData.save();
            })
          } else if (element.auditType == 'Individual') {
            const query = {
              questionType: 'Individual', is_inactive: false,
            }
            // const AuditQuestion = await AuditQuestionModel.find({ questionType: 'Individual', is_inactive: false, })
            const AuditQuestion = await AuditQuestionModel.aggregate([
              {
                $match: query
              },
              {
                $lookup: {
                  from: 'auditquescategories',
                  as: 'category',
                  localField: 'question_category',
                  foreignField: '_id'
                },
              },
              {
                $unwind: {
                  path: "$category",
                  preserveNullAndEmptyArrays: true
                }
              },
              {
                $project: {
                  // Include other fields you want from the original collection
                  _id: 1,
                  question: 1,
                  priority: 1,
                  question_category: 1,
                  priority: 1,
                  questionType: 1,
                  // Example field from the original collection
                  // Include only the title from the category
                  category: {
                    title: 1
                  }
                }
              },

            ])
            AuditQuestion.forEach(async (ques) => {
              const quesToSave = {
                user_id: element._id,
                user_name: element.full_name,
                batch_id: element.batch,
                exam_id: result._id,
                exam_name: result.exam_name,
                question_id: ques._id,
                seen: false,
                question: ques.question,
                questionCategory: ques.category.title,
                userAnswer: null,
                status: "unanswered",
              }
              console.log("IndividualAuditQuestion", AuditQuestion);
              const newQuesData = new AuditAnswerSheetModel(quesToSave);
              const resultSavedQues = await newQuesData.save();
            })
          }

        }
        if (result) {
          console.log("ASSESSMENT DETAILS>>>>>>>", result);
          const child_exam = {
            exam_name: `${result.exam_name}-2`,
            exam_code: result.exam_code,
            course_type: result.course_type,
            course_name: result.course_name,
            exam_date_from: result.exam_date_from,
            exam_date_to: result.exam_date_to,
            exam_duration: result.exam_duration,
            batch_id: result.batch_id,
            failed_student_ids: result.failed_student_ids,
            is_inactive: result.is_inactive,
            created_at: result.created_at,
            parent_exam: result._id,
          }
          const newChild_exam = new Model(child_exam);
          const resultChildExam = await newChild_exam.save();
          for (let index = 0; index < students.length; index++) {
            const element = students[index];
            const attendanceToSave = {
              user_id: element._id,
              user_name: element.full_name,
              batch_id: element.batch,
              exam_id: resultChildExam._id,
              exam_name: resultChildExam.exam_name,
            }
            const newAttendanceData = new AuditAttendanceSheetModel(attendanceToSave);
            const resultChildExamSavedAttendance = await newAttendanceData.save();
            console.log("students", element);
            if (element.auditType == 'Assessor') {
              const query = {
                questionType: 'Assessor', is_inactive: false,
              }
              const AuditQuestion = await AuditQuestionModel.aggregate([
                {
                  $match: query
                },
                {
                  $lookup: {
                    from: 'auditquescategories',
                    as: 'category',
                    localField: 'question_category',
                    foreignField: '_id'
                  },
                },
                {
                  $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $project: {
                    // Include other fields you want from the original collection
                    _id: 1,
                    question: 1,
                    priority: 1,
                    question_category: 1,
                    priority: 1,
                    questionType: 1,
                    // Example field from the original collection
                    // Include only the title from the category
                    category: {
                      title: 1
                    }
                  }
                },

              ])
              AuditQuestion.forEach(async (ques) => {
                const quesToSave = {
                  user_id: element._id,
                  user_name: element.full_name,
                  batch_id: element.batch,
                  exam_id: resultChildExam._id,
                  exam_name: resultChildExam.exam_name,
                  question_id: ques._id,
                  seen: false,
                  question: ques.question,
                  questionCategory: ques.category.title,
                  userAnswer: null,
                  status: "unanswered",
                }
                console.log("AssessorAuditQuestion", quesToSave);
                const newQuesData = new AuditAnswerSheetModel(quesToSave);
                const resultChildExamSavedQues = await newQuesData.save();
              })
            } else if (element.auditType == 'Individual') {
              const query = {
                questionType: 'Individual', is_inactive: false,
              }
              // const AuditQuestion = await AuditQuestionModel.find({ questionType: 'Individual', is_inactive: false, })
              const AuditQuestion = await AuditQuestionModel.aggregate([
                {
                  $match: query
                },
                {
                  $lookup: {
                    from: 'auditquescategories',
                    as: 'category',
                    localField: 'question_category',
                    foreignField: '_id'
                  },
                },
                {
                  $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true
                  }
                },
                {
                  $project: {
                    // Include other fields you want from the original collection
                    _id: 1,
                    question: 1,
                    priority: 1,
                    question_category: 1,
                    priority: 1,
                    questionType: 1,
                    // Example field from the original collection
                    // Include only the title from the category
                    category: {
                      title: 1
                    }
                  }
                },

              ])
              AuditQuestion.forEach(async (ques) => {
                const quesToSave = {
                  user_id: element._id,
                  user_name: element.full_name,
                  batch_id: element.batch,
                  exam_id: resultChildExam._id,
                  exam_name: resultChildExam.exam_name,
                  question_id: ques._id,
                  seen: false,
                  question: ques.question,
                  questionCategory: ques.category.title,
                  userAnswer: null,
                  status: "unanswered",
                }
                console.log("IndividualAuditQuestion", AuditQuestion);
                const newQuesData = new AuditAnswerSheetModel(quesToSave);
                const resultChildExamSavedQues = await newQuesData.save();
              })
            }

          }
        }
        res.json({
          success: true,
          data: newData,
          message: "Exam Scheduled Successfully!!!",
        });
        return;
      });
    } catch (error) {
      next(error);
    }
  },

  syncAnswer: async (req, res, next) => {

    try {
      const data = req.body
      // console.log("data", data);
      data.answerSheet.forEach(async (answer) => {
        await AuditAnswerSheetModel.updateOne({ _id: mongoose.Types.ObjectId(answer._id) },
          { $set: answer })
      })
      const candidateAttendance = await AuditAttendanceSheetModel.findOneAndUpdate({ user_id: mongoose.Types.ObjectId(data.userId), exam_id: mongoose.Types.ObjectId(data.examId) }, { $set: { attendance: 'present' } })
      console.log("candidateAttendance", candidateAttendance);


      res.json({
        success: true,
        message: "Answers Sync Successfully!!!",
      });
      return;

    } catch (error) {
      next(error);
    }

  },

  syncAdminSuggestion: async (req, res, next) => {

    try {
      const data = req.body
      console.log("data", data);
      const exam_id = data.examId
      const Student_id = data.studentId
      const studentData = await User.findOne({ _id: mongoose.Types.ObjectId(Student_id) })

      // save the admin audit response and in audit answer-sheet and and in attendance sheet audit report status of candidate

      data.answerSheet.forEach(async (answer) => {
        const answerUpdate = await AuditAnswerSheetModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(answer._id) },
          { $set: answer })
        console.log("AdminAnswerUpdate>>", answerUpdate);

      })
      function getCurrentDate() {
        const date = new Date();
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }

      let answerSheet = await AuditAnswerSheetModel.find({ user_id: mongoose.Types.ObjectId(Student_id), exam_id: mongoose.Types.ObjectId(exam_id) })
      // , adminStatus: 'Accept'
      // console.log("Rejected answerSheet", answerSheet);
      const examDetail = await Model.findOne({ _id: mongoose.Types.ObjectId(exam_id) })
      console.log("examDetail",examDetail);
      
      if (examDetail.parent_exam) {
        const parentExamDetail = await Model.findOne({ _id: mongoose.Types.ObjectId(examDetail.parent_exam) })
        console.log("parentExamDetail",parentExamDetail);
        
        let acceptedParentAnswerSheet = await AuditAnswerSheetModel.find({ user_id: mongoose.Types.ObjectId(Student_id), exam_id: mongoose.Types.ObjectId(parentExamDetail._id), adminStatus: 'Accept' })
        console.log("acceptedParentAnswerSheet",acceptedParentAnswerSheet);
        
        answerSheet = [...answerSheet, ...acceptedParentAnswerSheet];
      }
      function generateAnswerSheetTable(answerSheet) {
        let table = '<table style="width:100%; border-collapse: collapse;">';
        table += '<tr><th style="border: 1px solid #ddd; padding: 8px;">Assessment</th><th style="border: 1px solid #ddd; padding: 8px;">Answer</th><th style="border: 1px solid #ddd; padding: 8px;">Risk</th><th style="border: 1px solid #ddd; padding: 8px;">Admin Status</th><th style="border: 1px solid #ddd; padding: 8px;">Suggestion</th></tr>';

        answerSheet.forEach((item) => {
          // Set adminRisk to 'Low' if it is not defined or empty
          const risk = item.adminRisk ? item.adminRisk : 'Low';

          // Determine the color based on risk value
          let riskColor;
          switch (risk.toLowerCase()) {
            case 'low':
              riskColor = 'green';
              break;
            case 'medium':
              riskColor = 'orange';
              break;
            case 'high':
              riskColor = 'red';
              break;
            default:
              riskColor = 'green'; // Default to green for 'Low'
              break;
          }

          table += `<tr>`;
          table += `<td style="border: 1px solid #ddd; padding: 8px;">${item.question}</td>`;
          table += `<td style="border: 1px solid #ddd; padding: 8px;">${item.userAnswer ? item.userAnswer : ''}</td>`;
          table += `<td style="border: 1px solid #ddd; padding: 8px; color: ${riskColor};">${risk}</td>`;
          table += `<td style="border: 1px solid #ddd; padding: 8px;">${item.adminStatus == 'Reject' ? 'Non-Compliance' : "Compliance"}</td>`;
          table += `<td style="border: 1px solid #ddd; padding: 8px;">${item.adminSuggestion ? item.adminSuggestion : ""}</td>`;
          table += `</tr>`;
        });

        table += '</table>';
        return table;
      }
      const answerSheetHtml = generateAnswerSheetTable(answerSheet);
      const currentDate = getCurrentDate();
      // const secondExam = await 
      const dir = path.join(
        __dirname,
        `./../auditReports/report/${exam_id}`
      );
      console.log(dir);
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
      const examReport = await AuditAnswerSheetModel.find({
        exam_id: mongoose.Types.ObjectId(exam_id),

      });
      const sampleReportPath = path.join(
        __dirname,
        "./../templates/auditReport.html"
      );
      const ReportHtmlPath = path.join(
        __dirname,
        `./../auditReports/report/${exam_id}/${exam_id}-${Student_id}.html`
      );
      fs.readFile(sampleReportPath, (err, data) => {
        if (err) {
          // Handle error
          res.status(500).send(`Error loading index.html: ${err}`);
          return;
        }

        data = data.toString("utf8");
        data = data.replace("[Date]", currentDate);
        data = data.replace("[Name]", studentData.full_name);
        data = data.replace("[Designation]", studentData.designation);
        data = data.replace("[Office Name]", studentData.office);
        data = data.replace("[Department]", studentData.department);
        data = data.replace("[Findings content]", answerSheetHtml);

        fs.writeFileSync(ReportHtmlPath, data);
      });
      const browser = await puppeteer.launch({ headless: "new" });

      // Create a new page
      const page = await browser.newPage();
      // await page.waitForSelector('img');

      //Get HTML content from HTML file
      const html = fs.readFileSync(ReportHtmlPath, "utf-8");
      await page.setContent(html, { waitUntil: "domcontentloaded" });

      // To reflect CSS used for screens instead of print
      await page.emulateMediaType("screen");
      await page.setViewport({
        width: 1366,
        height: 1080,
        deviceScaleFactor: 1,
        isLandscape: true,
      });
      const newName = `${exam_id}-${Student_id}.pdf`;
      const pdfPath = `auditReports/report/${exam_id}/` + newName
      // Downlaod the PDF
      const pdf = await page.pdf({
        path:
          path.join(
            __dirname,
            `./../auditReports/report/${exam_id}/`
          ) + newName,
        isLandscape: true,
        printBackground: true,
        format: "A4",
        margin: {
          top: "0.5in", // Adjust the top margin as needed
          right: "0.5in", // You can also set margins for other sides
          bottom: "0.5in",
          left: "0.5in"
        },
        waitUntil: "networkidle0",
      });

      await browser.close();
      fs.unlink(ReportHtmlPath, (err) => {
        if (err) {
          console.error("An error occurred while deleting the file:", err);
        } else {
          console.log("File has been deleted successfully.");
        }
      });
      const candidateReport = await AuditAttendanceSheetModel.findOneAndUpdate({ user_id: mongoose.Types.ObjectId(Student_id), exam_id: mongoose.Types.ObjectId(exam_id) }, { $set: { reportStatus: 'created', reportPath: `auditReports/report/${exam_id}/${exam_id}-${Student_id}.pdf` } })
      console.log("candidateReport", candidateReport);

      //now find second exam in which parent exam is  current exam if any then delete all accepted questions in current examination from the second exam so all rejected question will display to candidate for second attempt 

   const childExam = await Model.findOne({ parent_exam: mongoose.Types.ObjectId(exam_id) })
      if (childExam) {
        // Step 1: Fetch the rejected answers
        const RejectAnswerSheet = await AuditAnswerSheetModel.find({
          user_id: mongoose.Types.ObjectId(Student_id),
          exam_id: mongoose.Types.ObjectId(exam_id),  // original exam_id from rejectQues
          adminStatus: 'Reject'
        });

        // Step 2: Extract question_ids from rejectQues
        let rejectQues = [];
        RejectAnswerSheet.forEach(rejectAns => {
          rejectQues.push(rejectAns.question_id.toString());  // Convert ObjectId to string for easier comparison
        });
        const rejectQuestionIds = rejectQues.map(id => mongoose.Types.ObjectId(id));
        console.log("rejectQues", rejectQues);  // This should show the list of question_ids from rejectQues

        // Step 3: Fetch the child exam answers
        const childExamId = childExam._id;
        const ChildAnswerSheet = await AuditAnswerSheetModel.find({
          user_id: mongoose.Types.ObjectId(Student_id),
          exam_id: mongoose.Types.ObjectId(childExamId)  // child exam_id
        });

        console.log("ChildAnswerSheet>>>>>>", ChildAnswerSheet);

        // Step 4: Filter out child exam answers that don't have matching question_id from rejectQues
        const filteredChildAnswerSheet = ChildAnswerSheet.filter(childAns => {
          return rejectQues.includes(childAns.question_id.toString());
        });

        console.log("Filtered ChildAnswerSheet>>>>>>", filteredChildAnswerSheet);

        // Step 5: If you want to delete the unmatched answers, you can remove them as follows:
        // await AuditAnswerSheetModel.updateMany(
        //   {
        //     user_id: mongoose.Types.ObjectId(Student_id),
        //     exam_id: mongoose.Types.ObjectId(childExamId)
        //   },
        //   {
        //     $pull: {
        //       ChildAnswerSheet: { question_id: { $nin: rejectQues.map(id => mongoose.Types.ObjectId(id)) } }
        //     }
        //   }
        // );
        await AuditAnswerSheetModel.deleteMany({
          user_id: mongoose.Types.ObjectId(Student_id),
          exam_id: mongoose.Types.ObjectId(childExamId),  // Filter by the child exam ID
          question_id: { $nin: rejectQuestionIds }  // Only delete documents where question_id is not in rejectQues
        });


      }
      // now create the pdf of the for accepted question for first attempt

      // if its second attempt then created pdf of all accepted question in first attempt and also all the question of the second attempt
      // res.send({ pdfPath: pdfPath })
      // return;
      res.json({
        success: true,
        message: "Suggestion Sync Successfully!!!",
      });

    } catch (error) {
      next(error);
    }

  },

  getAnswerSheet: async (req, res, next) => {
    const { user_id, exam_id } = req.query
    let query = {}
    if (user_id) {
      query.user_id = mongoose.Types.ObjectId(user_id)
    }
    if (exam_id) {
      query.exam_id = mongoose.Types.ObjectId(exam_id)
    }
    const result = await AuditAnswerSheetModel.aggregate([
      {
        $match: query,
      },
      {
        $sort: { _id: -1 },
      },
    ])

    // console.log("getAnswerSheet>> data", data);
    res.json({
      data: result,
    })
  },

  get: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Model.findOne({ _id: mongoose.Types.ObjectId(id) });
      if (!result) {
        throw createError.NotFound(`No ${ModelName} Found`);
      }
      const timeString = result.exam_time;
      const date = new Date();
      const dateTimeString =
        date.toISOString().split("T")[0] + "T" + timeString + ":00Z";
      const timestmp = new Date(dateTimeString).getTime();
      // console.log(timestmp);
      // console.log(dateTimeString);
      this.durationInt = parseInt(result.exam_duration);
      this.examEndTime = this.durationInt * 60;
      // this.examEndTime = 5400;
      const endTime = timestmp + this.examEndTime * 1000; // Convert duration to milliseconds
      console.log("ENDTIME:>>", endTime);
      result.endTime = endTime;
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  },
  getByTitle: async (req, res, next) => {
    try {
      console.log(req.params);
      const { title } = req.params;
      console.log(title);
      if (!title) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Model.findOne({ title: title, is_inactive: false });
      if (!result) {
        throw createError.NotFound(`No ${ModelName} Found`);
      }
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  },
  getBySlug: async (req, res, next) => {
    try {
      console.log(req.params);
      const { slug } = req.params;
      if (!slug) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const result = await Model.findOne({ slug, is_inactive: false });
      if (!result) {
        throw createError.NotFound(`No ${ModelName} Found`);
      }
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  },
  list: async (req, res, next) => {
    try {
      const { is_inactive, course_type, course_name } = req.query;
      //   const _page = page ? parseInt(page) : 1;
      //   const _limit = limit ? parseInt(limit) : 20;
      //   const _skip = (_page - 1) * _limit;
      //   const _sort = sort ? sort : "+title";
      const query = {};

      if (course_type) {
        query.course_type = new RegExp(course_type, "i");
      }
      if (course_name) {
        query.course_name = new RegExp(course_name, "i");
      }

      //   query.disabled = (disabled && disabled == 'true') ? true : false
      query.is_inactive = false;

      //   const result= await Model.find();
      const result = await Model.aggregate([
        {
          $match: query,
        },
        {
          $sort: { _id: -1 },
        },
        // {
        //   $unwind: "$batch_id",
        // },
        // {
        //   $lookup: {
        //     from: "batches",
        //     localField: "batch_id",
        //     foreignField: "_id",
        //     as: "batch_id",

        //   }
        // },
        // {
        //   $unwind: {
        //     path: "$batchObj",
        //     preserveNullAndEmptyArrays: true
        //   }
        // }
        // {
        //   $project: {"batchObj": 1}
        // }

        // {
        //   $group:{
        //     _id: "$_id",
        //     batches: {$push: "$batch_id"},
        //     batchObjects: {$push: "$batchObj"}
        //   }
        // }

        // {
        //   $skip: _skip,
        // },
        // {
        //   $limit: _limit,
        // },
      ]);
      const resultCount = await Model.countDocuments(query);
      // .sort(_sort).skip(_skip).limit(_limit)
      res.json({
        data: result,
        meta: {
          //   current_page: _page,
          //   from: _skip + 1,
          //   last_page: Math.ceil(resultCount / _limit, 10),
          //   per_page: _limit,
          //   to: _skip + _limit,
          //   total: resultCount,
        },
      });
      return;
    } catch (error) {
      next(error);
    }
  },

  getStudentsExams: async (req, res, next) => {
    try {
      const user_id = req.params.id;
      const student = await User.findOne({
        _id: mongoose.Types.ObjectId(user_id),
      });
      if (student.batch) {
        const bId = student.batch;
        console.log(bId);
        const studentsExams = [];
        const allExams = await Model.aggregate([
          {
            $unwind: "$batch_id",
          },
          {
            $sort: { _id: -1 },
          },
        ]);

        for (let exam of allExams) {
          if (exam.batch_id == bId) {
            studentsExams.push(exam);
          }
        }
        if (studentsExams) {
          res.json({ exams: studentsExams, success: true });
          return;
        } else {
          res.json("No upcoming exams!");
          return;
        }
      } else {
        res.json("Not Enrolled in any batch!");
        return;
      }

      return;
    } catch (error) {
      next(error);
    }
  },

  getRescheduledExams: async (req, res, next) => {
    try {
      const user_id = req.params.id;
      const student = await User.findOne({
        _id: mongoose.Types.ObjectId(user_id),
      });
      if (student.batch) {
        const bId = student.batch;
        console.log(bId);
        const studentsExams = [];
        const allExams = await Model.aggregate([
          {
            $unwind: "$batch_id",
          },
        ]);

        for (let exam of allExams) {
          if (exam.batch_id == bId) {
            studentsExams.push(exam);
          }
        }

        if (studentsExams) {
          const reScheduledExams = [];
          for (let exam of studentsExams) {
            // console.log('This is all exams',exam)
            const parentExamId = exam.parent_exam;
            // console.log(parentExamId);
            const timeString = exam.exam_time;
            const date = new Date();
            const dateTimeString =
              date.toISOString().split("T")[0] + "T" + timeString + ":00Z";
            const timestmp = new Date(dateTimeString).getTime();
            // console.log(timestmp);
            // console.log(dateTimeString);
            this.durationInt = parseInt(exam.exam_duration);
            this.examEndTime = this.durationInt * 60;
            // this.examEndTime = 5400;
            const endTime = timestmp + this.examEndTime * 1000; // Convert duration to milliseconds
            // console.log(endTime);
            exam.endTime = endTime;
            if (parentExamId) {
              console.log("if parent exam found called");
              const parentExamReport = await ExamReport.findOne({
                Exam_id: parentExamId,
                Student_id: mongoose.Types.ObjectId(user_id),
              });
              const parentExamData = await Model.findOne({
                _id: mongoose.Types.ObjectId(parentExamId),
              });
              const grandParentExamId = parentExamData.parent_exam;
              if (grandParentExamId) {
                const grandParentExamReport = await ExamReport.findOne({
                  Exam_id: grandParentExamId,
                  Student_id: mongoose.Types.ObjectId(user_id),
                });
                if (grandParentExamReport) {
                  if (
                    grandParentExamReport.Result == "Fail" &&
                    parentExamReport.Result == "Fail"
                  ) {
                    reScheduledExams.push(exam);
                  }
                }
              } else {
                if (parentExamReport) {
                  if (parentExamReport.Result == "Fail") {
                    reScheduledExams.push(exam);
                  }
                }
              }
            } else {
              reScheduledExams.push(exam);
            }
          }

          res.json({ exams: reScheduledExams, success: true });
          return;
        }
      } else {
        res.json({ success: false, message: "Not enrolled in any batch!!" });
      }
    } catch (error) {
      next(error);
    }
  },

  getQuestions: async (req, res, next) => {
    try {
      const { course_type, course_name, is_inactive, user_id, exam_id } =
        req.query;
      // console.log(req.query);
      const query = {};

      if (course_type) {
        query.course_type = new RegExp(course_type, "i");
      }
      if (course_name) {
        query.course_name = new RegExp(course_name, "i");
      }
      if (user_id) {
        query.user_id = user_id;
      }

      query.is_inactive = { $ne: true };
      // query.is_inactive = is_inactive && is_inactive == "true" ? true : false;
      // get 4 options questions
      // query.regional_language = "hindi";
      const dataExists = await AuditAnswerSheetModel.find({
        user_id: mongoose.Types.ObjectId(user_id),
        exam_id: mongoose.Types.ObjectId(exam_id),
        // question_id: mongoose.Types.ObjectId(ques.question_id),
      });

      // if (dataExists) {
      //   const initiallySavedQuestions = await AnswerSheetModel.aggregate([
      //     {
      //       $match: {
      //         user_id: mongoose.Types.ObjectId(user_id),
      //         exam_id: mongoose.Types.ObjectId(exam_id),
      //       },
      //     },
      //   ]);
      //   console.log("Already saved shown");
      //   res.json({
      //     message: "Old Questions",
      //     data: initiallySavedQuestions,
      //   });

      //   return;
      // }
      // query.number_of_options = 4;

      // let fourOptionQuestions = await Question.aggregate([
      //   {
      //     $match: query,
      //   },
      //   {
      //     $project: { _id: 1 },
      //   },
      // ]);
      // //   let allQuestions = await Question.find();
      // // console.log(allQuestions);

      // // console.log('Matched $ question', fourOptionQuestions);
      // //question randomization

      // fourOptionQuestions = _.shuffle(fourOptionQuestions);

      // let selected4OpQues = fourOptionQuestions.slice(0, 60);

      // // get 2 options questions

      // query.number_of_options = 2;
      // console.log("==========================");
      // console.log(query);
      // console.log("==========================");
      // let twoOptionsQuestions = await Question.aggregate([
      //   {
      //     $match: query,
      //   },
      //   {
      //     $project: { _id: 1 },
      //   },
      // ]);

      // twoOptionsQuestions = _.shuffle(twoOptionsQuestions);

      // let selected2OpQues = twoOptionsQuestions.slice(0, 10);

      // let courseQuestions = selected4OpQues.concat(selected2OpQues);

      // //get general type questions

      // const genQuery = {};
      // genQuery.course_type = "General";
      // let genTypeQuestions = await Question.aggregate([
      //   {
      //     $match: genQuery,
      //   },
      //   {
      //     $project: { _id: 1 },
      //   },
      // ]);

      // genTypeQuestions = _.shuffle(genTypeQuestions);
      // let selectedGenTypeQuestions = genTypeQuestions.slice(0, 30);
      // console.log("========================================>");
      // console.log("2OPTION", selected2OpQues.length);
      // console.log("4OPTION", selected4OpQues.length);
      // console.log("GENERAL", selectedGenTypeQuestions.length);
      // console.log("========================================>");
      // let questionIds = courseQuestions.concat(selectedGenTypeQuestions);
      // //   const quesIdArray = [];
      // //   for(let ques of questionIds){
      // //     quesIdArray.push(ques);

      // //   }
      // let finalQuestions = await Question.find({
      //   _id: { $in: questionIds },
      // });

      // let quesToDisplay = finalQuestions.map((o) => {
      //   let newO = {
      //     _id: o._id,
      //     question: o.question,
      //     option_1: o.option_1,
      //     option_2: o.option_2,
      //     option_3: o.option_3,
      //     option_4: o.option_4,
      //     marks: o.marks,
      //     selectedAnswer: null,
      //     seen: false,
      //     status: "unanswered",
      //   };

      //   return newO;
      // });

      res.json({
        data: dataExists,
        message: "New questions",
      });

      return;
    } catch (error) {
      next(error);
    }
  },
  getQuestions1: async (req, res, next) => {
    try {
      const { user_id, exam_id, batch_id } = req.query;

      const examData = await Model.findOne({
        _id: mongoose.Types.ObjectId(exam_id),
      });
      const batchId = examData.batch_id[0];

      const batchData = await Batch.findOne({
        _id: mongoose.Types.ObjectId(batchId),
      });
      const total_no_of_questions = batchData.total_no_of_questions;

      const percent_of_course_questions = batchData.percent_of_course_questions;

      // console.log(req.query);
      const percent_of_general_questions = 100 - percent_of_course_questions;

      const no_of_general_questions = Math.floor(
        (percent_of_general_questions * total_no_of_questions) / 100
      );
      console.log("No. of general questions=>>>>>>>", no_of_general_questions);

      const no_of_course_questions =
        total_no_of_questions - no_of_general_questions;

      console.log("No. of course questions=>>>>>>>", no_of_course_questions);

      // const no_of_2_op_questions = Math.ceil((15 * no_of_course_questions)/100);
      // console.log('No. of 2 option questions=>>>>>>>', no_of_2_op_questions);

      // const no_of_4_op_questions = Math.ceil((85 * no_of_course_questions)/100);
      // console.log('No. of 4 option questions=>>>>>>>', no_of_4_op_questions);
      console.log(
        "Total formed",
        no_of_general_questions + no_of_course_questions
      );

      const query = {};

      // if (course_type) {
      //   query.course_type = new RegExp(course_type, "i");
      // }
      // if (course_name) {
      //   query.course_name = new RegExp(course_name, "i");
      // }
      query.course_type = batchData.course_type;
      query.course_name = batchData.course_name;

      query.is_inactive = { $ne: true };
      // query.is_inactive = is_inactive && is_inactive == "true" ? true : false;
      // get 4 options questions
      query.regional_language = "hindi";
      const dataExists = await AnswerSheetModel.findOne({
        user_id: mongoose.Types.ObjectId(user_id),
        exam_id: mongoose.Types.ObjectId(exam_id),
        // question_id: mongoose.Types.ObjectId(ques.question_id),
      });

      if (dataExists) {
        const initiallySavedQuestions = await AnswerSheetModel.aggregate([
          {
            $match: {
              user_id: mongoose.Types.ObjectId(user_id),
              exam_id: mongoose.Types.ObjectId(exam_id),
            },
          },
        ]);
        console.log("Already saved shown");
        res.json({
          message: "Old Questions",
          data: initiallySavedQuestions,
        });

        return;
      }
      // query.number_of_options = 4;

      // let fourOptionQuestions = await Question.aggregate([
      //   {
      //     $match: query,
      //   },
      //   {
      //     $project: { _id: 1 },
      //   },
      // ]);
      //   let allQuestions = await Question.find();
      // console.log(allQuestions);

      // console.log('Matched $ question', fourOptionQuestions);
      //question randomization

      // fourOptionQuestions = _.shuffle(fourOptionQuestions);

      // let selected4OpQues = fourOptionQuestions.slice(0, 60);

      // get 2 options questions

      // query.number_of_options = 2;
      // console.log("==========================");
      // console.log(query);
      // console.log("==========================");
      // let twoOptionsQuestions = await Question.aggregate([
      //   {
      //     $match: query,
      //   },
      //   {
      //     $project: { _id: 1 },
      //   },
      // ]);

      // twoOptionsQuestions = _.shuffle(twoOptionsQuestions);

      // let selected2OpQues = twoOptionsQuestions.slice(0, 10);

      let courseQuestions = await Question.aggregate([
        {
          $match: query,
        },
        {
          $project: { _id: 1 },
        },
      ]);
      console.log(query);

      console.log("course questions", courseQuestions);

      if (courseQuestions.length < no_of_course_questions) {
        res.json({
          success: false,
          message: `Not enough questions of ${batchData.course_name} course in question bank`,
        });
        return;
      }
      let shuffledCourseQuestions = _.shuffle(courseQuestions);
      let selectedCourseQuestions = shuffledCourseQuestions.slice(
        0,
        no_of_course_questions
      );
      //get general type questions

      const genQuery = {};
      genQuery.is_inactive = { $ne: true };
      genQuery.regional_language = "hindi";
      genQuery.course_type = "General";
      let genTypeQuestions = await Question.aggregate([
        {
          $match: genQuery,
        },
        {
          $project: { _id: 1 },
        },
      ]);
      if (genTypeQuestions.length < no_of_general_questions) {
        res.json({
          success: false,
          message: "Not enough general type questions in question bank!!",
        });
        return;
      }

      let shuffledGenTypeQuestions = _.shuffle(genTypeQuestions);
      let selectedGenTypeQuestions = shuffledGenTypeQuestions.slice(
        0,
        no_of_general_questions
      );
      console.log("========================================>");
      // console.log("2OPTION", selected2OpQues.length);
      // console.log("4OPTION", selected4OpQues.length);
      console.log("GENERAL", selectedGenTypeQuestions.length);
      console.log("Course", selectedCourseQuestions.length);
      console.log("========================================>");
      let questionIds = selectedCourseQuestions.concat(
        selectedGenTypeQuestions
      );
      //   const quesIdArray = [];
      //   for(let ques of questionIds){
      //     quesIdArray.push(ques);

      //   }
      let finalQuestions = await Question.find({
        _id: { $in: questionIds },
      });

      let quesToDisplay = finalQuestions.map((o) => {
        let newO = {
          _id: o._id,
          question: o.question,
          option_1: o.option_1,
          option_2: o.option_2,
          option_3: o.option_3,
          option_4: o.option_4,
          marks: o.marks,
          selectedAnswer: null,
          seen: false,
          status: "unanswered",
        };

        return newO;
      });

      res.json({
        data: quesToDisplay,
        message: "New questions",
      });

      return;
    } catch (error) {
      next(error);
    }
  },
  saveQuestionsInitially: async (req, res, next) => {
    try {
      let quesToSave = [];
      // console.log(req.headers);
      quesToSave = req.body;
      // console.log(quesToSave);
      let i = 0;
      for (let ques of quesToSave) {
        const dataExists = await AnswerSheetModel.findOne({
          user_id: mongoose.Types.ObjectId(ques.user_id),
          exam_id: mongoose.Types.ObjectId(ques.exam_id),
          question_id: mongoose.Types.ObjectId(ques.question_id),
          batch_id: mongoose.Types.ObjectId(ques.batch_id),
        });
        if (!dataExists) {
          ques.created_at = Date.now();
          const newData = new AnswerSheetModel(ques);
          const result = await newData.save();
        }

        // ques.created_at = Date.now();
        // const newData = new AnswerSheetModel(ques);
        // const result = await newData.save();
      }

      res.json("run");
      return;
    } catch (error) {
      next(error);
    }
  },

  getExamSubmittedStatus: async (req, res, next) => {
    try {
      const userId = req.body.userId;
      const examId = req.body.examId;

      const dataExists = await AuditAttendanceSheetModel.findOne({
        user_id: mongoose.Types.ObjectId(userId),
        exam_id: mongoose.Types.ObjectId(examId),
      });

      if (dataExists.attendance != 'absent') {
        res.json({ message: true, data: dataExists });
      } else {
        res.json({ message: false, data: dataExists });
      }

      // console.log(dataExists);
      return;
    } catch (error) {
      next(error);
    }
  },
  reScheduleExam1: async (req, res, next) => {
    try {
      const data = req.body;
      const newExamData = data.newExamData;
      const examId = data.exam_id;
      // const failedStudentsList = data.resultList;

      console.log(examId);

      const examBatch = await Model.findOne({ _id: examId });
      // console.log(examData);
      const examData = await Model.aggregate([
        {
          $match: { parent_exam: { $exists: true }, _id: examId },
        },
      ]);

      console.log(examData.length);
      if (examData.length > 0) {
        console.log(examData);
        const parentExamId = examData.parent_exam;
        const parentExamBatch = await Model.findOne({ _id: parentExamId });
        const parentExamData = await Model.aggregate([
          {
            $match: { parent_exam: { $exists: true }, _id: parentExamId },
          },
        ]);

        console.log("adhjgdyutd", parentExamData);
        if (parentExamData.length > 0) {
          console.log("Grand parent Found");
          res.json({ message: "Sorry this was last attempt exam!" });
          return;
        } else {
          // const batchIdArray = prevAttemptExamData.batch_id;
          const created_at = Date.now();
          const newExam = {
            exam_name: newExamData.exam_name,
            exam_code: new_examData.exam_code,
            course_type: new_examData.course_type,
            course_name: new_examData.course_name,
            exam_date: newExamData.exam_date,
            exam_time: newExamData.exam_time,
            parent_exam: parentExamId._id,
            batch_id: parentExamBatch.batch_id,
            is_inactive: false,
            created_at: created_at,
          };

          const newData = new Model(newExam);
          const result = await newData.save();
          res.json(result);
          return;
        }
      } else {
        const created_at = Date.now();
        const newExam = {
          exam_name: newExamData.exam_name,
          exam_code: newExamData.exam_code,
          course_type: newExamData.course_type,
          course_name: newExamData.course_name,
          exam_date: newExamData.exam_date,
          exam_time: newExamData.exam_time,
          parent_exam: examId,
          batch_id: examBatch.batch_id,
          is_inactive: false,
          created_at: created_at,
        };

        const newData = new Model(newExam);
        const result = await newData.save();
        res.json(result);
        return;
      }
    } catch (error) {
      next(error);
    }
  },

  reScheduleExam: async (req, res, next) => {
    try {
      const data = req.body;
      console.log("data fetched to backend", data);
      const newExamData = data.newExamData;
      const failedStudentIds = data.failedStudentIds;
      const examId = data.exam_id;
      const currentExamData = await Model.findOne({ _id: examId });
      const parentExamId = currentExamData.parent_exam;
      // console.log(parentExamId);
      const failedStudentReports = await ExamReport.find({
        Exam_id: data.exam_id,
        Result: "Fail",
      });
      console.log(failedStudentReports);
      const failedStudents = [];
      for (let report of failedStudentReports) {
        const student = await User.findOne({
          _id: mongoose.Types.ObjectId(report.Student_id),
        });
        failedStudents.push(student);
      }

      if (parentExamId) {
        const parentExamData = await Model.findOne({ _id: parentExamId });
        console.log("Parent Exam exists");
        console.log(parentExamData);
        const grandParentId = parentExamData.parent_exam;
        // console.log(grandParentId);
        if (grandParentId) {
          const grandParentExamData = await Model.findOne({
            _id: grandParentId,
          });
          res.send({
            FirstAttemptData: grandParentExamData,
            SecondAttemptData: parentExamData,
            ThirdAttemptData: currentExamData,
            message: "Sorry no more attempts can be given in this exam!!!!",
          });
          return;
        } else {
          console.log("No grand parent exam exists called");
          const created_at = Date.now();
          const newExam = {
            exam_name: newExamData.exam_name,
            exam_code: newExamData.exam_code,
            course_type: currentExamData.course_type,
            course_name: currentExamData.course_name,
            exam_date: newExamData.exam_date,
            exam_time: newExamData.exam_time,
            parent_exam: examId,
            failed_student_ids: failedStudentIds,
            batch_id: currentExamData.batch_id,
            is_inactive: false,
            created_at: created_at,
            exam_duration: currentExamData.exam_duration,
          };

          const newData = new Model(newExam);
          const result = await newData.save();
          for (let index = 0; index < failedStudents.length; index++) {
            const element = failedStudents[index];
            // console.log(element._id);
            // console.log(element.mobile);
            console.log(" SMS 3rd ATTEMPT CALLED");

            try {
              const smsAttempt3 = await sms3rdAttempt(
                element.mobile,
                newExam.exam_date,
                newExam.exam_time
              );

              console.log("smsAttempt3", smsAttempt3.data);
            } catch (error) {
              console.log(error);
            }
          }
          res.json(result);

          return;
        }
      } else {
        console.log("No parent exam exists called");
        const created_at = Date.now();
        const newExam = {
          exam_name: newExamData.exam_name,
          exam_code: newExamData.exam_code,
          course_type: currentExamData.course_type,
          course_name: currentExamData.course_name,
          exam_date: newExamData.exam_date,
          exam_time: newExamData.exam_time,
          failed_student_ids: failedStudentIds,
          exam_duration: currentExamData.exam_duration,
          parent_exam: examId,
          batch_id: currentExamData.batch_id,
          is_inactive: false,
          created_at: created_at,
        };

        const newData = new Model(newExam);
        const result = await newData.save();
        for (let index = 0; index < failedStudents.length; index++) {
          const element = failedStudents[index];
          console.log("used in sms >>>>>>>>>>>>", element);
          console.log(element.mobile);
          console.log(" SMS2nd ATTEMPT CALLED");

          try {
            const smsAttempt2 = await sms2ndAttempt(
              element.mobile,
              newExam.exam_date,
              newExam.exam_time
            );

            console.log("smsAttempt2", smsAttempt2.data);
          } catch (error) {
            console.log(error);
          }
        }

        res.json(result);

        return;
      }
    } catch (error) {
      next(error);
    }
  },
  checkIfAlreadyReScheduled: async (req, res, next) => {
    try {
      const { id } = req.query;
      const examData = await Model.findOne({
        _id: mongoose.Types.ObjectId(id),
      });
      console.log(examData);
      const existingReScheduledExam = await Model.findOne({
        parent_exam: mongoose.Types.ObjectId(id),
      });
      console.log(existingReScheduledExam);
      if (existingReScheduledExam) {
        res.json({
          success: true,
          message: "Sorry Exam is already rescheduled!",
        });
        return;
      } else {
        res.json({ success: false, message: "No reScheduled exam" });
        return;
      }
    } catch (error) {
      next(error);
    }
  },
  checkIfExamIsLastAttempt: async (req, res, next) => {
    try {
      const { id } = req.query;
      const examData = await Model.findOne({
        _id: mongoose.Types.ObjectId(id),
      });
      const parentExamId = examData.parent_exam;
      if (parentExamId) {
        const parentExamData = await Model.findOne({
          _id: mongoose.Types.ObjectId(parentExamId),
        });
        const grandParentExamId = parentExamData.parent_exam;
        if (grandParentExamId) {
          res.json({ success: false, message: "Exam cannot be re-scheduled" });
          return;
        } else {
          res.json({ success: true, message: "Exam can be re-scheduled" });

          return;
        }
      } else {
        res.json({ success: true, message: "Exam can be re-scheduled" });

        return;
      }
    } catch (error) { }
  },
  count: async (req, res, next) => {
    try {
      const { title, disabled, is_inactive, page, limit, sort } = req.query;
      const _page = page ? parseInt(page) : 1;
      const _limit = limit ? parseInt(limit) : 20;
      const _skip = (_page - 1) * _limit;
      const _sort = sort ? sort : "+title";
      const query = {};
      if (title) {
        query.title = new RegExp(title, "i");
      }
      query.disabled = disabled && disabled == "true" ? true : false;
      query.is_inactive = is_inactive && is_inactive == "true" ? true : false;
      const result = await Model.countDocuments(query);
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return res.status(501).json({ error: err });
        }
        const { id } = req.params;
        const data = req.body;
        if (!id) {
          throw createError.BadRequest("Invalid Parameters");
        }
        if (!data) {
          throw createError.BadRequest("Invalid Parameters");
        }
        data.updated_at = Date.now();
        const result = await Model.updateOne(
          { _id: mongoose.Types.ObjectId(id) },
          { $set: data }
        );
        res.json(result);
        return;
      });
    } catch (error) {
      next(error);
    }
  },
  updateByTitle: async (req, res, next) => {
    try {
      const { title } = req.params;
      const data = req.body;
      if (!title) {
        throw createError.BadRequest("Invalid Parameters");
      }
      if (!title) {
        throw createError.BadRequest("Invalid Parameters");
      }
      data.updated_at = Date.now();
      const result = await Model.updateOne(
        { title: title, is_inactive: false },
        { $set: data }
      );
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  },

  finalExammSubmit: async (req, res, next) => {
    try {
      const { mobile } = req.query;
      if (!mobile) {
        throw createError.BadRequest("Invalid Parameters");
      }
      console.log("smsExamFinalSubmit Mobile >>>", mobile);

      const smsExamFinalSubmit = await AssessmentSubmit(mobile);

      console.log("smsExamFinalSubmit", smsExamFinalSubmit.data);

      res.send({ success: true });
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const deleted_at = Date.now();
      const result = await Model.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { is_inactive: true, deleted_at } }
      );
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  },
  restore: async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw createError.BadRequest("Invalid Parameters");
      }
      const dataToBeDeleted = await Model.findOne(
        { _id: mongoose.Types.ObjectId(id) },
        { name: 1 }
      );
      if (!dataToBeDeleted) {
        throw createError.NotFound(`${ModelName} Not Found`);
      }
      const dataExists = await Model.findOne({
        name: dataToBeDeleted.name,
        is_inactive: false,
      });
      if (dataExists) {
        throw createError.Conflict(`${ModelName} already exists`);
      }
      const restored_at = Date.now();
      const result = await Model.updateOne(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { is_inactive: false, restored_at } }
      );
      res.json(result);
      return;
    } catch (error) {
      next(error);
    }
  },
  getDemoExamQuestions: async (req, res, next) => {
    try {
      let questions = await Question.find({ course_type: "General" });
      // console.log(questions);
      console.log(questions.length);
      try {
        questions = _.shuffle(questions);
      } catch (error) {
        console.log("shuffle error", error)
      }
      const questions20 = questions.slice(0, 20);
      let quesToDisplay = questions20.map((o) => {
        let newO = {
          _id: o._id,
          question: o.question,
          option_1: o.option_1,
          option_2: o.option_2,
          option_3: o.option_3,
          option_4: o.option_4,
          marks: o.marks,
          selectedAnswer: null,
          seen: false,
          status: "unanswered",
        };

        return newO;
      });

      console.log(quesToDisplay.length);
      res.json(quesToDisplay);
      return;
    } catch (error) { }
  },
};
