import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";

import CourseLists from "./pages/course/CourseLists";
import ModulesList from "./pages/course/ModulesList";

import ScheduleExamsList from "./pages/Exam/ScheduleExamsList";

import QuestionBanksList from "./pages/Exam/QuestionBanksList";
import ExamsList from "./pages/Exam/ExamsList";
import UsersManagementList from "./pages/userManagement/UsersManagementList";
import StudentsProfileForm from "./student-pages/studentsProfile/studentsProfileForm";
import StudentsCertificate from "./student-pages/studentsProfile/StudentsCertificate";
import StudentsAboutProgram from "./student-pages/studentAboutProgram/StudentsAboutProgram";
import StudentsDemoExam from "./student-pages/studentExam/StudentsDemoExam";
import StudentsExamList from "./student-pages/studentExam/StudentsExamList";
import StudentsRegistrationList from "./student-pages/studentRegistration/StudentsRegistrationsList";
import StudentsMessages from "./student-pages/studentMessages/StudentsMessages";
import StudentsVideoLibrary from "./student-pages/studentsVideoLibrary/StudentsVideoLibrary";
import LogIn from "./pages/AuthPages/LogIn";
import AdminLogin from "./pages/AuthPages/AdminLogin";
import Signup from "./pages/AuthPages/Signup";
import AdminSignup from "./pages/AuthPages/AdminSignup";
import StudentsDashboard from "./student-pages/studentDashboard/StudentsDashboard";
import CoursesEdit from "./pages/course/CoursesEdit";
import CoursesCreate from "./pages/course/CoursesCreate";
import BatchsList from "./pages/Batch/BatchsList";
import BatchsEdit from "./pages/Batch/BatchsEdit";
import BatchsCreate from "./pages/Batch/BatchsCreate";
import BatchAllotedStudents from "./pages/Batch/BatchAllotedStudents";
import BatchAllotmentSections from "./pages/Batch/BatchAllotmentSections";
import MessagesList from "./pages/message/MessagesList";
import MessagesCreate from "./pages/message/MessagesCreate";
import QuestionBanksCreate from "./pages/Exam/QuestionBanksCreate";
import BulkUploads from "./pages/Exam/BulkUploads";
import QuestionBanksEdit from "./pages/Exam/QuestionBanksEdit";
import StudentRegistrationsForm from "./student-pages/studentRegistration/StudentRegistrationsForm";
import StudentsRegistrationsList from "./student-pages/studentRegistration/StudentsRegistrationsList";
import AboutProgramsList from "./pages/AboutProgram/AboutProgramsList";
import AboutProgramsCreate from "./pages/AboutProgram/AboutProgramsCreate";
import DepartmentsList from "./pages/department/DepartmentsList";
import DepartmentsCreate from "./pages/department/DepartmentsCreate";
import InstructionsPage from "./student-pages/studentExam/InstructionsPage";
import QuestionsPaper from "./student-pages/studentExam/QuestionsPaper";
import StudentExamsSubmit from "./student-pages/studentExam/StudentExamsSubmit";
import StudentResultsList from "./pages/Exam/ResultsList";
import ResultsList from "./pages/Exam/ResultsList";

const ProtectedRoute = ({ children, adminOnly = false, userOnly = false }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to={adminOnly ? "/admin-login" : "/login"} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/student-dashboard" replace />;
  }

  if (userOnly && isAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
};

const AuthRedirect = ({ admin = false }) => {
  const { user, isAdmin } = useAuth();
  
  if (user) {
    return <Navigate to={isAdmin ? "/admin-dashboard" : "/student-dashboard"} replace />;
  }
  
  return admin ? <AdminLogin /> : <LogIn />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<AuthRedirect />} />
          <Route path="/admin" element={<AuthRedirect admin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-signup" element={<AdminSignup />} />

          {/* Protected Admin Routes */}
          <Route element={
            <ProtectedRoute adminOnly>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index path="/admin-dashboard" element={<Home />} />
            <Route path="/batch-list" element={<BatchsList />} />
            <Route path="/batch-create" element={<BatchsCreate/>} />
            <Route path="/batch-edit/:id" element={<BatchsEdit />} />
            <Route path="/batch-allotment/:id" element={<BatchAllotmentSections/>} />
            <Route path="/batch-alloted-student/:id" element={<BatchAllotedStudents />} />
            <Route path="/message-list" element={<MessagesList />} />
            <Route path="/message-create" element={<MessagesCreate />} />
            <Route path="/course-list" element={<CourseLists />} />
            <Route path="/course-create" element={<CoursesCreate />} />
            <Route path="/course-edit/:id" element={<CoursesEdit />} />
            <Route path="/module-list" element={<ModulesList />} />
            <Route path="/study-material-list" element={<ModulesList />} />
            <Route path="/user-management" element={<UsersManagementList />} />
            <Route path="/exam-list" element={<ExamsList />} />
            <Route path="/question-bank-list" element={<QuestionBanksList />} />
            <Route path="/question-bank-create" element={<QuestionBanksCreate />} />
            <Route path="/question-bank-edit/:id" element={<QuestionBanksEdit />} />
            <Route path="/bulk-upload-list" element={<BulkUploads/>} />
            <Route path="/schedule-exam-list" element={<ScheduleExamsList />} />
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/blank" element={<Blank />} />
            <Route path="/form-elements" element={<FormElements />} />
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route path="/about-program-create" element={<AboutProgramsCreate/>} />
            <Route path="/about-program-list" element={<AboutProgramsList />} />
            <Route path="/department-list" element={<DepartmentsList/>} />
            <Route path="/department-create" element={<DepartmentsCreate />} />
            <Route path="/result-list/:id" element={<ResultsList/>} />
            {/* <Route path="/student-profile-form" element={<StudentsProfileForm />} /> */}
          </Route>

          {/* Protected Student Routes */}
          <Route element={
            <ProtectedRoute userOnly>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route path="/student-dashboard" element={<StudentsDashboard />} />
            <Route path="/student-profile-form" element={<StudentsProfileForm />} />
            <Route path="/student-certificate" element={<StudentsCertificate />} />
            <Route path="/student-about-program" element={<StudentsAboutProgram />} />
            <Route path="/student-demo-exam" element={<StudentsDemoExam />} />
            <Route path="/student-exam-list" element={<StudentsExamList />} />
            <Route path="/student-registration-list" element={<StudentsRegistrationsList/>} />
            <Route path="/student-registration-form" element={<StudentRegistrationsForm />} />
            <Route path="/student-message" element={<StudentsMessages />} />
            <Route path="/student-video-library" element={<StudentsVideoLibrary />} />
            <Route path="/student-instructions/:id?" element={<InstructionsPage />} />
            <Route path="/student-exam-submit" element={<StudentExamsSubmit />} />

          </Route>
            <Route path="/student-question-paper/:id" element={<QuestionsPaper/>} />

          {/* Fallback Route */}
          <Route path="*" element={<LogIn />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}