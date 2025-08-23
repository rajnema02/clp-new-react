import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiService from "../../Services/api.service"; // <-- using your api file

const QuestionPaper = () => {
  const { id } = useParams(); // examId from route
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [user, setUser] = useState(null);
  const [questionList, setQuestionList] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [remainingTime, setRemainingTime] = useState("");
  const [timer, setTimer] = useState(0);
  const [intervals, setIntervals] = useState([]);

  const [userSubmit, setUserSubmit] = useState(false);
  const [demoExam, setDemoExam] = useState(false);
  const [submitFinalExam, setSubmitFinalExam] = useState(false);

  // ================= FETCH DATA ==================
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      alert("Please login to perform this exam!!");
      navigate("/studentlogin");
      return;
    }
    setUser(storedUser);

    if (id) {
      getExam(id);
    }
    // Cleanup intervals on unmount
    return () => {
      intervals.forEach((i) => clearInterval(i));
    };
  }, [id, navigate]);

  // Get Exam Details
  const getExam = async (examId) => {
    try {
      const resp = await apiService.get(`/exam/${examId}`);
      const examData = resp.data;
      setExam(examData);

      // Timer Setup
      const endTime = new Date(examData.endTime);
      const interval = setInterval(() => {
        calculateRemainingTime(endTime);
      }, 1000);
      setIntervals((prev) => [...prev, interval]);

      getQuestions(examData);
    } catch (err) {
      console.error("Error fetching exam", err);
    }
  };

  // Get Questions
  const getQuestions = async (examData) => {
    try {
      const resp = await apiService.get(`/exam`, {
        course_type: examData.course_type,
        course_name: examData.course_name,
        user_id: user.id,
        exam_id: examData._id,
      });

      const questions = resp.data.data.map((q) => ({
        ...q,
        selectedAnswer: q.userAnswer || null,
        seen: q.seen || false,
        status: q.status || "unanswered",
      }));

      setQuestionList(questions);
      setCurrentQuestion(questions[0]);
      setTimer(questions.length * 90); // fallback 90 min timer
    } catch (err) {
      console.error("Error fetching questions", err);
    }
  };

  // ================= TIMER =================
  const calculateRemainingTime = (endTime) => {
    const now = new Date();
    const remainTimeInSeconds = endTime.getTime() - now.getTime();

    if (remainTimeInSeconds <= 0) {
      submitExam();
      return;
    }

    const remainTime = new Date(remainTimeInSeconds);
    const hours = String(remainTime.getUTCHours()).padStart(2, "0");
    const minutes = String(remainTime.getUTCMinutes()).padStart(2, "0");
    const seconds = String(remainTime.getUTCSeconds()).padStart(2, "0");
    setRemainingTime(`${hours}:${minutes}:${seconds}`);
  };

  // ================= SUBMIT HANDLING =================
  const submitExam = async () => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u?.mobile) return;

    try {
      const resp = await apiService.get(`/exam/finalExamSubmit`, { mobile: u.mobile });
      if (resp.data) {
        setUserSubmit(false);
        setDemoExam(false);
        setSubmitFinalExam(true);
        navigate("/exam/exam-submit");
      }
    } catch (err) {
      console.error("Submit exam failed", err);
    }
  };

  // Save answer locally + sync
  const saveAnswer = async (opt) => {
    let updatedQuestion = { ...currentQuestion };

    if (updatedQuestion.status === "unanswered") {
      updatedQuestion.selectedAnswer = opt;
      updatedQuestion.seen = true;
      updatedQuestion.status = "answered";
    } else if (
      updatedQuestion.status === "answered" &&
      updatedQuestion.selectedAnswer === opt
    ) {
      updatedQuestion.selectedAnswer = null;
      updatedQuestion.status = "unanswered";
      updatedQuestion.seen = true;
    } else if (
      updatedQuestion.status === "answered" &&
      updatedQuestion.selectedAnswer !== opt
    ) {
      updatedQuestion.selectedAnswer = opt;
      updatedQuestion.seen = true;
    }

    setCurrentQuestion(updatedQuestion);

    // Sync to backend
    const u = JSON.parse(localStorage.getItem("user"));
    const data = {
      user_id: u.id,
      user_name: u.full_name,
      exam_id: exam?._id,
      exam_name: exam?.exam_name,
      question_id: updatedQuestion._id,
      seen: updatedQuestion.seen,
      question: updatedQuestion.question,
      userAnswer: updatedQuestion.selectedAnswer,
      status: updatedQuestion.status,
    };

    try {
      await apiService.post("/answerSheet", data);
    } catch (err) {
      console.error("Answer sync failed", err);
    }
  };

  // ================= RENDER =================
  if (!exam || !currentQuestion) return <div>Loading...</div>;

  return (
    <div className="container">
      {/* Header */}
      <div className="header bg-danger text-white p-3 mb-3 rounded">
        <h2>{exam.exam_name}</h2>
        <p>
          Code: {exam.exam_code} | Date:{" "}
          {new Date(exam.exam_date).toLocaleDateString()}
        </p>
        <div className="d-flex justify-content-between">
          <span>User: {user?.full_name}</span>
          <span>Time Remaining: {remainingTime}</span>
        </div>
      </div>

      {/* Question Panel */}
      <div className="card p-3 mb-3">
        <h5>Q{questionList.indexOf(currentQuestion) + 1}: </h5>
        <div dangerouslySetInnerHTML={{ __html: currentQuestion.question }} />

        {[1, 2, 3, 4].map(
          (opt) =>
            currentQuestion[`option_${opt}`] && (
              <div
                key={opt}
                className={`card my-2 p-2 ${
                  currentQuestion.selectedAnswer === opt
                    ? "bg-primary text-white"
                    : ""
                }`}
                onClick={() => saveAnswer(opt)}
                style={{ cursor: "pointer" }}
              >
                <b>Option {String.fromCharCode(64 + opt)}: </b>
                <span
                  dangerouslySetInnerHTML={{
                    __html: currentQuestion[`option_${opt}`],
                  }}
                />
              </div>
            )
        )}
      </div>

      {/* Navigation */}
      <div className="d-flex justify-content-between">
        <button
          className="btn btn-warning"
          onClick={() => {
            const idx = questionList.indexOf(currentQuestion);
            if (idx > 0) setCurrentQuestion(questionList[idx - 1]);
          }}
        >
          Previous
        </button>

        {questionList.indexOf(currentQuestion) + 1 === questionList.length ? (
          <button className="btn btn-danger" onClick={() => setUserSubmit(true)}>
            Submit
          </button>
        ) : (
          <button
            className="btn btn-danger"
            onClick={() => {
              const idx = questionList.indexOf(currentQuestion);
              if (idx < questionList.length - 1)
                setCurrentQuestion(questionList[idx + 1]);
            }}
          >
            Submit & Next
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionPaper;
