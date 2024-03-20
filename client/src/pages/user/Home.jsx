import React, { useState } from "react";
import Navbar from "../user/Navbar";
import Projects from "../../components/user/Projects";
import Profile from "../../components/user/Profile";
import SignOut from "../../components/admin/SignOut";
import { useNavigate } from "react-router-dom";
import "../../css/terminal.css";

function home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("current");

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="navbar-tutors-container">
      <Navbar setActiveTab={handleTabChange} />
      <div className="tutors-profile-container">
        {activeTab === "current" && <Projects />}
        {activeTab === "profile" && <Profile />}
        {activeTab === "signout" && <SignOut />}
      </div>
    </div>
  );
}

export default home;
