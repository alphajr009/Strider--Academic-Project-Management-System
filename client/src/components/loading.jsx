import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import welcomeVideo from "../assets/welcome.mp4";

function Loading() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/signup");
    }, 2450);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <video
        autoPlay
        muted
        loop
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      >
        <source src={welcomeVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default Loading;
