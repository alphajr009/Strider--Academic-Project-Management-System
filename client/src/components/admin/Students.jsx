import React, { useState, useEffect } from "react";
import { Table, Button, Modal } from "antd";
import Axios from "axios";
import "../../css/AdminInstuctor.css";

function Students() {
  const [viewProjectModalVisible, setViewProjectModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await Axios.get("/api/users/getStudents");
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching Students:", error);
    }
  };

  const handleViewProjects = async (studentEmail) => {
    try {
      const response = await Axios.post("/api/users/getCurrentProjectByEmail", {
        studentEmail: studentEmail,
      });
      const projectsData = response.data;
      if (projectsData && projectsData.length > 0) {
        setProjects(projectsData);
        setViewProjectModalVisible(true);
      } else {
        setProjects([]);
        setViewProjectModalVisible(true);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setViewProjectModalVisible(true);
    }
  };

  const closeModal = () => {
    setViewProjectModalVisible(false);
    setProjects([]);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Birthday",
      dataIndex: "birthday",
      key: "birthday",
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Projects",
      key: "projects",
      render: (text, record) => (
        <Button onClick={() => handleViewProjects(record.email)}>View</Button>
      ),
    },
  ];

  return (
    <div className="Ins-page">
      <div className="ins-header">
        <div className="ins-header-text">
          <h1>Students</h1>
        </div>
      </div>
      <div className="ins-table">
        <Table dataSource={students} columns={columns} />
      </div>

      <Modal
        title="Projects Assigned to Student"
        visible={viewProjectModalVisible}
        onCancel={closeModal}
        footer={null}
      >
        {projects.length > 0 ? (
          <ul>
            {projects.map((project, index) => (
              <li key={index}>{project}</li>
            ))}
          </ul>
        ) : (
          <p>No projects assigned to this student.</p>
        )}
      </Modal>
    </div>
  );
}

export default Students;
