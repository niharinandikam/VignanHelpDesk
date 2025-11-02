const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const chatRoutes = require("./routes/chatRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Log incoming requests (for debugging)
app.use((req, res, next) => {
  console.log(`➡️  ${req.method} ${req.url}`, req.body);
  next();
});

// Chat API
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
