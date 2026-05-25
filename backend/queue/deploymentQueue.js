const { Queue } = require("bullmq");

const IORedis = require("ioredis");

const connection = new IORedis({
  host: process.env.REDIS_HOST || "localhost",

  port: process.env.REDIS_PORT || 6379,

  maxRetriesPerRequest: null,
});

const deploymentQueue = new Queue("deploymentQueue", {
  connection,
});

module.exports = {
  deploymentQueue,
  connection,
};
