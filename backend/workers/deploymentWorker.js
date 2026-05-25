const { Worker } = require("bullmq");

const IORedis = require("ioredis");

const Deployment = require("../models/Deployment");

const { deployContainer } = require("../services/ec2Service");

const { invokeLambda } = require("../services/lambdaService");

const { setupDomain } = require("../services/nginxService");

const { setupSSL } = require("../services/sslService");



const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",

  port: process.env.REDIS_PORT || 6379,

  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "deploymentQueue",

  async (job) => {
    try {
      console.log("🚀 Processing Deployment");

      const { deploymentId, clientName, image, port, domain } = job.data;

      await deployContainer({
        image,
        clientName,
        port,
      });

      await setupDomain({
        domain,
        port,
      });

      await setupSSL(domain);

      await invokeLambda({
        deploymentId,
        clientName,
        image,
        port,
      });

      await Deployment.findByIdAndUpdate(deploymentId, {
        status: "Completed",
      });

      console.log("✅ Deployment Success");
    } catch (error) {
      console.error(error);

      await Deployment.findByIdAndUpdate(job.data.deploymentId, {
        status: "Failed",
      });

      throw error;
    }
  },

  {
    connection,
  },
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`❌ Job ${job.id} failed`);

  console.error(err);
});
