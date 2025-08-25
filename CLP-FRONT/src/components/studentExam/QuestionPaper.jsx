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
  const [remainingSeconds, setRemainingSeconds] = useState(0);
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
  const [examEndTime, setExamEndTime] = useState(null);
  const [examId, setExamId] = useState("");
  const [examName, setExamName] = useState("");
  const [courseType, setCourseType] = useState("");
  const [courseName, setCourseName] = useState("");
  const [batchName, setBatchName] = useState("");
  const [duration, setDuration] = useState("90 Mins.");
  
  // Counters for question status
  const [notViewed, setNotViewed] = useState(0);
  const [viewed, setViewed] = useState(0);
  const [answered, setAnswered] = useState(0);

  // Use refs to prevent multiple intervals and track submission
  const timerIntervalRef = useRef(null);
  const hasSubmittedRef = useRef(false);
  const autoSubmitTriggeredRef = useRef(false);

  // Environment config
  const env = { 
    url: 'http://localhost:3000' 
  };

  // Helper function to get user ID - handles both _id and id formats
  const getUserId = (userData) => {
    return userData?.id || userData?._id;
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
  };

  // ================= TIMER CALCULATIONS =================
  const calculateExamEndTime = (examData) => {
    try {
      console.log("Raw exam data for timer calculation:", examData);

      // Parse exam date (format: YYYY-MM-DD or ISO string)
      let examDate;
      if (examData.exam_date) {
        examDate = new Date(examData.exam_date);
      } else {
        console.error("No exam_date found in exam data");
        return new Date(Date.now() + (90 * 60 * 1000)); // 90 minutes fallback
      }

      // Parse exam time (formats: "HH:MM", "HH:MM:SS", or "HH:MM AM/PM")
      let startTime = new Date(examDate);
      
      if (examData.exam_time) {
        const timeStr = examData.exam_time.toString().trim();
        console.log("Parsing exam time:", timeStr);
        
        // Handle different time formats
        let hours = 0, minutes = 0;
        
        if (timeStr.includes('AM') || timeStr.includes('PM')) {
          // 12-hour format: "10:30 AM"
          const [time, period] = timeStr.split(' ');
          const [h, m] = time.split(':');
          hours = parseInt(h);
          minutes = parseInt(m) || 0;
          
          if (period === 'PM' && hours !== 12) {
            hours += 12;
          } else if (period === 'AM' && hours === 12) {
            hours = 0;
          }
        } else {
          // 24-hour format: "10:30" or "10:30:00"
          const timeParts = timeStr.split(':');
          hours = parseInt(timeParts[0]) || 0;
          minutes = parseInt(timeParts[1]) || 0;
        }
        
        startTime.setHours(hours, minutes, 0, 0);
        console.log("Parsed start time:", startTime);
      }

      // Get exam duration from various possible fields
      let durationMinutes = 90; // default
      
      if (examData.duration) {
        if (typeof examData.duration === 'number') {
          durationMinutes = examData.duration;
        } else if (typeof examData.duration === 'string') {
          // Parse duration string like "90 Mins." or "1.5 hours" or "90"
          const durationStr = examData.duration.toLowerCase();
          const numMatch = durationStr.match(/[\d.]+/);
          if (numMatch) {
            const num = parseFloat(numMatch[0]);
            if (durationStr.includes('hour')) {
              durationMinutes = num * 60;
            } else {
              durationMinutes = num;
            }
          }
        }
      } else if (examData.exam_duration) {
        durationMinutes = parseInt(examData.exam_duration) || 90;
      } else if (examData.time_duration) {
        durationMinutes = parseInt(examData.time_duration) || 90;
      }

      console.log("Calculated duration in minutes:", durationMinutes);

      // Calculate end time
      const endTime = new Date(startTime.getTime() + (durationMinutes * 60 * 1000));
      
      console.log("Exam start time:", startTime);
      console.log("Exam end time:", endTime);
      console.log("Current time:", new Date());
      console.log("Time until exam ends (minutes):", (endTime.getTime() - new Date().getTime()) / (1000 * 60));
      
      // Validation: Check if exam has already ended
      const now = new Date();
      if (endTime <= now) {
        console.warn("Calculated exam end time is in the past. Using fallback duration.");
        return new Date(now.getTime() + (durationMinutes * 60 * 1000));
      }
      
      return endTime;
    } catch (error) {
      console.error("Error calculating exam end time:", error);
      // Fallback: 90 minutes from now
      return new Date(Date.now() + (90 * 60 * 1000));
    }
  };

  const formatTime = (timeInSeconds) => {
    if (timeInSeconds <= 0) return "00:00:00";
    
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const startTimer = (endTime) => {
    // Clear existing timer
    cleanupIntervals();
    
    const updateTimer = () => {
      const now = new Date().getTime();
      const endTimeMs = endTime.getTime();
      const remainingMs = endTimeMs - now;
      
      console.log("Timer update - Remaining ms:", remainingMs, "Remaining minutes:", Math.floor(remainingMs / (1000 * 60)));
      
      if (remainingMs <= 0) {
        // Time is up
        setRemainingTime("00:00:00");
        setRemainingSeconds(0);
        cleanupIntervals();
        
        // Auto-submit if not already submitted or auto-submit not triggered
        if (!hasSubmittedRef.current && !autoSubmitTriggeredRef.current) {
          console.log("Time expired - auto submitting exam");
          autoSubmitTriggeredRef.current = true;
          autoSubmitExam();
        }
        return;
      }
      
      // Update remaining time
      const remainingSecondsCalc = Math.floor(remainingMs / 1000);
      setRemainingSeconds(remainingSecondsCalc);
      setRemainingTime(formatTime(remainingSecondsCalc));
    };
    
    // Update immediately
    updateTimer();
    
    // Set interval for updates
    timerIntervalRef.current = setInterval(updateTimer, 1000);
  };

  // Watch for remainingSeconds to trigger auto-submit
  useEffect(() => {
    if (remainingSeconds === 0 && !hasSubmittedRef.current && !autoSubmitTriggeredRef.current && examEndTime) {
      console.log("Remaining seconds reached 0 - triggering auto-submit");
      autoSubmitTriggeredRef.current = true;
      autoSubmitExam();
    }
  }, [remainingSeconds, examEndTime]);

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
      window.onbeforeunload = null;
    };
  }, [id, navigate]);

  // Handle page refresh/beforeunload
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (window.opener) {
        window.opener.location.reload();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Get User Details
  const getUserDetails = async (userId) => {
    try {
      if (!userId || userId === 'undefined' || userId.toString().trim() === '') {
        console.error("Invalid user ID provided:", userId);
        return;
      }

      console.log("Fetching user details for ID:", userId);
      const resp = await apiService.get(`/user/${userId}`);
      if (resp && resp.data) {
        setUserName(resp.data.full_name || resp.data.name || '');
        setUserImage(resp.data.profile_photo || '');
        console.log("User details loaded:", resp.data);
      } else if (resp) {
        setUserName(resp.full_name || resp.name || '');
        setUserImage(resp.profile_photo || '');
        console.log("User details loaded:", resp);
      }
    } catch (err) {
      console.error("Error fetching user details", err);
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
      
      console.log("Complete exam data received:", examData);
      
      setExam(examData);
      setExamName(examData.exam_name || examData.name || '');

      // Set exam details
      setCourseType(examData.course_type || '');
      setCourseName(examData.course_name || '');
      setBatchName(examData.batch_name || '');

      // Parse duration from exam data
      let durationDisplay = "90 Mins.";
      if (examData.duration) {
        if (typeof examData.duration === 'number') {
          durationDisplay = `${examData.duration} Mins.`;
        } else {
          durationDisplay = examData.duration;
        }
      } else if (examData.exam_duration) {
        durationDisplay = `${examData.exam_duration} Mins.`;
      } else if (examData.time_duration) {
        durationDisplay = `${examData.time_duration} Mins.`;
      }
      setDuration(durationDisplay);

      // Calculate and set exam end time
      const endTime = calculateExamEndTime(examData);
      setExamEndTime(endTime);

      // Start the timer
      startTimer(endTime);

      // Get questions after exam data is loaded
      await getQuestions(examData, examId);
      
    } catch (err) {
      console.error("Error fetching exam", err);
      setError("Failed to load exam: " + (err.response?.data?.message || err.message));
    }
  };

  // Get Questions
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
        exam_id: currentExamId.trim()
      });

      console.log("API call with params:", queryParams.toString());

      const resp = await apiService.get(`/question?${queryParams.toString()}`);
      
      if (!resp.data || !resp.data.data) {
        throw new Error("No questions data received from server");
      }

      const questions = resp.data.data.map((q) => ({
        ...q,
        selectedAnswer: q.userAnswer || null,
        seen: q.seen || false,
        status: q.status || "unanswered",
      }));

      if (questions.length === 0) {
        throw new Error("No questions found for this exam");
      }

      setQuestionList(questions);
      setCurrentQuestion(questions[0]);
      setQuestionCount(questions.length);
      
      // Initialize counters
      updateQuestionCounters(questions);
      
      console.log("Questions loaded successfully:", questions.length);

      // Initialize activity logging after all data is loaded
      setTimeout(() => {
        logAnswer();
      }, 1000);

    } catch (err) {
      console.error("Error fetching questions details:", err);
      setError("Failed to load questions: " + (err.response?.data?.message || err.message));
    }
  };

  // Auto Submit when time expires
  const autoSubmitExam = async () => {
    try {
      console.log("Auto-submitting exam due to time expiry");
      hasSubmittedRef.current = true; // Set this immediately
      
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData?.mobile || !getUserId(userData)) {
        console.error("User session invalid during auto-submit");
        alert("Time expired! Session invalid. Please login again.");
        navigate("/studentlogin");
        return;
      }

      const payload = {
        user_id: getUserId(userData),
        mobile: userData.mobile,
        exam_id: id,
      };

      console.log("Auto-submitting payload:", payload);

      const resp = await apiService.post("/exam/finalExamSubmit", payload);

      if (resp.data?.success) {
        setSubmitFinalExam(true);
        setUserSubmit(false);
        alert("Time expired! Your exam has been auto-submitted.");
      } else {
        console.error("Auto-submit failed:", resp.data);
        alert("Time expired! Failed to auto-submit: " + (resp.data?.message || "Unknown error"));
      }
    } catch (err) {
      console.error("Auto-submit failed:", err);
      alert("Time expired! Failed to auto-submit exam: " + (err.response?.data?.message || err.message));
    }
  };

  // Submit Exam function
  const submitExam = async () => {
    try {
      console.log("Submit Exam button clicked");

      // Prevent multiple submissions
      if (hasSubmittedRef.current) {
        console.log("Exam already submitted, ignoring duplicate submission");
        return;
      }

      hasSubmittedRef.current = true;
      cleanupIntervals(); // Stop the timer

      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData?.mobile || !getUserId(userData)) {
        alert("User session invalid. Please login again.");
        navigate("/studentlogin");
        return;
      }

      const payload = {
        user_id: getUserId(userData),
        mobile: userData.mobile,
        exam_id: id,
      };

      console.log("Submitting payload:", payload);

      const resp = await apiService.post("/exam/finalExamSubmit", payload);

      if (resp.data?.success) {
        setSubmitFinalExam(true);
        setUserSubmit(false);
      } else {
        hasSubmittedRef.current = false; // Reset on failure
        alert("Failed: " + (resp.data?.message || "Unknown error"));
      }
    } catch (err) {
      hasSubmittedRef.current = false; // Reset on failure
      console.error("Submit exam failed", err);
      alert("Failed to submit exam: " + (err.response?.data?.message || err.message));
    }
  };

  // ================= QUESTION NAVIGATION =================
  const previousQuestion = () => {
    const currentIndex = questionList.indexOf(currentQuestion);
    const newIndex = currentIndex - 1;
    if (newIndex >= 0) {
      setCurrentQuestion(questionList[newIndex]);
      setGlobalIndex(globalIndex - 1);
    }
  };

  const nextQuestion = () => {
    // Mark current question as seen
    const updatedQuestion = { ...currentQuestion, seen: true };
    const currentIndex = questionList.indexOf(currentQuestion);
    const updatedQuestions = [...questionList];
    updatedQuestions[currentIndex] = updatedQuestion;
    setQuestionList(updatedQuestions);
    
    const newIndex = currentIndex + 1;
    if (newIndex < questionCount) {
      setGlobalIndex(globalIndex + 1);
      setCurrentQuestion(questionList[newIndex]);
      
      // Update counters
      updateQuestionCounters(updatedQuestions);
    }
  };

  const submitAndNext = () => {
    nextQuestion();
  };

  // Set question as seen
  const seenQuestion = () => {
    setCurrentQuestion(prev => ({ ...prev, seen: true }));
    return true;
  };

  // ================= ANSWER HANDLING =================
  const saveAnswer = async (opt) => {
    try {
      let updatedQuestion = { ...currentQuestion };
      let answeredChange = 0;

      console.log("Before saveAnswer - Current Question:", updatedQuestion);
      console.log("Selected option:", opt);

      // Fixed logic based on Angular implementation
      if (!updatedQuestion.status || updatedQuestion.status === "unanswered") {
        // Selecting an answer for the first time
        updatedQuestion.selectedAnswer = opt;
        updatedQuestion.seen = true;
        updatedQuestion.status = "answered";
        answeredChange = 1;
        console.log("First time answering - set to answered");
      } else if (updatedQuestion.status === "answered") {
        if (updatedQuestion.selectedAnswer === opt) {
          // Deselecting the currently selected answer
          updatedQuestion.selectedAnswer = null;
          updatedQuestion.status = "unanswered";
          updatedQuestion.seen = true;
          answeredChange = -1;
          console.log("Deselecting answer - set to unanswered");
        } else {
          // Changing to a different answer
          updatedQuestion.selectedAnswer = opt;
          updatedQuestion.seen = true;
          // Status remains "answered", no change in count
          console.log("Changing answer - remains answered");
        }
      }

      console.log("After saveAnswer - Updated Question:", updatedQuestion);

      // Update answered count
      setAnswered(prev => {
        const newCount = prev + answeredChange;
        console.log("Answered count changed from", prev, "to", newCount);
        return newCount;
      });

      // Update question list
      const currentIndex = questionList.indexOf(currentQuestion);
      const updatedQuestions = [...questionList];
      updatedQuestions[currentIndex] = updatedQuestion;
      setQuestionList(updatedQuestions);
      setCurrentQuestion(updatedQuestion);

      // Update counters
      updateQuestionCounters(updatedQuestions);
      
      // Log activity and sync answer with updated question
      await logAnswerWithQuestion(updatedQuestion);
      await syncAnswerWithQuestion(updatedQuestion);

    } catch (err) {
      console.error("Error saving answer", err);
      alert("Failed to save answer: " + (err.response?.data?.message || err.message));
    }
  };

  // Log Answer Activity - Fixed
  const logAnswer = async () => {
    if (currentQuestion) {
      await logAnswerWithQuestion(currentQuestion);
    }
  };

  const logAnswerWithQuestion = async (question) => {
    try {
      if (!question || !user || !examId) {
        console.log("Missing data for logging:", { question: !!question, user: !!user, examId });
        return;
      }

      const userId = getUserId(user);
      if (!userId || userId === 'undefined') {
        console.error("Invalid user ID for logging:", user);
        return;
      }

      const data = {
        user_id: userId.toString(),
        user_name: user.full_name || user.name || '',
        exam_id: examId,
        exam_name: exam?.exam_name,
        question_id: question._id,
        status: question.status || "unanswered", // Ensure we have a status
        answered: (question.status === "answered"), // Boolean value based on status
        answer: question.selectedAnswer, // This should be the selected option (1, 2, 3, 4)
      };

      console.log("Logging activity with data:", data);
      await apiService.post("activityLog", data);
      console.log("Activity logged successfully");
    } catch (err) {
      console.error("Error logging answer activity", err);
    }
  };

  // Sync Answer to Backend - Fixed
  const syncAnswer = async () => {
    if (currentQuestion) {
      await syncAnswerWithQuestion(currentQuestion);
    }
  };

  const syncAnswerWithQuestion = async (question) => {
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
        userAnswer: question.selectedAnswer, // This should be the selected option
        status: question.status || "unanswered", // Ensure we have a status
      };

      console.log("Syncing answer data:", data);
      await apiService.post("answerSheet", data);
      console.log("Answer synced successfully");
    } catch (err) {
      console.error("Error syncing answer", err);
    }
  };

  // Update question counters - Fixed
  const updateQuestionCounters = (questions) => {
    const notViewedCount = questions.filter(q => !q.seen && (!q.status || q.status === "unanswered")).length;
    const viewedCount = questions.filter(q => q.seen && (!q.status || q.status === "unanswered")).length;
    const answeredCount = questions.filter(q => q.status === "answered").length;
    
    console.log("Updating counters:", { notViewedCount, viewedCount, answeredCount });
    
    setNotViewed(notViewedCount);
    setViewed(viewedCount);
    setAnswered(answeredCount);
  };

  // ================= SUBMIT HANDLING =================
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
    let currentIndex = -1;
    for (let i = 0; i < questionList?.length; i++) {
      if (questionList[i]._id === currentQuestion._id) {
        currentIndex = i;
        break;
      }
    }
    return currentIndex + 1;
  };

  const getAttemptedQuestionCount = () => {
    return questionList?.filter((question) => question.status === "answered").length || 0;
  };

  const getNotVisitedQuestionCount = () => {
    const count = questionList?.filter(
      (question) => !question.seen && (!question.status || question.status === "unanswered")
    ).length || 0;
    return count;
  };

  const getViewedQuestionCount = () => {
    return questionList?.filter(
      (question) => question.seen && (!question.status || question.status === "unanswered")
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

  // Check if all questions are answered for auto-submit option
  const areAllQuestionsAnswered = () => {
    return questionList.every(q => q.status === "answered");
  };

  // Format exam date and time for display
  const formatExamDateTime = () => {
    if (!exam?.exam_date) return "";
    
    const examDate = new Date(exam.exam_date);
    const dateStr = examDate.toLocaleDateString();
    
    if (exam.exam_time) {
      return `${dateStr} at ${exam.exam_time}`;
    }
    return dateStr;
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
                  {exam?.exam_name || exam?.name}
                </h1>
                <p className="text-blue-100 mt-1">
                  {exam?.exam_code && `Exam Code: ${exam.exam_code} | `}
                  {formatExamDateTime()} | 
                  Duration: {duration}
                </p>
                {exam?.course_name && (
                  <p className="text-blue-200 text-sm">
                    Course: {exam.course_name} {exam.batch_name && `| Batch: ${exam.batch_name}`}
                  </p>
                )}
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
                <p className={`font-bold text-lg ${
                  remainingTime === "00:00:00" ? "text-red-400 animate-pulse" : 
                  remainingTime.startsWith("00:") && parseInt(remainingTime.split(":")[1]) < 5 ? "text-orange-400" :
                  "text-yellow-300"
                }`}>
                  {remainingTime}
                </p>
              </div>
              <div className="text-center">
                <span className="text-sm text-gray-300">Status</span>
                <p className="font-bold text-green-300">
                  {hasSubmittedRef.current ? "Submitted" : "In Progress"}
                </p>
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
                        onClick={handleSubmit}
                      >
                        SUBMIT
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

                  {/* Optional: Show progress and submit early if all answered */}
                  {areAllQuestionsAnswered() && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center text-green-700">
                        <i className="fas fa-check-circle mr-2"></i>
                        <span className="text-sm">All questions answered!</span>
                      </div>
                      <button 
                        className="mt-2 w-full px-3 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700"
                        onClick={handleSubmit}
                      >
                        Submit Exam Early
                      </button>
                    </div>
                  )}
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
                  <div>
                    <p className="text-blue-700 mb-2">Are you sure you want to submit your exam? This action cannot be undone.</p>
                    <p className="text-blue-600 text-sm">
                      Time remaining: <span className="font-bold">{remainingTime}</span>
                    </p>
                  </div>
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
                  disabled={hasSubmittedRef.current}
                >
                  {hasSubmittedRef.current ? "Submitting..." : "Submit Exam"}
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