require("dotenv").config();

const connectDB = require("./config/db");

const startWorker = async () => {
  try {
    await connectDB();

    require("./workers/deploymentWorker");

    console.log("🚀 Worker Started...");
  } catch (error) {
    console.error(error);
  }
};

startWorker();
