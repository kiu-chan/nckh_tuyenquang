// routes/index.jsx
import Home from "../pages/Home/index";
import MapPage from "../pages/Map/index";
import LoginPage from "../pages/admin/account/LoginPage";
import AdminDashboard from "../pages/admin/AdminDashboard/index.jsx";
import DefaultLayout from "../components/Layout/DefaultLayout";
import AdminLayout from "../components/adminLayout/AdminLayout";

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
];

// Routes yêu cầu đăng nhập và quyền admin
const privateRoutes = [
  {
    path: "/admin",
    component: AdminDashboard,
    layout: AdminLayout,
  },
];

export { publicRoutes, privateRoutes };