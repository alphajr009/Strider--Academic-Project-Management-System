import "../../css/profile.css";
import {
  Layout,
  Button,
  Form,
  Input,
  Radio,
  Col,
  Row,
  DatePicker,
  Modal,
  Icon,
  Select,
  Space,
  notification,
} from "antd";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { LockOutlined } from "@ant-design/icons";
import moment from "moment";

function Profile() {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  console.log("Working");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saveButtonText, setSaveButtonText] = useState("Edit Profile");
  const [gender, setGender] = useState("");
  const [birthday, setBirthday] = useState("");
  const [level, setLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const { location } = window;

  const [visible, setVisible] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmNewPwd, setConfirmNewPwd] = useState("");

  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const user = JSON.parse(localStorage.getItem("currentUser"));
        if (!user) throw new Error("User not found in local storage");
        const response = await axios.post("/api/admins/getuserbyid", {
          userid: user._id,
        });
        const data = response.data;

        setEmail(data.email);
        setName(data.name);
        setGender(data.gender);
        setAddress(data.address);
        setBirthday(data.birthday);
        setLevel(data.level);
        setSubject(data.subject);

        form.setFieldsValue({
          name: data.name,
          gender: data.gender,
          address: data.address,
          birthday: data.birthday,
          level: data.level,
          subject: data.subject,
        });

        setPageLoaded(true);
      } catch (error) {
        console.log("Error fetching user data:", error);
      }
    })();
  }, []);

  async function changeUserDetails(
    name,
    level,
    gender,
    subject,
    address,
    birthday
  ) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) throw new Error("User not found in local storage");

    const _id = currentUser._id;
    try {
      const res = await axios.patch("/api/admins/updateuser", {
        _id,
        name,
        subject,
        level,
        gender,
        address,
        birthday,
      });
      console.log(res.data);
      setTimeout(() => {
        location.reload();
      }, 1300);
    } catch (error) {
      console.log(error);
    }
  }

  const onSaveButtonClick = () => {
    form
      .validateFields()
      .then((values) => {
        setName(values.name);
        setSubject(values.subject);
        setLevel(values.level);
        setGender(values.gender);
        setAddress(values.address);
        setBirthday(values.birthday);
      })
      .catch((error) => {});
  };

  const onSaveButtonClick1 = async () => {
    try {
      const values = await form.validateFields();
      setName(values.name);
      setGender(values.gender);
      setBirthday(values.birthday);
      setSubject(values.subject);
      setLevel(values.level);
      setAddress(values.address);

      await changeUserDetails(
        values.name,
        values.level,
        values.gender,
        values.subject,
        values.address,
        values.birthday
      );
      notification.success({
        message: "Success",
        description: "Profile has been saved!",
      });
    } catch (error) {
      console.error("An error occurred:", error);
      notification.error({
        message: "Error",
        description: "Failed to save profile. Please try again later.",
      });
    }
  };

  const onCancelButtonClick = () => {
    form.resetFields();
    setEditMode(false);
    setSaveButtonText("Edit Profile");
  };

  const [form] = Form.useForm();
  const [formLayout, setFormLayout] = useState("horizontal");

  const initialValues = {
    name: name,
    gender: gender,
    phone: phone,
    address: address,
    birthday: birthday,
    level: level,
    subject: subject,
  };

  form.setFieldsValue(initialValues);

  const formItemLayout =
    formLayout === "horizontal"
      ? {
          labelCol: {
            span: 4,
          },
          wrapperCol: {
            span: 20,
          },
        }
      : null;

  const buttonItemLayout =
    formLayout === "horizontal"
      ? {
          wrapperCol: {
            span: 24,
            style: {
              display: "flex",
              alignItems: "flex-end",
              paddingTop: "10px",
            },
          },
        }
      : null;

  const { TextArea } = Input;

  const onFormLayoutChange1 = ({ layout, ...values }) => {
    setFormLayout(layout);

    setName(values.name);
    setGender(values.gender);
    setPhone(values.phone);
    setAddress(values.address);
    setBirthday(values.birthday);
    setLevel(values.level);
    setSubject(values.subject);
  };

  const showModal = () => {
    setCurrentPwd("");
    setNewPwd("");
    setConfirmNewPwd("");
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
    setCurrentPwd("");
    setNewPwd("");
    setConfirmNewPwd("");
    form.resetFields(["currentPwd", "newPwd", "confirmNewPwd"]);
  };

  const handleCurrentPwdChange = (e) => {
    setCurrentPwd(e.target.value);
  };

  const handleNewPwdChange = (e) => {
    setNewPwd(e.target.value);
  };

  const handleConfirmNewPwdChange = (e) => {
    setConfirmNewPwd(e.target.value);
  };

  const handleSavePassword = async () => {
    try {
      if (newPwd !== confirmNewPwd) {
        throw new Error("New password and confirm new password do not match");
      }

      const userId = user._id;
      const response = await axios.post("/api/admins/changepassword", {
        id: userId,
        previousPwd: currentPwd,
        newPwd: newPwd,
      });
      notification.success({
        message: "Success",
        description: response.data,
      });
      setVisible(false);
      setCurrentPwd("");
      setNewPwd("");
      setConfirmNewPwd("");
      form.resetFields(["currentPwd", "newPwd", "confirmNewPwd"]);

      setTimeout(() => {
        window.location.href = "/admin-terminal";
      }, 1000);
    } catch (error) {
      console.error("An error occurred:", error);
      notification.error({
        message: "Error",
        description:
          error.response?.data?.message || "Failed to change password",
      });
    }
  };

  return (
    <Layout>
      <div className="profile-cover">
        <Button
          className="user-edit-btn"
          onClick={() => {
            if (editMode) {
              onCancelButtonClick();
            } else {
              setEditMode(true);
              setSaveButtonText("Save");
            }
          }}
        >
          {editMode ? "Cancel" : "Edit Profile"}
        </Button>
        <Button className="user-edit-btn1" onClick={showModal}>
          Change Password
        </Button>{" "}
      </div>
      <div className="acc-form-sec">
        <Col span={24}>
          <Form
            {...formItemLayout}
            layout={formLayout}
            form={form}
            onChange={onSaveButtonClick}
            initialValues={{
              layout: formLayout,
            }}
            autoComplete="off"
          >
            <div className="form-coloums">
              <Col span={12}>
                <Form.Item
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your name!",
                    },
                  ]}
                >
                  <label>Name</label>
                  <Input
                    value={name}
                    placeholder="Name"
                    disabled={!editMode}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Item>
                <Form.Item
                  name="subject"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your name!",
                    },
                  ]}
                >
                  <label>Subject</label>
                  <Input
                    value={subject}
                    placeholder="Subject"
                    disabled={!editMode}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </Form.Item>
                <Form.Item
                  name="gender"
                  rules={[
                    {
                      required: true,
                      message: "Please select your gender!",
                    },
                  ]}
                >
                  <label>Gender: </label>
                  <Radio.Group
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    disabled={!editMode}
                  >
                    <Radio value="Male">Male</Radio>
                    <Radio value="Female">Female</Radio>
                  </Radio.Group>
                </Form.Item>
                <Form.Item
                  name="birthday"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your Level !",
                    },
                  ]}
                >
                  <label>Birthday</label>
                  <Input
                    value={birthday}
                    placeholder="Birthday"
                    disabled={!editMode}
                    onChange={(e) => setBirthday(e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="email">
                  <label>Email</label>
                  <Input
                    placeholder={email}
                    disabled={true}
                    suffix={<LockOutlined style={{ color: "#aaa" }} />}
                  />
                </Form.Item>

                <Form.Item
                  name="level"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your city!",
                    },
                  ]}
                >
                  <label>Level</label>
                  <Input
                    value={level}
                    placeholder="Level"
                    disabled={!editMode}
                    onChange={(e) => setLevel(e.target.value)}
                  />
                </Form.Item>
                <Space
                  style={{
                    width: "100%",
                  }}
                  direction="vertical"
                >
                  <Form.Item
                    name="address"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your address!",
                      },
                    ]}
                  >
                    <label>Address</label>
                    <TextArea
                      value={address}
                      rows={5}
                      placeholder="Address"
                      disabled={!editMode}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </Form.Item>
                </Space>
                <Form.Item {...buttonItemLayout}>
                  <Button
                    className="user-submit-btn"
                    disabled={!editMode}
                    type="primary"
                    htmlType="submit"
                    onClick={onSaveButtonClick1}
                  >
                    Save
                  </Button>{" "}
                </Form.Item>
              </Col>
            </div>
          </Form>
        </Col>
      </div>

      <Modal
        title="Change Password"
        visible={visible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleSavePassword}>
            Save
          </Button>,
        ]}
      >
        <Form>
          <div className="m-8">
            <label className="text-align-left m-8">Current Password</label>
          </div>
          <Form.Item
            name="currentPwd"
            rules={[
              {
                required: true,
                message: "Please enter your current password",
              },
            ]}
          >
            <Input.Password onChange={handleCurrentPwdChange} />
          </Form.Item>
          <div className="m-8">
            <label className="text-align-left m-8">New Password</label>
          </div>
          <Form.Item
            name="newPwd"
            rules={[
              {
                required: true,
                message: "Please enter your new password",
              },
            ]}
          >
            <Input.Password onChange={handleNewPwdChange} />
          </Form.Item>
          <div className="m-8">
            <label className="text-align-left m-8">Confirm New Password</label>
          </div>
          <Form.Item
            name="confirmNewPwd"
            rules={[
              {
                required: true,
                message: "Please confirm your new password",
              },
            ]}
          >
            <Input.Password onChange={handleConfirmNewPwdChange} />
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
}

export default Profile;
