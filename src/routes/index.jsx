import Home from "../pages/Home/index";
import MapPage from "../pages/Map/index";
import LoginPage from "../pages/admin/account/LoginPage";
import RegisterPage from "../pages/admin/account/RegisterPage";
import AdminDashboard from "../pages/admin/AdminDashboard/index.jsx";
import TeacherDashboard from "../pages/teacher/Dashboard/index.jsx";
import StudentDashboard from "../pages/student/Dashboard/index.jsx";
import DefaultLayout from "../components/Layout/DefaultLayout";
import AdminLayout from "../components/adminLayout/AdminLayout";
import TeacherLayout from "../components/teacherLayout/TeacherLayout";
import TeacherNotebook from "../pages/teacher/Notebook/index.jsx";
import TeacherDocuments from "../pages/teacher/Documents/index.jsx";
import TeacherExams from "../pages/teacher/Exams/index.jsx";
import TeacherGames from "../pages/teacher/Games/index.jsx";
import TeacherStudents from "../pages/teacher/Students/index.jsx";
import TeacherStatistics from "../pages/teacher/Statistics/index.jsx";
import StudentLayout from "../components/studentLayout/StudentLayout";

// Routes công khai
const publicRoutes = [
  {
    path: "/",
    component: Home,
    layout: DefaultLayout,
  },
  {
    path: "/map",
    component: MapPage,
    layout: DefaultLayout,
  },
  {
    path: "/login",
    component: LoginPage,
    layout: DefaultLayout,
  },
  {
    path: "/register",
    component: RegisterPage,
    layout: DefaultLayout,
  },
];

// Routes cho các roles
const privateRoutes = [
  // Admin routes
  {
    path: "/admin",
    component: AdminDashboard,
    layout: AdminLayout,
    allowedRoles: ['admin']
  },
  // Teacher routes
  {
    path: "/teacher/dashboard",
    component: TeacherDashboard,
    layout: TeacherLayout,
    allowedRoles: ['teacher']
  },
  {
    path: "/teacher/notebook",
    component: TeacherNotebook,
    layout: TeacherLayout,
    allowedRoles: ['teacher']
  },
  {
    path: "/teacher/documents",
    component: TeacherDocuments,
    layout: TeacherLayout,
    allowedRoles: ['teacher']
  },
  {
    path: "/teacher/exams",
    component: TeacherExams,
    layout: TeacherLayout,
    allowedRoles: ['teacher']
  },
  {
    path: "/teacher/games",
    component: TeacherGames,
    layout: TeacherLayout,
    allowedRoles: ['teacher']
  },
  {
    path: "/teacher/students",
    component: TeacherStudents,
    layout: TeacherLayout,
    allowedRoles: ['teacher']
  },
  {
    path: "/teacher/statistics",
    component: TeacherStatistics,
    layout: TeacherLayout,
    allowedRoles: ['teacher']
  },
  // Student routes
  {
    path: "/student/dashboard",
    component: StudentDashboard,
    layout: StudentLayout,
    allowedRoles: ['student']
  },
];

export { publicRoutes, privateRoutes };