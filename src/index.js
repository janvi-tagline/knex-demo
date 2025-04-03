require("dotenv").config();
const express = require("express");
const routes = require("./routes");
const db = require("./db");

const app = express();

app.use(express.json());

app.use("/api", routes);

app.use((err, req, res, next) => {
  res.status(500).json({
    message: "Internal Server Error",
  });
});

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
