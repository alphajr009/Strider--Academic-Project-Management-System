const express = require("express");
const path = require("path");

const app = express();

const userRoute = require("./routes/usersRoute");
const adminRoute = require("./routes/adminsRoute");
const projectRoute = require("./routes/projectsRoute");
const emailRoute = require("./routes/emailRoute");

const dbconfig = require("./db");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());

app.use("/api/users", userRoute);
app.use("/api/admins", adminRoute);
app.use("/api/projects", projectRoute);
app.use("/api/email", emailRoute);

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV == "production") {
  app.use(express.static("client/build"));
}

app.listen(port, () => console.log("Node Server Started using Nodemon!"));
