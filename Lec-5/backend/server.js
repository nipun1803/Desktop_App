const express = require("express");
const cors = require("cors");
const { PORT } = require("./config/constants");
const examRoutes = require("./routes/examRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Exam backend is running" });
});

app.use("/exam", examRoutes);

app.listen(PORT, () => {
  console.log(`Exam backend running at http://localhost:${PORT}`);
});
