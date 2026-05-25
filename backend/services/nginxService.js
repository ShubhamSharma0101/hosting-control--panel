const { Client } = require("ssh2");

const fs = require("fs");
const path = require("path");

const setupDomain = ({ domain, port }) => {
  return new Promise((resolve, reject) => {
    const conn = new Client();

    conn
      .on("ready", () => {
        console.log("✅ Configuring Nginx");

        const nginxConfig = `
server {
    listen 80;

    server_name ${domain};

    location / {
        proxy_pass http://localhost:${port};

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
`;

        const command = `
echo '${nginxConfig}' | sudo tee /etc/nginx/sites-available/${domain} &&
sudo ln -sf /etc/nginx/sites-available/${domain} /etc/nginx/sites-enabled/${domain} &&
sudo nginx -t &&
sudo systemctl reload nginx
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
                  reject(new Error("Nginx setup failed"));
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
  setupDomain,
};
