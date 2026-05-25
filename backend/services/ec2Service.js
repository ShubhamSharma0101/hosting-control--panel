const { Client } = require("ssh2");

const fs = require("fs");
const path = require("path");

const deployContainer = ({ image, clientName , port}) => {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn
      .on("ready", () => {
        console.log("✅ SSH Connected");

        const containerName = clientName.toLowerCase().replace(/\s+/g, "-");

        const command = `
                docker pull ${image} &&
                docker rm -f ${containerName} || true &&
                docker run -d \
                --name ${containerName} \
                --restart unless-stopped \
               -p ${port}:80 \
                ${image}
                `;

        conn.exec(
          command,

          (err, stream) => {
            if (err) {
              reject(err);
            }

            stream
              .on("close", (code) => {
                conn.end();

                if (code === 0) {
                  resolve(true);
                } else {
                  reject(new Error("Docker deployment failed"));
                }
              })
              .on("data", (data) => {
                console.log(data.toString());
              });

            stream.stderr.on("data", (data) => {
              console.error(data.toString());
            });
          },
        );
      })
      .connect({
        host: process.env.EC2_HOST,

        username: process.env.EC2_USER,

        privateKey: fs.readFileSync(
          path.resolve(process.env.SSH_PRIVATE_KEY_PATH),
        ),
      });
  });
};

module.exports = {
  deployContainer,
};
