const Model = require("../Models/AnswerSheet.model");
const QuestionModel = require("../Models/Question.model");
const ExamModel = require("../Models/Exam.model");
const createError = require("http-errors");
const mongoose = require("mongoose");
const ModelName = "activityLog";
const UserModel = require("../Models/Auth.model");
const BatchModel = require("../Models/Batch.model");
const { upload } = require("./../Helpers/helper_functions");
const ExamReportModel = require("../Models/ExamReport.model");

const { smsPassStudent, smsFailStudent } = require("./../Helpers/smsCalls");

module.exports = {
  updatedAnswer: async (req, res, next) => {
    try {
      //   console.log("function started");
      const data = req.body;
      const dataExists = await Model.findOne({
        user_id: data.user_id,
        exam_id: data.exam_id,
        question_id: data.question_id,
      });
      if (dataExists) {
        console.log("if called and data exists", dataExists);
        if (data.userAnswer != null) {
          const updatedAnswer = await Model.updateOne(
            { _id: dataExists._id },
            {
              $set: {
                userAnswer: data.userAnswer,
                status: data.status,
                seen: data.seen,
                updated_at: Date.now(),
              },
            }
          );
          console.log("updated answer", updatedAnswer);

          res.json(updatedAnswer);
          return;
        } else {
          const updatedAnswer = await Model.updateOne(
            { _id: dataExists._id },
            { $set: { userAnswer: null, status: "unanswered" } }
          );
          console.log("updated answer", updatedAnswer);

          res.json(updatedAnswer);
          return;
        }
      } else {
        console.log("else called");
        // throw createError.Conflict("Question Exists!!!");
        const saveAnswer = req.body;

        console.log("save answer", saveAnswer);
        const newData = new Model(saveAnswer);
        const result = await newData.save();

        console.log("result", result);

        res.json(result);
        return;
      }
    } catch (error) {
      next(error);
    }
  },

  generateResult: async (req, res, next) => {
    try {
      const data = req.body;
      console.log(data.user_id);
      const studentAnswers = await Model.aggregate([
        {
          $match: {
            // user_name: "Demo User1"
            user_id: mongoose.Types.ObjectId(data.user_id),
            exam_id: mongoose.Types.ObjectId(data.exam_id),
          },
        },
      ]);
      console.log("matched", studentAnswers);
      let seenAnswers = 0;
      let answered = 0;
      let totalMarks = 0;
      let correctAnswers = 0;
      let incorrectAnswers = 0;

      for (let ans of studentAnswers) {
        console.log(ans);
        const ques = await QuestionModel.findOne({ _id: ans.question_id });
        // console.log(ques);
        if (ques.correct_option == ans.userAnswer) {
          totalMarks = totalMarks + ques.marks;
          answered = answered + 1;
          seenAnswers = seenAnswers + 1;
          correctAnswers = correctAnswers + 1;
        } else {
          answered = answered + 1;
          seenAnswers = seenAnswers + 1;
          incorrectAnswers = incorrectAnswers + 1;
        }
      }

      res.json({
        TotalMarks: totalMarks,
        CorrectAnswers: correctAnswers,
        IncorrectAnswers: incorrectAnswers,
        Answered: answered,
        TotalSeen: seenAnswers,
      });
      return;
    } catch (error) {
      next(error);
    }
  },
  showAttendenceList: async (req, res, next) => {
    try {
      const data = req.body;
      const examId = data.exam_id;
      console.log(examId);
      const exam = await ExamModel.findOne({
        _id: mongoose.Types.ObjectId(examId),
      });
      const batchIds = exam.batch_id;
      allStudents = [];
      newAllStudents = [];

      for (let bId of batchIds) {
        const matchedStudents = await UserModel.aggregate([
          {
            $match: { batch: mongoose.Types.ObjectId(bId) },
          },
        ]);
        allStudents = [...allStudents, ...matchedStudents];
      }

      const parentExamId = exam.parent_exam;
      if (parentExamId) {
        for (let student of allStudents) {
          const parentExamReport = await ExamReportModel.findOne({
            Exam_id: parentExamId,
            Student_id: student.Student_id,
          });
          if (parentExamReport) {
            if (parentExamReport.Result == "Fail") {
              const studentFound = await Model.findOne({
                user_id: student._id,
                exam_id: mongoose.Types.ObjectId(examId),
              });

              if (studentFound) {
                student.attendenceStatus = "Present";
                console.log(studentFound);
              } else {
                student.attendenceStatus = "Absent";
              }

              newAllStudents.push(student);
              res.json(newAllStudents);
              return;
            }
          }
        }
      } else {
        for (let student of allStudents) {
          const studentFound = await Model.findOne({
            user_id: student._id,
            exam_id: mongoose.Types.ObjectId(examId),
          });

          if (studentFound) {
            student.attendenceStatus = "Present";
            console.log(studentFound);
          } else {
            student.attendenceStatus = "Absent";
          }
        }
        res.json(allStudents);
        return;
      }
    } catch (error) {
      next(error);
    }
  },
  getTotalCount: async (req, res, next) => {
    try {
      const { exam_id } = req.query;
      const exam = await ExamModel.findOne({
        _id: mongoose.Types.ObjectId(exam_id),
      });
      console.log(exam);
      const batchIds = exam.batch_id;
      console.log(exam.batch_id);
      allStudents = [];
      newAllStudents = [];
      let count = 0;
      for (let bId of batchIds) {
        const matchedStudents = await UserModel.aggregate([
          {
            $match: { batch: mongoose.Types.ObjectId(bId) },
          },
        ]);

        allStudents = [...allStudents, ...matchedStudents];
      }

      console.log("current Exam", exam);
      const parentExamId = exam.parent_exam;
      if (parentExamId) {
        for (let student of allStudents) {
          console.log(student);
          const parentExamReport = await ExamReportModel.findOne({
            Exam_id: parentExamId,
            Student_id: student._id,
          });
          if (parentExamReport) {
            if (parentExamReport.Result == "Fail") {
              newAllStudents.push(student);
            }
          }
        }
        count = newAllStudents.length;
      } else {
        count = allStudents.length;
      }

      res.json({ TotalCount: count });
    } catch (error) {
      next(error);
    }
  },

  showResultsToAdmin: async (req, res, next) => {
    try {
      console.log("This function is called");
      const data = req.body;
      const examId = data.exam_id;
      // console.log(examId)
      const exam = await ExamModel.findOne({
        _id: new mongoose.Types.ObjectId(examId),
      });
      const batchIds = exam.batch_id;
      allStudents = [];

      for (let bId of batchIds) {
        const matchedStudents = await UserModel.aggregate([
          {
            $match: { batch: new mongoose.Types.ObjectId(bId) },
          },
        ]);
        // console.log(matchedStudents);
        allStudents = [...allStudents, ...matchedStudents];
      }
      for (const std of allStudents) {
        // const result = await UserModel.findOne({ _id: mongoose.Types.ObjectId(stdId) }, { mobile: 1 })
      }
      const answerSheets = [];
      const absentStudents = [];
      // console.log(matchedStudents);

      for (let student of allStudents) {
        var matchQuery = {
          user_id: student._id,
          exam_id: new mongoose.Types.ObjectId(examId),
          // user_id: mongoose.Types.ObjectId('6458bdc4b78bea542ea397ac'),
          // exam_id: mongoose.Types.ObjectId('6458c166b78bea542ea3986a')
        };
        const studentAnswers = await Model.aggregate([
          {
            $match: matchQuery,
          },
        ]);
        // console.log("matchedAnswers>>>>>>>>>>>>", studentAnswers);
        if (studentAnswers.length > 0) {
          let seenAnswers = 0;
          let answered = 0;
          let correctAnswers = 0;
          let incorrectAnswers = 0;
          let totalMarks = 0;
          let studentMarks = 0;

          for (let ans of studentAnswers) {
            const ques = await QuestionModel.findOne({ _id: ans.question_id });
            // console.log('Question ',ans.question_id,ques);
            // console.log('answerSheet',ans._id);

            if (ques) {
              totalMarks = totalMarks + ques.marks;

              if (ques.correct_answer == ans.userAnswer) {
                studentMarks = studentMarks + ques.marks;
                answered = answered + 1;
                seenAnswers = seenAnswers + 1;
                correctAnswers = correctAnswers + 1;
              } else if (
                ques.correct_answer != ans.userAnswer &&
                ans.userAnswer != null
              ) {
                // answered = answered + 1;
                answered = answered + 1;

                seenAnswers = seenAnswers + 1;
                incorrectAnswers = incorrectAnswers + 1;
              } else {
                seenAnswers = seenAnswers + 1;
              }
            }
          }
          let resultPercent = (studentMarks / totalMarks) * 100;
          let status = "";
          let grade = "";

          // if (resultPercent >= 40) {
          //   status = "Pass";
          // } else {
          //   status = "Fail";
          // }

          switch (true) {
            case resultPercent >= 75:
              status = "Pass";
              grade = "A+";
              console.log("A+");
              break;
            case resultPercent >= 60:
              status = "Pass";
              grade = "A";
              console.log("A");
              break;
            case resultPercent >= 50:
              status = "Pass";
              grade = "B";
              console.log("B");
              break;
            case resultPercent >= 40:
              status = "Pass";
              grade = "C";
              console.log("C");
              break;

            default:
              status = "Fail";
              grade = "F";
              console.log("Fail");
          }
          const createdOn = Date.now();

          let studentData = {
            Student_id: student._id,
            Student_name: student.full_name,
            StudentMarks: studentMarks,

            CorrectAnswers: correctAnswers,
            IncorrectAnswers: incorrectAnswers,
            Answered: answered,
            TotalSeen: seenAnswers,
            TotalMarks: totalMarks,
            Result: status,
            Absent: false,
            Exam_id: data.exam_id,
            Batch_id: exam.batch_id,
            created_on: createdOn,
            grade: grade,
          };
          const dataExists = await ExamReportModel.findOne({
            Student_id: student._id,
            Student_name: student.full_name,
            Exam_id: data.exam_id,
          });
          if (!dataExists) {
            try {
              // const std = await userModel.findOne({
              //   _id: student._id,
              //   is_inactive: false,
              // });
              // const smsFail = await smsFailStudent(std.mobile);
              // const smsPass = await smsPassStudent(std.mobile);
              
              //  if (status == 'Fail') {

              //   console.log("#########################smsBatchcalled Fail");
              // }
            } catch (error) {
              console.log(error);
            }

            const newData = new ExamReportModel(studentData);
            const result = await newData.save();
          }
          answerSheets.push(studentData);
        } else {
          const dataExists = await ExamReportModel.findOne({
            Student_id: student._id,
            Student_name: student.full_name,
            Exam_id: data.exam_id,
          });
          if (!dataExists) {
            const examData = await ExamModel.findOne({
              _id: mongoose.Types.ObjectId(examId),
            });
            console.log("Current Exam Data", examData);
            const parentExamId = examData.parent_exam;
            if (parentExamId) {
              console.log("Parent Exam", parentExamId);
              const parentExamReport = await ExamReportModel.findOne({
                Exam_id: parentExamId,
                Student_id: student._id,
              });
              console.log("Parent Exam Report", parentExamReport);
              if (parentExamReport) {
                // console.log("Parent Exam Report", parentExamReport);
                if (parentExamReport.Result == "Fail") {
                  const createdOn = Date.now();

                  let studentData = {
                    Student_id: student._id,
                    Student_name: student.full_name,
                    StudentMarks: 0,

                    CorrectAnswers: 0,
                    IncorrectAnswers: 0,
                    Answered: 0,
                    TotalSeen: 0,
                    TotalMarks: 0,
                    Result: "Fail",
                    Absent: true,
                    Exam_id: data.exam_id,
                    Batch_id: exam.batch_id,
                    grade: "F",

                    created_on: createdOn,
                  };
                  console.log("if data doesn't exist called");
                  const newData = new ExamReportModel(studentData);
                  const result = await newData.save();
                  absentStudents.push(studentData);
                }
              }
            } else {
              const createdOn = Date.now();

              let studentData = {
                Student_id: student._id,
                Student_name: student.full_name,
                StudentMarks: 0,

                CorrectAnswers: 0,
                IncorrectAnswers: 0,
                Answered: 0,
                TotalSeen: 0,
                TotalMarks: 0,
                Result: "Fail",
                Absent: true,
                Exam_id: data.exam_id,
                Batch_id: exam.batch_id,
                grade: "F",

                created_on: createdOn,
              };
              console.log("if data doesn't exist called");
              const newData = new ExamReportModel(studentData);
              const result = await newData.save();
              absentStudents.push(studentData);
            }
          } else {
            absentStudents.push(dataExists);
          }
        }
      }
      let concatinatedString = answerSheets.concat(absentStudents);
      for (let stu of concatinatedString) {
        console.log("Concatinated String student", stu);
        // if (stu.Result == "Pass") {
        //   console.log("pass sms", stu);
        //   try {
        //     const smsAttempt = await smsPassStudent(stu.Student_id);

        //     // console.log("smsAttempt", smsAttempt.data);
        //   } catch (error) {
        //     console.log(error);
        //   }
        // } else {
        //   console.log("fail sms", stu);
        //   try {
        //     const smsAttempt = await smsFailStudent(stu.Student_id);

        //     // console.log("smsAttempt", smsAttempt.data);
        //   } catch (error) {
        //     console.log(error);
        //   }
        // }
      }
      res.json({ Answers: answerSheets, AbsentStudents: absentStudents });
      return;
    } catch (error) {
      next(error);
    }
  },
  testGrades: async (req, res, next) => {
    try {
      const { resultPercent } = req.query;
      switch (true) {
        case resultPercent >= 75:
          console.log("A+");
          break;
        case resultPercent >= 60:
          console.log("A");
          break;
        case resultPercent >= 50:
          console.log("B");
          break;
        case resultPercent >= 40:
          console.log("C");
          break;

        default:
          console.log("Fail");
      }
      res.json("Compoiled");
      return;
    } catch (error) {
      next(error);
    }
  },
  showPassedResultsToAdmin: async (req, res, next) => {
    try {
      const data = req.body;
      const examId = data.exam_id;
      // console.log(examId)
      const exam = await ExamModel.findOne({
        _id: mongoose.Types.ObjectId(examId),
      });
      // console.log(exam);
      const batchIds = exam.batch_id;
      // console.log('these are batch ids>>>>>',batchIds);
      allStudents = [];

      for (let bId of batchIds) {
        const matchedStudents = await UserModel.aggregate([
          {
            $match: { batch: mongoose.Types.ObjectId(bId) },
          },
        ]);
        // console.log(matchedStudents);
        allStudents = [...allStudents, ...matchedStudents];
      }
      const answerSheets = [];

      // console.log(matchedStudents);

      for (let student of allStudents) {
        var matchQuery = {
          user_id: student._id,
          exam_id: mongoose.Types.ObjectId(examId),
          // user_id: mongoose.Types.ObjectId('6458bdc4b78bea542ea397ac'),
          // exam_id: mongoose.Types.ObjectId('6458c166b78bea542ea3986a')
        };
        const studentAnswers = await Model.aggregate([
          {
            $match: matchQuery,
          },
        ]);
        // console.log("matchedAnswers>>>>>>>>>>>>", studentAnswers);
        if (studentAnswers.length > 0) {
          let seenAnswers = 0;
          let answered = 0;
          let correctAnswers = 0;
          let incorrectAnswers = 0;
          let totalMarks = 0;
          let studentMarks = 0;

          for (let ans of studentAnswers) {
            const ques = await QuestionModel.findOne({ _id: ans.question_id });
            // console.log(ques);
            totalMarks = totalMarks + ques.marks;

            if (ques.correct_answer == ans.userAnswer) {
              studentMarks = studentMarks + ques.marks;
              answered = answered + 1;
              seenAnswers = seenAnswers + 1;
              correctAnswers = correctAnswers + 1;
            } else if (
              ques.correct_answer != ans.userAnswer &&
              ans.userAnswer != null
            ) {
              // answered = answered + 1;
              answered = answered + 1;

              seenAnswers = seenAnswers + 1;
              incorrectAnswers = incorrectAnswers + 1;
            } else {
              seenAnswers = seenAnswers + 1;
            }
          }
          let resultPercent = (studentMarks / totalMarks) * 100;
          let status = "";
          if (resultPercent >= 40) {
            status = "Pass";
          } else {
            status = "Fail";
          }
          const createdOn = Date.now();

          let studentData = {
            Student_id: student._id,
            Student_name: student.full_name,
            StudentMarks: studentMarks,

            CorrectAnswers: correctAnswers,
            IncorrectAnswers: incorrectAnswers,
            Answered: answered,
            TotalSeen: seenAnswers,
            TotalMarks: totalMarks,
            Result: status,
            Exam_id: data.exam_id,
            created_on: createdOn,
          };

          if (studentData.Result == "Pass") {
            answerSheets.push(studentData);
          }
        }
      }
      res.json(answerSheets);
      return;
    } catch (error) {
      next(error);
    }
  },
  showFailedResultsToAdmin: async (req, res, next) => {
    try {
      const data = req.body;
      const examId = data.exam_id;
      // console.log(examId)
      const exam = await ExamModel.findOne({
        _id: mongoose.Types.ObjectId(examId),
      });
      // console.log(exam);
      const batchIds = exam.batch_id;
      // console.log('these are batch ids>>>>>',batchIds);
      allStudents = [];

      for (let bId of batchIds) {
        const matchedStudents = await UserModel.aggregate([
          {
            $match: { batch: mongoose.Types.ObjectId(bId) },
          },
        ]);
        // console.log(matchedStudents);
        allStudents = [...allStudents, ...matchedStudents];
      }
      const answerSheets = [];
      const absentStudents = [];

      // console.log(matchedStudents);

      for (let student of allStudents) {
        var matchQuery = {
          user_id: student._id,
          exam_id: mongoose.Types.ObjectId(examId),
          // user_id: mongoose.Types.ObjectId('6458bdc4b78bea542ea397ac'),
          // exam_id: mongoose.Types.ObjectId('6458c166b78bea542ea3986a')
        };
        const studentAnswers = await Model.aggregate([
          {
            $match: matchQuery,
          },
        ]);
        // console.log("matchedAnswers>>>>>>>>>>>>", studentAnswers);
        if (studentAnswers.length > 0) {
          let seenAnswers = 0;
          let answered = 0;
          let correctAnswers = 0;
          let incorrectAnswers = 0;
          let totalMarks = 0;
          let studentMarks = 0;

          for (let ans of studentAnswers) {
            const ques = await QuestionModel.findOne({ _id: ans.question_id });
            // console.log(ques);
            totalMarks = totalMarks + ques.marks;

            if (ques.correct_answer == ans.userAnswer) {
              studentMarks = studentMarks + ques.marks;
              answered = answered + 1;
              seenAnswers = seenAnswers + 1;
              correctAnswers = correctAnswers + 1;
            } else if (
              ques.correct_answer != ans.userAnswer &&
              ans.userAnswer != null
            ) {
              // answered = answered + 1;
              answered = answered + 1;

              seenAnswers = seenAnswers + 1;
              incorrectAnswers = incorrectAnswers + 1;
            } else {
              seenAnswers = seenAnswers + 1;
            }
          }
          let resultPercent = (studentMarks / totalMarks) * 100;
          let status = "";
          if (resultPercent >= 40) {
            status = "Pass";
          } else {
            status = "Fail";
          }
          const createdOn = Date.now();

          let studentData = {
            Student_id: student._id,
            Student_name: student.full_name,
            StudentMarks: studentMarks,

            CorrectAnswers: correctAnswers,
            IncorrectAnswers: incorrectAnswers,
            Answered: answered,
            TotalSeen: seenAnswers,
            TotalMarks: totalMarks,
            Result: status,
            Exam_id: data.exam_id,
            created_on: createdOn,
          };

          if (studentData.Result == "Fail") {
            answerSheets.push(studentData);
          }
        } else {
          absentStudents.push(student);
        }
      }
      res.json({ Answers: answerSheets, AbsentStudents: absentStudents });
      return;
    } catch (error) {
      next(error);
    }
  },
  checkIfAlreadyProcessed: async (req, res, next) => {
    try {
      const { examId } = req.query; // from frontend request
      if (!examId) {
        return res.status(400).json({ success: false, message: "examId is required" });
      }
  
      // Check if any exam reports exist for this exam
      const reportExists = await ExamReportModel.findOne({
        Exam_id: new mongoose.Types.ObjectId(examId),
      });
  
      if (reportExists) {
        return res.json({ success: true, message: "Reports already processed" });
      } else {
        return res.json({ success: false, message: "Reports not processed yet" });
      }
    } catch (error) {
      next(error);
    }
  },
};

