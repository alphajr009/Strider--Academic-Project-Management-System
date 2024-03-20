import React from "react";
import "./../../css/adminNav.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFolder,
  faPlus,
  faUser,
  faSignOutAlt,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

const Navbar = ({ setActiveTab, isSuperAdmin }) => {
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const handleSignOut = () => {
    localStorage.removeItem("currentUser");
    window.location.href = "/admin-login";
  };

  return (
    <div className="navbar-container">
      <a href="/admin-terminal">
        <img
          src={require("../../assets/strider_logo.png")}
          alt="Small Image"
          className="small-image"
        />
      </a>

      <div className="nav-items">
        <div className="nav-item" onClick={() => handleTabClick("current")}>
          <FontAwesomeIcon icon={faFolder} className="nav-icon" />
          <p>Projects</p>
        </div>
        {isSuperAdmin && (
          <div className="nav-item" onClick={() => handleTabClick("create")}>
            <FontAwesomeIcon icon={faPlus} className="nav-icon" />
            <p>Instructors</p>
          </div>
        )}
        <div className="nav-item" onClick={() => handleTabClick("student")}>
          <FontAwesomeIcon icon={faUsers} className="nav-icon" />
          <p>Students</p>
        </div>
        <div className="nav-item" onClick={() => handleTabClick("profile")}>
          <FontAwesomeIcon icon={faUser} className="nav-icon" />
          <p>Profile</p>
        </div>
        <div className="nav-item" onClick={handleSignOut}>
          <FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
          <p>Sign Out</p>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
