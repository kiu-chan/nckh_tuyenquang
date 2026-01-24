import Home from "../pages/Home/index";
import MapPage from "../pages/Map/index";
import LoginPage from "../pages/admin/account/LoginPage";
import RegisterPage from "../pages/admin/account/RegisterPage";
import AdminDashboard from "../pages/admin/AdminDashboard/index.jsx";
import TeacherDashboard from "../pages/teacher/Dashboard/index.jsx";
import DefaultLayout from "../components/Layout/DefaultLayout";
import AdminLayout from "../components/adminLayout/AdminLayout";
import TeacherLayout from "../components/teacherLayout/TeacherLayout";

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

// Routes cho Admin
const privateRoutes = [
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
];

export { publicRoutes, privateRoutes };