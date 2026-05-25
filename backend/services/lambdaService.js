const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");

const client = new LambdaClient({
  region: process.env.AWS_REGION,

  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,

    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const invokeLambda = async (payload) => {
  const command = new InvokeCommand({
    FunctionName: process.env.LAMBDA_FUNCTION_NAME,

    Payload: Buffer.from(JSON.stringify(payload)),
  });

  const response = await client.send(command);

  console.log("✅ Lambda Invoked");

  return response;
};

module.exports = {
  invokeLambda,
};
