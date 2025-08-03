export const SuperAdminMenu = [
  { name: "Dashboard", path: "/admin-dashboard", icon: "dashboard" },
  { name: "Batch Details", path: "/batch-details-list", icon: "batch" },
  { name: "Messages", path: "/message-list", icon: "message" },
  { name: "User Management", path: "/user-management", icon: "user" },
  { name: "Course Management", path: "/course-list", icon: "course" },
  { name: "Study Material", path: "/study-material-list", icon: "study" },
  {
    name: "Exam",
    icon: "exam",
    subItems: [
      { name: "Exam List", path: "/exam-list" },
      { name: "Schedule Exam", path: "/schedule-exam-list" },
      { name: "Question Bank", path: "/question-bank-list" },
      { name: "Bulk Upload", path: "/bulk-upload-list" },
    ],
  },
  { name: "View Payment", path: "/viewpayment", icon: "payment" },
];

export const AdminMenu = [
  { name: "Dashboard", path: "/admin-dashboard", icon: "dashboard" },
  { name: "Batch Details", path: "/batch-details-list", icon: "batch" },
  { name: "Messages", path: "/message-list", icon: "message" },
  {
    name: "Course",
    icon: "course",
    subItems: [
      { name: "Course List", path: "/course-list" },
      { name: "Module", path: "/module-list" },
    ],
  },
  { name: "Study Material", path: "/study-material-list", icon: "study" },
  { name: "User Management", path: "/user-management", icon: "user" },
  {
    name: "Exam",
    icon: "exam",
    subItems: [
      { name: "Exam List", path: "/exam-list" },
      { name: "Schedule Exam", path: "/schedule-exam-list" },
      { name: "Question Bank", path: "/question-bank-list" },
      { name: "Bulk Upload", path: "/bulk-upload-list" },
    ],
  },
];

export const UserMenu = [
  { name: "Dashboard", path: "/admin-dashboard", icon: "dashboard" },
  { name: "Registration", path: "/student-registration", icon: "form" },
  { name: "About Program", path: "/student-about-program", icon: "book" },
  { name: "Messages", path: "/student-message", icon: "message" },
  { name: "Video Library", path: "/student-video-library", icon: "video" },
  {
    name: "Student Exam",
    icon: "exam",
    subItems: [
      { name: "Student Exam List", path: "/student-exam-list" },
      { name: "Student Demo Exam", path: "/student-demo-exam" },
    ],
  },
  {
    name: "Student Profile",
    icon: "user",
    subItems: [
      { name: "Form", path: "/student-profile-form" },
      { name: "Certificate", path: "/student-certificate" },
    ],
  },
];
