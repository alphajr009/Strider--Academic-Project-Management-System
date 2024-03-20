import React, { useState } from "react";
import Navbar from "./Navbar";
import Instructors from "../../components/admin/Instructors";
import Projects from "../../components/admin/Projects";
import Profile from "../../components/admin/Profile";
import SignOut from "../../components/admin/SignOut";
import Students from "../../components/admin/Students";
import { useNavigate } from "react-router-dom";
import "../../css/terminal.css";

const isSuperAdmin = () => {
  const admin = JSON.parse(localStorage.getItem("currentUser"));
  return admin.isSuperAdmin;
};

const Terminal = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("current");
  const superAdmin = isSuperAdmin();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="navbar-tutors-container">
      <Navbar setActiveTab={handleTabChange} isSuperAdmin={isSuperAdmin()} />
      <div className="tutors-profile-container">
        {activeTab === "current" && <Projects />}
        {superAdmin && activeTab === "create" && <Instructors />}
        {activeTab === "student" && <Students />}
        {activeTab === "profile" && <Profile />}
        {activeTab === "signout" && <SignOut />}
      </div>
    </div>
  );
};

export default Terminal;
