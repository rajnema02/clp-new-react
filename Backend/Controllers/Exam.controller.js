// const Model = require('../Models/Exam.model')
const Model = require("../Models/Exam.model");
const ExamReport = require("../Models/ExamReport.model");
const createError = require("http-errors");
const mongoose = require("mongoose");
const ModelName = "Exam";
const { upload } = require("./../Helpers/helper_functions");
var random = require("mongoose-random");
const Question = require("../Models/Question.model");
const _ = require("lodash");
const AnswerSheetModel = require("../Models/AnswerSheet.model");
const AnswerSheetController = require("../Controllers/AnswerSheet.controller");
const User = require("../Models/Auth.model");
const Batch = require("../Models/Batch.model");
const {
  sms1stAttempt,
  sms2ndAttempt,
  sms3rdAttempt,
  smsExamInstruction,
  smsExamSubmit,
} = require("./../Helpers/smsCalls");

module.exports = {
 create: async (req, res, next) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(501).json({ error: err });
      }

      const data = req.body;

      console.log("Received exam data:", data);

      // Check if exam already exists
      const dataExists = await Model.findOne({
        exam_name: data.exam_name,
        is_inactive: false,
      });
      if (dataExists) {
        throw createError.Conflict(`${ModelName} already exists`);
      }

      // Use first batch ID from array
      const query = {};
      query.batch = data.batch_id[0];
      console.log("Selected batch ID:", query.batch);

      // Get students in that batch
      const students = await User.find({ batch: { $in: [query.batch] } });

      // Find batch data using ObjectId correctly
      const batchData = await Batch.findOne({
        _id: new mongoose.Types.ObjectId(query.batch),
      });

      const total_no_of_questions = batchData.total_no_of_questions;
      const percent_of_course_questions = batchData.percent_of_course_questions;

      if (!total_no_of_questions || !percent_of_course_questions) {
        return res.json({
          success: false,
          message: `Please define Question Scheme first in batch!!!`,
        });
      }

      const percent_of_general_questions = 100 - percent_of_course_questions;

      const no_of_general_questions = Math.floor(
        (percent_of_general_questions * total_no_of_questions) / 100
      );

      const no_of_course_questions = total_no_of_questions - no_of_general_questions;

      // Check course questions availability
      const courseQuestionsCount = await Question.find({
        course_name: batchData.course_name,
        is_inactive: false,
      }).countDocuments(); // <- FIXED

      if (courseQuestionsCount < no_of_course_questions) {
        return res.json({
          success: false,
          message: `Not enough questions of ${batchData.course_name} course in question bank`,
        });
      }

      // Optional: check general questions availability
      const generalQuestionsCount = await Question.find({
        course_type: "General",
        is_inactive: false,
      }).countDocuments(); // <- FIXED

      console.log("Number of students to notify:", students.length);

      for (let student of students) {
        // Optional: SMS notifications logic can go here
      }

      // Prepare exam data
      data.exam_status = "upcoming";
      data.created_at = Date.now();
      data.is_inactive = false;

      if (data.course_type === "Special Training Program") {
        data.exam_attempt = 3;
      }

      const newData = new Model(data);
      await newData.save();

      res.json({
        success: true,
        data: newData,
        message: "Exam Scheduled Successfully!!!",
      });
    });
  } catch (error) {
    next(error);
  }
}
,
// Add this method to your controller
getExamById: async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(createError.BadRequest("Exam ID is required"));
    }

    // Validate and convert to ObjectId
    const exam = await Model.findOne({ 
      _id: mongoose.Types.ObjectId(id),
      is_inactive: false 
    }).lean();

    if (!exam) {
      return next(createError.NotFound(`No exam found with id: ${id}`));
    }

    // Compute exam end time based on start time + duration
    const timeString = exam.exam_time;
    const examDate = new Date(exam.exam_date);
    
    // Combine date and time
    const [hours, minutes] = timeString.split(':');
    examDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const startTimestamp = examDate.getTime();
    const durationInSeconds = parseInt(exam.exam_duration, 10) * 60;
    const endTime = startTimestamp + durationInSeconds * 1000;

    // Return clean response with exam data
    res.json({
      ...exam,
      examId: exam._id,
      endTime,
      startTime: startTimestamp,
    });
  } catch (error) {
    next(error);
  }
},

