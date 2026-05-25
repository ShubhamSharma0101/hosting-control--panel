const express = require("express");

const router = express.Router();

const Deployment = require("../models/Deployment");

const { deploymentQueue } = require("../queue/deploymentQueue");

router.post("/deploy", async (req, res) => {
  try {
    const { clientName, domain, image } = req.body;

    // validation
    if (!clientName || !domain || !image) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const lastDeployment = await Deployment.findOne().sort({
      port: -1,
    });

    const nextPort = lastDeployment?.port ? lastDeployment.port + 1 : 3001;

    // save to mongodb
    const deployment = await Deployment.create({
      clientName,
      domain,
      image,
      port: nextPort,
      status: "Pending",
    });

    // queue job
    await deploymentQueue.add("deploy-client", {
      deploymentId: deployment._id.toString(),

      clientName,
      domain,
      image,
      port: deployment.port,
    });

    return res.status(200).json({
      success: true,
      message: "Deployment queued successfully",

      deploymentId: deployment._id,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/status/:id", async (req, res) => {
  try {
    const deployment = await Deployment.findById(req.params.id);

    if (!deployment) {
      return res.status(404).json({
        success: false,
        message: "Deployment not found",
      });
    }

    return res.status(200).json({
      success: true,

      deployment: {
        id: deployment._id,

        clientName: deployment.clientName,

        domain: deployment.domain,

        image: deployment.image,

        port: deployment.port,

        status: deployment.status,

        createdAt: deployment.createdAt,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

router.get("/deployments", async (req, res) => {
  try {
    const deployments = await Deployment.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      deployments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
