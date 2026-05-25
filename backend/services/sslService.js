const { Client } = require("ssh2");

const fs = require("fs");

const path = require("path");

const setupSSL = (domain) => {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn
      .on("ready", () => {
        console.log(`🔒 Setting up SSL for ${domain}`);

        const command = `
sudo certbot --nginx \
-d ${domain} \
--non-interactive \
--agree-tos \
-m ${process.env.SSL_EMAIL} \
--redirect
`;

        conn.exec(
          command,

          (err, stream) => {
            if (err) {
              reject(err);
            }

            let output = "";

            stream
              .on("close", (code) => {
                conn.end();

                if (code === 0) {
                  console.log(`✅ SSL Generated for ${domain}`);

                  resolve(true);
                } else {
                  reject(new Error(output));
                }
              })
              .on("data", (data) => {
                output += data.toString();

                console.log(data.toString());
              });

            stream.stderr.on("data", (data) => {
              output += data.toString();

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
  setupSSL,
};
