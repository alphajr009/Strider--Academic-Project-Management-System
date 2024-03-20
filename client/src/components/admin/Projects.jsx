import React, { useState, useEffect } from "react";
import "../../css/projects.css";
import {
  GithubOutlined,
  FileTextOutlined,
  ReloadOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
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
  Popconfirm,
} from "antd";
import axios from "axios";
import Chart from "chart.js/auto";

const { Option } = Select;

function Projects() {
  const [projects, setProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [projectsPerPage] = useState(6);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible1, setIsModalVisible1] = useState(false);
  const [currentProjectDetails, setCurrentProjectDetails] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [form] = Form.useForm();

  const [chartInstance, setChartInstance] = useState(null);
  const [chartInstance1, setChartInstance1] = useState(null);

  const [projectIdToDelete, setProjectIdToDelete] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/api/projects/getallprojects");
      setProjects(response.data.projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = projects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  useEffect(() => {
    if (selectedEmail && currentProjectDetails) {
      const selectedProject = currentProjectDetails.find(
        (project) => project.studentemail === selectedEmail
      );

      if (selectedProject) {
        generateChart(selectedProject.commitHistory);
      }
    }
  }, [selectedEmail, currentProjectDetails, projects]);

  useEffect(() => {
    if (selectedEmail && currentProjectDetails) {
      const selectedProject = currentProjectDetails.find(
        (project) => project.studentemail === selectedEmail
      );

      if (selectedProject) {
        generateChart1(selectedProject.wordCount);
      }
    }
  }, [selectedEmail, currentProjectDetails, projects]);

  const generateChart1 = (wordCount) => {
    const chartData = {
      labels: wordCount.map((word) => word.dateTime),
      datasets: [
        {
          label: "Commit Count",
          data: wordCount.map((word) => word.wordCount),
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };

    const ctx = document.getElementById("wordChart");

    if (chartInstance1) {
      chartInstance1.destroy();
    }

    const newChartInstance1 = new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: " Date & Time",
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

  const generateChart = (commitHistory) => {
    commitHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

    const chartData = {
      labels: commitHistory.map((commit) => commit.date),
      datasets: [
        {
          label: "Commit Count",
          data: commitHistory.map((commit) => commit.commitCount),
          backgroundColor: [
            "rgba(75, 192, 192, 0.5)",
            "rgba(255, 99, 132, 0.5)",
          ],
          borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
          borderWidth: 1,
        },
      ],
    };

    const ctx = document.getElementById("commitChart");

    if (chartInstance) {
      chartInstance.destroy();
    }

    const newChartInstance = new Chart(ctx, {
      type: "bar",
      data: chartData,
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
              text: "Commit Count",
            },
            beginAtZero: true,
          },
        },
      },
    });

    setChartInstance(newChartInstance);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };
  const showModal1 = () => {
    setIsModalVisible1(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setProjectIdToDelete(null);
  };

  const handleCancel1 = () => {
    setIsModalVisible1(false);
    form.resetFields();
    window.location.reload();
  };

  const handleView = async (projectId) => {
    try {
      const response = await axios.get(
        `/api/projects/getCurrentProjectByMain/${projectId}`
      );
      setCurrentProjectDetails(response.data.currentProjects);
      showModal();
      setProjectIdToDelete(projectId);
    } catch (error) {
      console.error("Error fetching current project details:", error);
    }
  };

  const handleEmailSelect = (value) => {
    setSelectedEmail(value);
  };

  const handleRefresh = async () => {
    try {
      const projectDetails = currentProjectDetails.find(
        (project) => project.studentemail === selectedEmail
      );

      if (!projectDetails) {
        console.error("Project details not found.");
        return;
      }

      await axios.post(
        `/api/projects/updateissuehistory/${projectDetails._id}`,
        {
          projectId: projectDetails._id,
          repoLink: projectDetails.github,
        }
      );

      fetchProjects();
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleRefresh1 = async () => {
    try {
      const projectDetails = currentProjectDetails.find(
        (project) => project.studentemail === selectedEmail
      );

      if (!projectDetails) {
        console.error("Project details not found.");
        return;
      }

      await axios.post(`/api/projects/docinfo/${projectDetails._id}`, {
        projectId: projectDetails._id,
        docId: projectDetails.document,
      });

      fetchProjects();
      window.location.reload();
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (!user) throw new Error("User not found in local storage");

        const { name, email } = user;
        const projectData = {
          ...values,
          instructor_name: name,
          instructor_email: email,
        };

        axios
          .post("/api/projects/createprojectmodal", projectData)
          .then((response) => {
            console.log(response.data);
            setIsModalVisible(false);
            fetchProjects();
            setIsModalVisible1(false);
          })
          .catch((error) => {
            console.error("Error creating project:", error);
          });
      })
      .catch((errorInfo) => {
        console.log("Failed:", errorInfo);
      });
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.post("/api/projects/deletemain", { id: projectIdToDelete });

      fetchProjects();

      setIsModalVisible(false);
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div className="project-layout">
      <div className="pl-main">
        <div className="pl-header">
          <div className="pl-header-txt">
            <h3>Projects</h3>
          </div>
          <div className="pl-header-btn">
            <Button type="primary" onClick={showModal1}>
              Add Project
            </Button>
          </div>
        </div>

        <div className="pl-body">
          <div className="project-grid">
            {currentProjects.map((project, index) => (
              <Card
                key={index}
                style={{
                  width: 300,
                  padding: "5px 10px 15px 10px",
                  marginBottom: 20,
                }}
              >
                <h4>{project.name}</h4>
                <br />
                <p>Subject: {project.subject}</p>
                <p>Due Date: {project.due_date}</p>
                <p>Hours: {project.hours}</p>
                <br />
                <Button onClick={() => handleView(project._id)}>View</Button>
              </Card>
            ))}
          </div>
        </div>

        <div className="pl-pagination">
          <Pagination
            current={currentPage}
            total={projects.length}
            pageSize={projectsPerPage}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      <Modal
        visible={isModalVisible}
        onOk={handleCancel}
        onCancel={handleCancel}
        width={1300}
        footer={[
          <Popconfirm
            title="Do you want to delete this project?"
            onConfirm={handleDeleteConfirm}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} className="delete-btn-project">
              Delete Project
            </Button>
          </Popconfirm>,
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
        ]}
      >
        <div>
          <h4>Current Project Details</h4>
          <Select
            defaultValue="Select Email"
            style={{ width: 200 }}
            onChange={handleEmailSelect}
          >
            {currentProjectDetails &&
              currentProjectDetails.map((project, index) => (
                <Option key={index} value={project.studentemail}>
                  {project.studentemail}
                </Option>
              ))}
          </Select>

          {selectedEmail &&
            currentProjectDetails &&
            currentProjectDetails
              .filter((project) => project.studentemail === selectedEmail)
              .map((project, index) => (
                <div key={index}>
                  <br />
                  <p>Name: {project.name}</p>
                  <p>Email: {project.studentemail}</p>
                  <p>Subject: {project.subject}</p>
                  {!project.isSetup && (
                    <p className="red-txt">Project is not Setup</p>
                  )}
                  <br />
                  <div>
                    <Button
                      type="link"
                      icon={<GithubOutlined />}
                      onClick={() => window.open(project.github, "_blank")}
                    >
                      Github
                    </Button>
                    <Button
                      type="link"
                      icon={<FileTextOutlined />}
                      onClick={() => window.open(project.document, "_blank")}
                    >
                      Document
                    </Button>
                    <br />
                    <br />
                    <h4>Github Issue History</h4>
                    <Button
                      type="link"
                      icon={<ReloadOutlined />}
                      onClick={handleRefresh}
                    >
                      Refresh
                    </Button>
                    <canvas id="commitChart" width="400" height="200"></canvas>
                    <br />
                    <h4>Word Count History</h4>
                    <Button
                      type="link"
                      icon={<ReloadOutlined />}
                      onClick={handleRefresh1}
                    >
                      Refresh
                    </Button>
                    <canvas id="wordChart" width="400" height="200"></canvas>
                  </div>
                </div>
              ))}
        </div>
      </Modal>

      <Modal visible={isModalVisible1} onOk={handleOk} onCancel={handleCancel1}>
        <Form form={form} layout="vertical" name="project_form">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Name"
                name="name"
                rules={[
                  { required: true, message: "Please input project name!" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Subject"
                name="subject"
                rules={[{ required: true, message: "Please input subject!" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Hours"
                name="hours"
                rules={[{ required: true, message: "Please input hours!" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Due Date"
                name="due_date"
                rules={[{ required: true, message: "Please input due date!" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label="Students">
            <Form.List name="students">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, fieldKey, ...restField }) => (
                    <Form.Item key={key}>
                      <Input.Group compact>
                        <Form.Item
                          {...restField}
                          name={[name, "email"]}
                          fieldKey={[fieldKey, "email"]}
                          rules={[
                            {
                              type: "email",
                              message: "Please enter a valid email address!",
                            },
                            { required: true, message: "Email is required" },
                          ]}
                          noStyle
                        >
                          <Input style={{ width: "90%" }} placeholder="Email" />
                        </Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => remove(name)}
                          style={{ width: "10%" }}
                        >
                          <DeleteOutlined />
                        </Button>
                      </Input.Group>
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => add()}
                      style={{ width: "100%" }}
                    >
                      Add Student
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Projects;
