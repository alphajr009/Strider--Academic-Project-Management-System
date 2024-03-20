import React, { useState, useEffect } from "react";
import { PlusCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import { Table, Button, Modal, Input, Select } from "antd";
import Axios from "axios";
import "../../css/AdminInstuctor.css";

const { Option } = Select;

function Instructors() {
  const [instructors, setInstructors] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [viewPasswordModalVisible, setViewPasswordModalVisible] =
    useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    birthday: "",
    subject: "",
    level: "",
    address: "",
    password: "1qaz2wsx@@",
  });

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await Axios.get("/api/admins/getInstructors");
      setInstructors(response.data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
    }
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
      title: "Edit",
      key: "edit",
      render: (text, record) => (
        <Button onClick={() => handleEdit(record)}>Edit</Button>
      ),
    },
    {
      title: "Password",
      key: "password",
      render: (text, record) => (
        <Button onClick={() => handleViewPassword(record)}>View</Button>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Button
          type="danger"
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const handleDelete = async (record) => {
    try {
      await Axios.delete(`/api/admins/delete/${record._id}`);
      fetchInstructors();
    } catch (error) {
      console.error("Error deleting instructor:", error);
    }
  };

  const handleEdit = (record) => {
    setSelectedInstructor(record);
    setFormData({
      name: record.name,
      email: record.email,
      gender: record.gender,
      birthday: record.birthday,
      subject: record.subject,
      level: record.level,
      address: record.address,
      password: record.password,
    });
    setEditModalVisible(true);
  };

  const handleViewPassword = (record) => {
    setSelectedInstructor(record);
    setViewPasswordModalVisible(true);
  };

  const closeModal = () => {
    setAddModalVisible(false);
    setViewPasswordModalVisible(false);
    setEditModalVisible(false);
    setSelectedInstructor(null);
    setFormData({
      name: "",
      email: "",
      gender: "",
      birthday: "",
      subject: "",
      level: "",
      address: "",
      password: "1qaz2wsx@@",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (value) => {
    setFormData({
      ...formData,
      gender: value,
    });
  };

  const handleEditSubmit = async () => {
    try {
      await Axios.post("/api/admins/update", {
        _id: selectedInstructor._id,
        ...formData,
      });
      setEditModalVisible(false);
      fetchInstructors();
    } catch (error) {
      console.error("Error updating instructor:", error);
    }
  };

  const handleModalSubmit = async () => {
    try {
      await Axios.post("/api/admins/create", formData);
      setAddModalVisible(false);
      fetchInstructors();
      setFormData({
        name: "",
        email: "",
        gender: "",
        birthday: "",
        subject: "",
        level: "",
        address: "",
        password: "1qaz2wsx@@",
      });
    } catch (error) {
      console.error("Error creating instructor:", error);
    }
  };

  return (
    <div className="Ins-page">
      <div className="ins-header">
        <div className="ins-header-text">
          <h1>Instructors</h1>
        </div>
        <div className="ins-header-button">
          <Button
            icon={<PlusCircleOutlined />}
            type="primary"
            onClick={() => setAddModalVisible(true)}
          >
            Add Instructor
          </Button>
        </div>
      </div>
      <div className="ins-table">
        <Table dataSource={instructors} columns={columns} />
      </div>

      <Modal
        title="Add Instructor"
        visible={addModalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="cancel" onClick={closeModal}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleModalSubmit}>
            Create
          </Button>,
        ]}
      >
        <div className="modal-form">
          <p>
            <b>Name</b>
          </p>
          <Input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <p>
            <b>Email</b>
          </p>
          <Input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <p>
            <b>Gender</b>
          </p>
          <Select
            placeholder="Gender"
            style={{ width: "100%" }}
            value={formData.gender}
            onChange={handleSelectChange}
            className="select"
          >
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
            <Option value="other">Other</Option>
          </Select>
          <p>
            <b>Birthday</b>
          </p>
          <Input
            name="birthday"
            placeholder="Birthday"
            value={formData.birthday}
            onChange={handleInputChange}
          />
          <p>
            <b>Subject</b>
          </p>
          <Input
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleInputChange}
          />
          <p>
            <b>Level</b>
          </p>
          <Input
            name="level"
            placeholder="Level"
            value={formData.level}
            onChange={handleInputChange}
          />
          <p>
            <b>Address</b>
          </p>
          <Input
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleInputChange}
          />
        </div>
      </Modal>

      <Modal
        title="Instructor Password"
        visible={viewPasswordModalVisible}
        onCancel={closeModal}
        footer={null}
      >
        {selectedInstructor && <p>Password: {selectedInstructor.password}</p>}
      </Modal>

      <Modal
        title="Edit Instructor"
        visible={editModalVisible}
        onCancel={closeModal}
        footer={[
          <Button key="cancel" onClick={closeModal}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleEditSubmit}>
            Save
          </Button>,
        ]}
      >
        <div className="modal-form">
          <p>
            <b>Name</b>
          </p>
          <Input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
          />
          <p>
            <b>Email</b>
          </p>
          <Input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <p>
            <b>Gender</b>
          </p>
          <Input
            name="gender"
            placeholder="Gender"
            value={formData.gender}
            onChange={handleInputChange}
          />
          <p>
            <b>Birthday</b>
          </p>
          <Input
            name="birthday"
            placeholder="Birthday"
            value={formData.birthday}
            onChange={handleInputChange}
          />
          <p>
            <b>Subject</b>
          </p>
          <Input
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleInputChange}
          />
          <p>
            <b>Level</b>
          </p>
          <Input
            name="level"
            placeholder="Level"
            value={formData.level}
            onChange={handleInputChange}
          />
          <p>
            <b>Address</b>
          </p>
          <Input
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleInputChange}
          />
        </div>
      </Modal>
    </div>
  );
}

export default Instructors;
