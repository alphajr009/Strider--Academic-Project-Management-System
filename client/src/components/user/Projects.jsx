import React, { useState, useEffect, useRef } from "react";
import "../../css/projects.css";
import {
  Card,
  Button,
  Pagination,
  Modal,
  Input,
  Form,
  Row,
  Col,
  Select,
} from "antd";
import axios from "axios";
import {
  GithubOutlined,
  FileTextOutlined,
  ReloadOutlined,
  EditOutlined,
} from "@ant-design/icons";
import Chart from "chart.js/auto";

function Projects() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible1, setIsModalVisible1] = useState(false);
  const [githubLink, setGithubLink] = useState("");
  const [documentLink, setDocumentLink] = useState("");
  const [currentProjects, setCurrentProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(6);
  const [projectId, setProjectId] = useState("");
  const [projectDetails, setProjectDetails] = useState(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [chartInstance1, setChartInstance1] = useState(null);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const [editGithubLink, setEditGithubLink] = useState("");
  const [editDocumentLink, setEditDocumentLink] = useState("");

  const chartRef = useRef(null);
  const chartRef1 = useRef(null);

  useEffect(() => {
    fetchCurrentProjects();
  }, []);

  useEffect(() => {
    if (isModalVisible1 && projectDetails) {
      drawChart(projectDetails.commitHistory);
      drawChart1(projectDetails.wordCount);
    }
  }, [isModalVisible1, projectDetails]);

  const fetchCurrentProjects = async () => {
    try {
      const userEmail = JSON.parse(localStorage.getItem("currentUser")).email;
      const response = await axios.get(
        `/api/projects/getcurrentprojectsbyid?userEmail=${userEmail}`
      );
      setCurrentProjects(response.data.currentProjects);
    } catch (error) {
      console.error("Error fetching current projects:", error);
    }
  };

  const fetchProjectDetails = async (projectId) => {
    try {
      const response = await axios.get(
        `/api/projects/getprojectdetails/${projectId}`
      );
      const projectDetails = response.data.projectDetails;
      setProjectDetails(projectDetails);
    } catch (error) {
      console.error("Error fetching project details:", error);
    }
  };

  const drawChart = (commitHistory) => {
    const sortedCommitHistory = commitHistory.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    const labels = sortedCommitHistory.map((commit) => commit.date);
    const data = sortedCommitHistory.map((commit) => commit.commitCount);

    if (chartInstance) {
      chartInstance.destroy();
    }

    const ctx = chartRef.current.getContext("2d");
    const newChartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Closed Issues",
            data: data,
            backgroundColor: [
              "rgba(75, 192, 192, 0.5)",
              "rgba(255, 99, 132, 0.5)",
            ],
            borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: "Date",
            },
          },
          y: {
            title: {
              display: true,
              text: "Issue Count",
            },
            beginAtZero: true,
          },
        },
      },
    });

    setChartInstance(newChartInstance);
  };

  const drawChart1 = (wordCount) => {
    const sortedWordCount = wordCount.sort(
      (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
    );
    const labels = sortedWordCount.map((word) => word.dateTime);
    const data = sortedWordCount.map((word) => word.wordCount);

    if (chartInstance1) {
      chartInstance1.destroy();
    }

    const ctx1 = chartRef1.current.getContext("2d");
    const newChartInstance1 = new Chart(ctx1, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Word Count History",
            data: data,
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: "Date",
            },
          },
          y: {
            title: {
              display: true,
              text: "Word Count",
            },
            beginAtZero: true,
          },
        },
      },
    });

    setChartInstance1(newChartInstance1);
  };

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjectsPage = currentProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const showModal = (projectId) => {
    setProjectId(projectId);
    setIsModalVisible(true);
  };

  const showModal2 = () => {
    setEditGithubLink(projectDetails.github);
    setEditDocumentLink(projectDetails.document);
    setIsModalVisible2(true);
  };

  const handleCancel2 = () => {
    setIsModalVisible2(false);
  };
  const handleSave = () => {
    const updatedData = {
      projectId: projectId,
      github: editGithubLink,
      document: editDocumentLink,
    };

    axios
      .post("/api/projects/updateprojectdetails", updatedData)
      .then((response) => {
        console.log(response.data);
        setIsModalVisible2(false);
        fetchProjectDetails(projectId);
      })
      .catch((error) => {
        console.error("Error updating project details:", error);
      });
  };

  const showModal1 = async (projectId) => {
    setProjectId(projectId);
    await fetchProjectDetails(projectId);
    setIsModalVisible1(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleCancel1 = () => {
    setIsModalVisible1(false);
    if (chartInstance) {
      chartInstance.destroy();
      setChartInstance(null);
    }
    if (chartInstance1) {
      chartInstance1.destroy();
      setChartInstance1(null);
    }
  };

  const handleOk = () => {
    axios
      .post("/api/projects/setupproject", {
        projectId,
        github: githubLink,
        document: documentLink,
      })
      .then((response) => {
        console.log(response.data);
        setIsModalVisible(false);
        fetchCurrentProjects();
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error setting up project:", error);
      });
  };

  const handleRefresh = () => {
    if (projectDetails) {
      axios
        .post(`/api/projects/updateissuehistory/${projectDetails._id}`, {
          projectId: projectDetails._id,
          repoLink: projectDetails.github,
        })
        .then((response) => {
          console.log(response.data);
          fetchProjectDetails(projectDetails._id);
        })
        .catch((error) => {
          console.error("Error refreshing commit history:", error);
        });
    }
  };

  const handleRefresh1 = () => {
    if (projectDetails) {
      axios
        .post(`/api/projects/docinfo/${projectDetails._id}`, {
          projectId: projectDetails._id,
          docId: projectDetails.document,
        })
        .then((response) => {
          console.log(response.data);
          fetchProjectDetails(projectDetails._id);
        })
        .catch((error) => {
          console.error("Error refreshing wordcount history:", error);
        });
    }
  };

  return (
    <div className="project-layout">
      <div className="pl-main">
        <div className="pl-header">
          <div className="pl-header-txt">
            <h3>Projects</h3>
          </div>
        </div>

        <div className="pl-body">
          <Row gutter={[16, 16]}>
            {currentProjectsPage.map((project, index) => (
              <Col key={index} span={8}>
                <Card
                  style={{
                    width: 300,
                    padding: "5px 10px 15px 10px",
                    marginBottom: 20,
                  }}
                  title={<h4>{project.name}</h4>}
                >
                  <p>Subject: {project.subject}</p>
                  <p>Due Date: {project.due_date}</p>
                  <p>Hours: {project.hours}</p>
                  {project.isSetup ? (
                    <Button onClick={() => showModal1(project._id)}>
                      View
                    </Button>
                  ) : (
                    <Button onClick={() => showModal(project._id)}>
                      Setup
                    </Button>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
          <div className="pl-pagination">
            <Pagination
              style={{ marginTop: 20, textAlign: "center" }}
              current={currentPage}
              pageSize={projectsPerPage}
              total={currentProjects.length}
              onChange={paginate}
            />
          </div>
        </div>
      </div>
      <Modal
        title="Project Setup"
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleOk}
      >
        <Form layout="vertical">
          <Form.Item label="GitHub Link">
            <Input
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Document Link">
            <Input
              value={documentLink}
              onChange={(e) => setDocumentLink(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Edit Project Links"
        visible={isModalVisible2}
        onCancel={handleCancel2}
        onOk={handleSave}
      >
        <Form layout="vertical">
          <Form.Item label="GitHub Link">
            <Input
              value={editGithubLink}
              onChange={(e) => setEditGithubLink(e.target.value)}
            />
          </Form.Item>
          <Form.Item label="Document Link">
            <Input
              value={editDocumentLink}
              onChange={(e) => setEditDocumentLink(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Project Details"
        visible={isModalVisible1}
        onCancel={handleCancel1}
        footer={null}
        width={1300}
      >
        {projectDetails && (
          <div className="project-details">
            <p>Name: {projectDetails.name}</p>
            <p>Subject: {projectDetails.subject}</p>
            <p>Instructor Name: {projectDetails.instructor_name}</p>
            <p>Instructor Email: {projectDetails.instructor_email}</p>
            <p>Due Date: {projectDetails.due_date}</p>
            <br />
            <div>
              <Button
                type="link"
                icon={<GithubOutlined />}
                onClick={() => window.open(projectDetails.github, "_blank")}
              >
                Github
              </Button>
              <Button
                type="link"
                icon={<FileTextOutlined />}
                onClick={() => window.open(projectDetails.document, "_blank")}
              >
                Document
              </Button>

              <Button type="link" icon={<EditOutlined />} onClick={showModal2}>
                Edit
              </Button>
            </div>
            <br />
            <h4>Github Issue History</h4>
            <Button
              type="link"
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <div className="chart">
              <canvas id="commitChart" ref={chartRef}></canvas>
            </div>
            <br />
            <h4>Word Count History </h4>
            <Button
              type="link"
              icon={<ReloadOutlined />}
              onClick={handleRefresh1}
            >
              Refresh
            </Button>
            <div className="chart">
              <canvas id="wordCountChart" ref={chartRef1}></canvas>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Projects;
