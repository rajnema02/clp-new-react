import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";


// import Calendar from "./pages/Calendar"; 
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import BatchData from "./pages/Batch/BatchData";
import Message from "./pages/message/MessageList";
import Modules from "./pages/course/ModulesList";
import CourseLists from "./pages/course/CourseLists";
import ModulesList from "./pages/course/ModulesList";
import MessageList from "./pages/message/MessageList";
import ScheduleExamsList from "./pages/Exam/ScheduleExamsList";
import BulkUploadsList from "./pages/Exam/BulkUploadsList";
import QuestionBanksList from "./pages/Exam/QuestionBanksList";
import ExamsList from "./pages/Exam/ExamsList";
import UsersManagementList from "./pages/userManagement/UsersManagementList";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
         
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />
            <Route index path="/batch-details-list" element={<BatchData/>} />
            <Route index path="/message-list" element={<MessageList/>} />



            <Route path="/course-list" element={<CourseLists />} />
            <Route path="/module-list" element={<ModulesList />} />


            <Route path="/study-material-list" element={<ModulesList />} />

            <Route path="/user-management" element={<UsersManagementList />} />


            <Route path="/exam-list" element={<ExamsList />} />
            <Route path="/question-bank-list" element={<QuestionBanksList />} />
            <Route path="/bulk-upload-list" element={<BulkUploadsList />} />
            <Route path="/schedule-exam-list" element={<ScheduleExamsList />} />
            

            

           
            <Route path="/profile" element={<UserProfiles />} />
           
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

          
           

            {/* Charts */}
            {/* <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} /> */}
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />


          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
