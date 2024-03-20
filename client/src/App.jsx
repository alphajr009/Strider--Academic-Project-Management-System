import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Loading from "./components/loading";
import SignUp from "./pages/user/Signup";
import Login from "./pages/user/Login";
import AdminLogin from "./pages/admin/Login";
import AdminTerminal from "./pages/admin/Terminal";
import Home from "./pages/user/Home";
import ForgetPassword from "./pages/user/ForgetPassword";

const AdminRouteGuard = ({ children }) => {
  const admin = JSON.parse(localStorage.getItem("currentUser"));

  if (admin && admin.isInstructor) {
    return children;
  } else {
    return <Navigate to="/admin-login" />;
  }
};

const UserRouteGuard = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (user) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Loading />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forget-password" element={<ForgetPassword />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/admin-terminal"
            element={
              <AdminRouteGuard>
                <AdminTerminal />
              </AdminRouteGuard>
            }
          />
          <Route
            path="/home"
            element={
              <UserRouteGuard>
                <Home />
              </UserRouteGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
