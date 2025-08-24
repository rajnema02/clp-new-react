import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiService from "../../Services/api.service";

const QuestionPaper = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [user, setUser] = useState(null);
  const [questionList, setQuestionList] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [remainingTime, setRemainingTime] = useState("");
  const [userSubmit, setUserSubmit] = useState(false);
  const [demoExam, setDemoExam] = useState(false);
  const [submitFinalExam, setSubmitFinalExam] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState("");
  const [globalIndex, setGlobalIndex] = useState(1);
  const [questionCount, setQuestionCount] = useState(0);
  const [goBackButton, setGoBackButton] = useState(true);
  const [timer, setTimer] = useState(0);
  const [endTime, setEndTime] = useState(null);
  const [examId, setExamId] = useState("");
  const [examName, setExamName] = useState("");
  const [courseType, setCourseType] = useState("");
  const [courseName, setCourseName] = useState("");
  const [duration, setDuration] = useState("90 Mins.");

  // Use refs to store interval IDs and prevent multiple intervals
  const timerIntervalRef = useRef(null);
  const remainingTimeIntervalRef = useRef(null);
  const hasSubmittedRef = useRef(false);

  // Environment config
  const env = { 
    url: 'http://localhost:3000' 
  };

  // Helper function to get user ID - handles both _id and id formats
  const getUserId = (userData) => {
    return userData?._id || userData?.id;
  };

  // Helper function to validate user data
  const isValidUser = (userData) => {
    const userId = getUserId(userData);
    return userData && userId && userId !== 'undefined' && userId.toString().trim() !== '';
  };

  // ================= CLEANUP INTERVALS =================
  const cleanupIntervals = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (remainingTimeIntervalRef.current) {
      clearInterval(remainingTimeIntervalRef.current);
      remainingTimeIntervalRef.current = null;
    }
  };

  // ================= FETCH DATA ==================
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Validate exam ID first
        if (!id || id.trim() === '') {
          setError("Invalid exam ID provided");
          setLoading(false);
          return;
        }

        console.log("Exam ID from params:", id);

        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!isValidUser(storedUser)) {
          alert("Please Login to perform this exam!!");
          navigate("/studentlogin");
          return;
        }

        console.log("Stored user data:", storedUser);
        
        setUser(storedUser);

        // Get user details with validated user ID
        await getUserDetails(getUserId(storedUser));

        // Set exam ID first, then get exam data
        setExamId(id);
        await getExam(id);
      } catch (err) {
        console.error("Error in fetchData", err);
        setError("Failed to load exam data: " + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup on unmount
    return () => {
      cleanupIntervals();
    };
  }, [id, navigate]);

  // Get User Details
  const getUserDetails = async (userId) => {
    try {
      // Validate userId before making API call
      if (!userId || userId === 'undefined' || userId.toString().trim() === '') {
        console.error("Invalid user ID provided:", userId);
        return;
      }

      console.log("Fetching user details for ID:", userId);
      const resp = await apiService.get(`/auth/profile/${userId}`);
      if (resp.data) {
        setUserName(resp.data.full_name || resp.data.name || '');
        setUserImage(resp.data.profile_photo || '');
        console.log("User details loaded:", resp.data);
      }
    } catch (err) {
      console.error("Error fetching user details", err);
      // Don't throw error, just log it since user details are not critical for exam functionality
    }
  };

  // Get Exam Details
  const getExam = async (examId) => {
    try {
      console.log("Getting exam with ID:", examId);
      
      if (!examId || examId.trim() === '') {
        throw new Error("Invalid exam ID");
      }

      const resp = await apiService.get(`/exam/${examId}`);
      const examData = resp.data;
      
      console.log("Exam data received:", examData);
      
      setExam(examData);
      setExamName(examData.exam_name);

      // Timer Setup - matching Angular logic
      const examEndTime = new Date(examData.endTime);
      examEndTime.setHours(examEndTime.getHours() - 5); // Subtract 5 hours for IST
      examEndTime.setMinutes(examEndTime.getMinutes() - 30); // Subtract 30 minutes for IST
      setEndTime(examEndTime);
      
      // Start remaining time interval - only once
      if (!remainingTimeIntervalRef.current) {
        remainingTimeIntervalRef.current = setInterval(() => {
          calculateRemainingTime(examEndTime);
        }, 1000);
      }

      // Set exam details
      setCourseType(examData.course_type);
      setCourseName(examData.course_name);
      
      // Calculate timer difference like Angular
      const startTime = new Date(examData.exam_date);
      const currentTime = new Date();
      const endTimeCalc = new Date(examData.exam_date);
      
      startTime.setHours(examData.exam_time.split(":")[0]);
      startTime.setMinutes(examData.exam_time.split(":")[1]);
      
      const dif = endTimeCalc.getTime() - currentTime.getTime();
      const secondsFromT1ToT2 = dif / 1000;
      const timeDifference = Math.abs(secondsFromT1ToT2);
      setTimer(timeDifference);
      
      console.log("Time difference:", dif);

      // Pass examId explicitly to getQuestions
      await getQuestions(examData, examId);
    } catch (err) {
      console.error("Error fetching exam", err);
      setError("Failed to load exam: " + (err.response?.data?.message || err.message));
    }
  };

  // Get Questions - matching Angular approach with proper validation
  const getQuestions = async (examData, currentExamId) => {
    try {
      console.log("Getting questions for exam ID:", currentExamId);
      
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!isValidUser(userData)) {
        console.error("Invalid user data in localStorage:", userData);
        throw new Error("User data not found or invalid. Please login again.");
      }
      
      const userId = getUserId(userData);
      console.log("User ID for questions:", userId);
      
      // Validate all required parameters
      if (!currentExamId || currentExamId.trim() === '' || currentExamId === 'undefined') {
        throw new Error("Exam ID is required and cannot be empty");
      }
      
      if (!examData.course_type || !examData.course_name) {
        console.error("Missing course data:", examData);
        throw new Error("Course type and course name are required");
      }

      const queryParams = new URLSearchParams({
        course_type: examData.course_type,
        course_name: examData.course_name,
        user_id: userId.toString(),
        exam_id: currentExamId.trim() // Ensure no whitespace
      });

      console.log("API call with params:", queryParams.toString());

      const resp = await apiService.get(`/question?${queryParams.toString()}`);
      
      if (!resp.data || !resp.data.data) {
        throw new Error("No questions data received from server");
      }

      const questions = resp.data.data.map((q) => ({
        ...q,
        selectedAnswer: q.userAnswer,
        seen: q.seen || false,
        status: q.status || "unanswered",
      }));

      if (questions.length === 0) {
        throw new Error("No questions found for this exam");
      }

      setQuestionList(questions);
      setCurrentQuestion(questions[0]);
      setQuestionCount(questions.length);
      
      console.log("Questions loaded successfully:", questions.length);
      
      if (resp.data.message === "New questions") {
        console.log("New questions loaded");
      }
      
      startTimer();

    } catch (err) {
      console.error("Error fetching questions details:", err);
      setError("Failed to load questions: " + (err.response?.data?.message || err.message));
    }
  };

  // ================= TIMER =================
  const calculateRemainingTime = (endTime) => {
    if (hasSubmittedRef.current) return;

    const now = new Date();
    const remainTimeInSeconds = endTime.getTime() - now.getTime();
    
    if (remainTimeInSeconds <= 0) {
      setRemainingTime("00:00:00");
      if (!hasSubmittedRef.current) {
        console.log("Time expired - auto submitting exam");
        hasSubmittedRef.current = true;
        submitExam();
      }
      return;
    }

    const remainTime = new Date(remainTimeInSeconds);
    const hours = String(remainTime.getUTCHours()).padStart(2, "0");
    const minutes = String(remainTime.getUTCMinutes()).padStart(2, "0");
    const seconds = String(remainTime.getUTCSeconds()).padStart(2, "0");

    const timeString = `${hours}:${minutes}:${seconds}`;
    setRemainingTime(timeString);
    console.log("Remaining time:", timeString);
  };

  // Start Timer - matching Angular logic
  const startTimer = () => {
    // Clear existing timer if any
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    console.log("Starting timer with initial value:", timer);

    timerIntervalRef.current = setInterval(() => {
      setTimer(prevTimer => {
        if (prevTimer > 0) {
          return prevTimer - 1;
        } else {
          // Clear intervals and submit
          console.log("Timer expired - preparing to submit");
          cleanupIntervals();
          if (!hasSubmittedRef.current) {
            hasSubmittedRef.current = true;
            setUserSubmit(true);
            setGoBackButton(false);
          }
          return 0;
        }
      });
    }, 1000);
  };

  // Get Timer Display
  const getTimer = () => {
    const hours = Math.floor(timer / (60 * 60));
    const minutes = Math.floor(timer / 60 - hours * 60);
    const seconds = Math.floor(timer - minutes * 60 - hours * 60 * 60);
    return `${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;
  };

  // ================= QUESTION NAVIGATION =================
  const previousQuestion = () => {
    const currentIndex = questionList.indexOf(currentQuestion);
    if (currentIndex > 0) {
      setCurrentQuestion(questionList[currentIndex - 1]);
      setGlobalIndex(globalIndex - 1);
    }
  };

  const nextQuestion = () => {
    const currentIndex = questionList.indexOf(currentQuestion);
    if (currentIndex < questionList.length - 1) {
      // Update viewed count logic
      const updatedQuestion = { ...currentQuestion, seen: true };
      const updatedQuestions = [...questionList];
      updatedQuestions[currentIndex] = updatedQuestion;
      setQuestionList(updatedQuestions);
      
      setGlobalIndex(globalIndex + 1);
      setCurrentQuestion(questionList[currentIndex + 1]);
    }
  };

  const submitAndNext = () => {
    logAnswer();
    nextQuestion();
  };

  // Set question as seen
  const seenQuestion = () => {
    setCurrentQuestion(prev => ({ ...prev, seen: true }));
  };

  // ================= ANSWER HANDLING =================
  const saveAnswer = async (opt) => {
    try {
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

      // Update question list
      const currentIndex = questionList.indexOf(currentQuestion);
      const updatedQuestions = [...questionList];
      updatedQuestions[currentIndex] = updatedQuestion;
      setQuestionList(updatedQuestions);
      setCurrentQuestion(updatedQuestion);

      // Log activity and sync answer
      await syncAnswer(updatedQuestion);

    } catch (err) {
      console.error("Error saving answer", err);
      alert("Failed to save answer: " + (err.response?.data?.message || err.message));
    }
  };

  // Log Answer Activity
  const logAnswer = async () => {
    try {
      if (!currentQuestion || !user || !examId) {
        console.log("Missing data for logging:", { currentQuestion: !!currentQuestion, user: !!user, examId });
        return;
      }

      const userId = getUserId(user);
      // Validate user ID
      if (!userId || userId === 'undefined') {
        console.error("Invalid user ID for logging:", user);
        return;
      }

      const data = {
        user_id: userId.toString(),
        user_name: user.full_name || user.name || '',
        exam_id: examId,
        exam_name: exam?.exam_name,
        question_id: currentQuestion._id,
        status: currentQuestion.status,
        answered: currentQuestion.answered,
        answer: currentQuestion.selectedAnswer,
      };

      await apiService.post("/activityLog", data);
      console.log("Activity logged successfully");
    } catch (err) {
      console.error("Error logging answer activity", err);
    }
  };

  // Sync Answer to Backend
  const syncAnswer = async (question) => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!isValidUser(userData) || !examId || !exam) {
        console.log("Missing data for sync:", { userData: !!userData, examId, exam: !!exam });
        return;
      }

      const userId = getUserId(userData);

      const data = {
        user_id: userId.toString(),
        user_name: userData.full_name || userData.name || '',
        exam_id: examId,
        exam_name: exam.exam_name,
        question_id: question.question_id || question._id,
        seen: question.seen,
        question: question.question,
        userAnswer: question.selectedAnswer,
        status: question.status,
      };

      await apiService.post("/answerSheet", data);
      console.log("Answer synced successfully");
    } catch (err) {
      console.error("Error syncing answer", err);
    }
  };

  // ================= SUBMIT HANDLING =================
  const submitExam = async () => {
  try {
    console.log("Submit Exam button clicked");

    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData?.mobile || !userData?._id) {
      alert("User session invalid. Please login again.");
      navigate("/studentlogin");
      return;
    }

    const payload = {
      user_id: userData._id,
      mobile: userData.mobile,
      exam_id: id, // ✅ use 'id' from useParams
    };

    console.log("Submitting payload:", payload);

    const resp = await apiService.post("/exam/finalExamSubmit", payload);

    if (resp.data?.success) {
      alert("Exam submitted successfully!");
      navigate("/student-exam-submit");
    } else {
      alert("Failed: " + (resp.data?.message || "Unknown error"));
    }
  } catch (err) {
    console.error("Submit exam failed", err);
    alert("Failed to submit exam: " + (err.response?.data?.message || err.message));
  }
};



  const handleSubmit = () => {
    setUserSubmit(true);
  };

  const handleGoBack = () => {
    setUserSubmit(false);
    setDemoExam(false);
  };

  const handleBackToHome = () => {
    submitExam();
  };

  const handleGoBackToHome = () => {
    navigate("/student-dashboard");
  };

  const handleLogout = () => {
    cleanupIntervals();
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  // ================= UTILITY FUNCTIONS =================
  const isSelected = (opt) => {
    return currentQuestion?.selectedAnswer === opt;
  };

  const getQuestionIndex = () => {
    const currentIndex = questionList.indexOf(currentQuestion);
    return currentIndex + 1;
  };

  const getAttemptedQuestionCount = () => {
    return questionList?.filter((question) => question.status === "answered").length || 0;
  };

  const getNotVisitedQuestionCount = () => {
    return questionList?.filter(
      (question) => !question.seen && question.status === "unanswered"
    ).length || 0;
  };

  const getViewedQuestionCount = () => {
    return questionList?.filter(
      (question) => question.seen && question.status === "unanswered"
    ).length || 0;
  };

  // Handle question click from navigation panel
  const handleQuestionClick = (question) => {
    setCurrentQuestion(question);
    const questionIndex = questionList.indexOf(question);
    setGlobalIndex(questionIndex + 1);
    if (!question.seen) {
      seenQuestion();
    }
  };

  // ================= RENDER =================
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading exam...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="container mx-auto mt-8 px-4">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <h2 className="font-bold text-lg mb-2">Error</h2>
        <p>{error}</p>
        <button 
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    </div>
  );

  if (!exam || !currentQuestion) return (
    <div className="container mx-auto mt-8 px-4">
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        No exam data found
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Only show when not in submit modes */}
      {!userSubmit && !demoExam && !submitFinalExam && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-bold">
                  <i className="fas fa-file-alt mr-2"></i>
                  {exam?.exam_name}
                </h1>
                <p className="text-blue-100 mt-1">
                  Exam Code: {exam?.exam_code} | 
                  Date: {new Date(exam?.exam_date).toLocaleDateString()} | 
                  Duration: {duration}
                </p>
              </div>
              <div className="flex items-center">
                <div className="text-right mr-3">
                  <span className="block font-semibold">{userName}</span>
                  <small className="text-blue-200">Candidate</small>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
                  <img 
                    alt="Profile" 
                    src={`${env.url}/file/download/${userImage || 'no-image'}`} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timer Bar */}
      {!userSubmit && !demoExam && !submitFinalExam && (
        <div className="bg-gray-800 text-white py-2">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <span className="text-sm text-gray-300">Question</span>
                <p className="font-bold">{getQuestionIndex()}/{questionCount}</p>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-300">Time Remaining</span>
                <p className="font-bold text-yellow-300">{remainingTime}</p>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-300">Timer</span>
                <p className="font-bold text-red-300">{getTimer()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!userSubmit && !demoExam && !submitFinalExam && (
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Question Panel */}
            <div className="w-full lg:w-8/12">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-white px-6 py-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">Question {getQuestionIndex()}</h2>
                </div>
                <div className="p-6">
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div 
                      className="question-text text-gray-700" 
                      dangerouslySetInnerHTML={{ __html: currentQuestion?.question }}
                    ></div>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Select your answer:</h3>
                  
                  <div className="space-y-4">
                    {/* Option A */}
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected(1) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                      onClick={() => saveAnswer(1)}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          isSelected(1) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          A
                        </div>
                        <div 
                          className="option-content text-gray-700" 
                          dangerouslySetInnerHTML={{ __html: currentQuestion?.option_1 }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Option B */}
                    <div 
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        isSelected(2) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                      onClick={() => saveAnswer(2)}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          isSelected(2) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          B
                        </div>
                        <div 
                          className="option-content text-gray-700" 
                          dangerouslySetInnerHTML={{ __html: currentQuestion?.option_2 }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Option C */}
                    {currentQuestion?.option_3 && (
                      <div 
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          isSelected(3) 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                        onClick={() => saveAnswer(3)}
                      >
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            isSelected(3) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            C
                          </div>
                          <div 
                            className="option-content text-gray-700" 
                            dangerouslySetInnerHTML={{ __html: currentQuestion?.option_3 }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Option D */}
                    {currentQuestion?.option_4 && (
                      <div 
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                          isSelected(4) 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                        onClick={() => saveAnswer(4)}
                      >
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            isSelected(4) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
                          }`}>
                            D
                          </div>
                          <div 
                            className="option-content text-gray-700" 
                            dangerouslySetInnerHTML={{ __html: currentQuestion?.option_4 }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <button 
                      className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={previousQuestion} 
                      disabled={getQuestionIndex() === 1}
                    >
                      ← Previous
                    </button>
                    {questionList?.length !== getQuestionIndex() ? (
                      <button 
                        className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                        onClick={submitAndNext}
                      >
                        Save & Next →
                      </button>
                    ) : (
                      <button 
                        className="px-5 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                        onClick={submitExam}
                      >
                        FINAL SUBMIT
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation Panel */}
            <div className="w-full lg:w-4/12">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-white px-6 py-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-800">
                    <i className="fas fa-compass mr-2"></i>
                    Navigation Panel
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div className="bg-blue-100 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-blue-800">{getNotVisitedQuestionCount()}</div>
                      <div className="text-sm text-blue-600 mt-1">Not Viewed</div>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-800">{getViewedQuestionCount()}</div>
                      <div className="text-sm text-yellow-600 mt-1">Not Answered</div>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <div className="text-2xl font-bold text-green-800">{getAttemptedQuestionCount()}</div>
                      <div className="text-sm text-green-600 mt-1">Answered</div>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium text-gray-800 mb-3">Questions:</h3>
                  <div className="grid grid-cols-5 gap-2 mb-6">
                    {questionList.map((ques, i) => (
                      <button
                        key={ques._id}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium text-sm ${
                          currentQuestion?._id === ques._id 
                            ? 'bg-blue-600 text-white' 
                            : ques.status === 'answered' 
                              ? 'bg-green-500 text-white'
                              : ques.seen 
                                ? 'bg-yellow-400 text-gray-800'
                                : 'bg-gray-200 text-gray-700'
                        }`}
                        onClick={() => handleQuestionClick(ques)}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Legend:</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-600 rounded mr-2"></div>
                        <span className="text-sm">Current</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
                        <span className="text-sm">Answered</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
                        <span className="text-sm">Viewed</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                        <span className="text-sm">Not Visited</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {userSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="bg-gray-800 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-semibold">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Confirm Submission
              </h2>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <i className="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
                  <p className="text-blue-700">Are you sure you want to submit your exam? This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Exam Details:</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Exam Name</span>
                    <span className="font-semibold">{exam?.exam_name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Exam Code</span>
                    <span className="font-semibold">{exam?.exam_code}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Exam Date</span>
                    <span className="font-semibold">{new Date(exam?.exam_date).toDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Summary:</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-800">{getNotVisitedQuestionCount()}</div>
                    <div className="text-sm text-blue-600 mt-1">Not Viewed</div>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-800">{getViewedQuestionCount()}</div>
                    <div className="text-sm text-yellow-600 mt-1">Not Answered</div>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-800">{getAttemptedQuestionCount()}</div>
                    <div className="text-sm text-green-600 mt-1">Answered</div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-3">Question Status:</h3>
                <div className="grid grid-cols-8 gap-2">
                  {questionList.map((ques, i) => (
                    <div
                      key={ques._id}
                      className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium ${
                        ques.status === 'answered' 
                          ? 'bg-green-500 text-white'
                          : ques.seen 
                            ? 'bg-yellow-400 text-gray-800'
                            : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t">
                {goBackButton && (
                  <button 
                    className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400"
                    onClick={handleGoBack}
                  >
                    ← Go Back
                  </button>
                )}
                <button 
                  className="px-5 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
                  onClick={handleBackToHome}
                >
                  Submit Exam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Final Submit Modal */}
      {submitFinalExam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
            <div className="text-green-500 text-6xl mb-4">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Exam Submitted Successfully!</h3>
            <p className="text-gray-600 mb-6">
              Your exam has been submitted successfully. Your results will be announced within the next 2 working days.
            </p>
            <button 
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              onClick={handleGoBackToHome}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionPaper;