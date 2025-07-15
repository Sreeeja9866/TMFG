const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const volunteerRoutes = require("./routes/volunteerRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/volunteers", volunteerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