// Also update your existing get method to be more robust
get: async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(createError.BadRequest("Exam ID is required"));
    }

    // Validate and convert to ObjectId
    const exam = await Model.findOne({ 
      _id: new mongoose.Types.ObjectId(id),
      is_inactive: false 
    }).lean();

    if (!exam) {
      return next(createError.NotFound(`No exam found with id: ${id}`));
    }

    // Compute exam end time based on start time + duration
    const timeString = exam.exam_time;
    const examDate = new Date(exam.exam_date);
    
    // Combine date and time
    const [hours, minutes] = timeString.split(':');
    examDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    const startTimestamp = examDate.getTime();
    const durationInSeconds = parseInt(exam.exam_duration, 10) * 60;
    const endTime = startTimestamp + durationInSeconds * 1000;

    // Return clean response with exam data
    res.json({
      ...exam,
      examId: exam._id,
      endTime,
      startTime: startTimestamp,
    });
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
          res.json(studentsExams);
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
        _id: new mongoose.Types.ObjectId(user_id),
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
      query.number_of_options = 4;

      let fourOptionQuestions = await Question.aggregate([
        {
          $match: query,
        },
        {
          $project: { _id: 1 },
        },
      ]);
      //   let allQuestions = await Question.find();
      // console.log(allQuestions);

      // console.log('Matched $ question', fourOptionQuestions);
      //question randomization

      fourOptionQuestions = _.shuffle(fourOptionQuestions);

      let selected4OpQues = fourOptionQuestions.slice(0, 60);

      // get 2 options questions

      query.number_of_options = 2;
      console.log("==========================");
      console.log(query);
      console.log("==========================");
      let twoOptionsQuestions = await Question.aggregate([
        {
          $match: query,
        },
        {
          $project: { _id: 1 },
        },
      ]);

      twoOptionsQuestions = _.shuffle(twoOptionsQuestions);

      let selected2OpQues = twoOptionsQuestions.slice(0, 10);

      let courseQuestions = selected4OpQues.concat(selected2OpQues);

      //get general type questions

      const genQuery = {};
      genQuery.course_type = "General";
      let genTypeQuestions = await Question.aggregate([
        {
          $match: genQuery,
        },
        {
          $project: { _id: 1 },
        },
      ]);

      genTypeQuestions = _.shuffle(genTypeQuestions);
      let selectedGenTypeQuestions = genTypeQuestions.slice(0, 30);
      console.log("========================================>");
      console.log("2OPTION", selected2OpQues.length);
      console.log("4OPTION", selected4OpQues.length);
      console.log("GENERAL", selectedGenTypeQuestions.length);
      console.log("========================================>");
      let questionIds = courseQuestions.concat(selectedGenTypeQuestions);
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
  getQuestions1: async (req, res, next) => {
    try {
      console.log("byeeeeeeeeeeee");
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

      console.log(req.query);
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

      console.log("@@@@@@@@@@@@@@@@>>>>><<<<<");
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
      
      for (let qtd of quesToDisplay) {
          const AnswerSheetData = new AnswerSheetModel({
            user_id: req.user._id,
            user_name: req.user.full_name,
            exam_id: examData._id,
            batch_id: examData.batch_id[0],
            exam_name: examData.exam_name,
            question_id: qtd._id,
    
            seen: false,
            question: qtd.question,
            option_1: qtd.option_1,
            option_2: qtd.option_2,
            option_3: qtd.option_3,
            option_4: qtd.option_4,
            marks: qtd.marks,
            userAnswer: null,
            status: "unanswered"
          });
          const resultt = await AnswerSheetData.save();
      }

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

      const dataExists = await AnswerSheetModel.findOne({
        user_id: new mongoose.Types.ObjectId(userId),
        exam_id: new mongoose.Types.ObjectId(examId),
      });

      if (dataExists) {
        res.json({ message: true });
      } else {
        res.json({ message: false });
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

            // try {
            //   const smsAttempt3 = await sms3rdAttempt(
            //     element.mobile,
            //     newExam.exam_date,
            //     newExam.exam_time
            //   );

            //   console.log("smsAttempt3", smsAttempt3.data);
            // } catch (error) {
            //   console.log(error);
            // }
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

        //   try {
        //     const smsAttempt2 = await sms2ndAttempt(
        //       element.mobile,
        //       newExam.exam_date,
        //       newExam.exam_time
        //     );

        //     console.log("smsAttempt2", smsAttempt2.data);
        //   } catch (error) {
        //     console.log(error);
        //   }
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
    } catch (error) {}
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

    //   const smsExamFinalSubmit = await smsExamSubmit(mobile);

    //   console.log("smsExamFinalSubmit", smsExamFinalSubmit.data);

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
      //  let questions = await Question.find({ course_type: "General" });
       let questions = await Question.find({ course_type: "Training program for Govt Organisation" });
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
    } catch (error) {}
  },
};
