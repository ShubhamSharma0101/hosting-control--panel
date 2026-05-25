import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [formData, setFormData] = useState({
    clientName: "",
    domain: "",
    image: "",
  });

  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(false);

  const API = "https://api.devshubham.in/api";

  const fetchDeployments = async () => {
    try {
      const response = await axios.get(`${API}/deployments`);

      setDeployments(response.data.deployments);
    } catch (error) {
      console.error("Fetch deployments error:", error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDeployments();
  }, []);

  // Smart polling
  useEffect(() => {
    const hasActiveDeployment = deployments.some(
      (deployment) =>
        deployment.status === "Pending" || deployment.status === "Processing",
    );

    if (!hasActiveDeployment) return;

    console.log("Polling started: Active deployment found");

    const interval = setInterval(() => {
      fetchDeployments();
    }, 5000);

    return () => {
      console.log("Polling stopped");
      clearInterval(interval);
    };
  }, [deployments]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDeploy = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post(`${API}/deploy`, formData);

      console.log("Deployment response:", response.data);

      // Reset form
      setFormData({
        clientName: "",
        domain: "",
        image: "",
      });

      // Refresh deployment list immediately
      await fetchDeployments();
    } catch (error) {
      console.error("Deployment error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return {
          background: "#dcfce7",
          color: "#166534",
        };

      case "Failed":
        return {
          background: "#fee2e2",
          color: "#991b1b",
        };

      case "Processing":
        return {
          background: "#dbeafe",
          color: "#1d4ed8",
        };

      default:
        return {
          background: "#fef3c7",
          color: "#92400e",
        };
    }
  };

  return (
    <div
      style={{
        background: "#f4f6f8",
        minHeight: "100vh",
        padding: "40px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            marginBottom: "10px",
          }}
        >
          Hosting Control Panel
        </h1>

        <p
          style={{
            color: "#666",
            marginBottom: "30px",
          }}
        >
          Deploy Docker containers with custom domains
        </p>

        {/* FORM */}
        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            marginBottom: "30px",
          }}
        >
          <h2>New Deployment</h2>

          <form
            onSubmit={handleDeploy}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr auto",
              gap: "12px",
            }}
          >
            <input
              type="text"
              name="clientName"
              placeholder="Client Name"
              value={formData.clientName}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <input
              type="text"
              name="domain"
              placeholder="abc.devshubham.in"
              value={formData.domain}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <input
              type="text"
              name="image"
              placeholder="nginx:latest"
              value={formData.image}
              onChange={handleChange}
              required
              style={inputStyle}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "#94a3b8" : "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "0 20px",
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "bold",
              }}
            >
              {loading ? "Deploying..." : "Deploy"}
            </button>
          </form>
        </div>

        {/* DASHBOARD */}
        <div
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          }}
        >
          <h2
            style={{
              marginBottom: "20px",
            }}
          >
            Live Status Dashboard
          </h2>

          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                  }}
                >
                  <th style={thStyle}>Client</th>
                  <th style={thStyle}>Domain</th>
                  <th style={thStyle}>Image</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Port</th>
                  <th style={thStyle}>Open</th>
                </tr>
              </thead>

              <tbody>
                {deployments.map((deployment) => (
                  <tr key={deployment._id}>
                    <td style={tdStyle}>{deployment.clientName}</td>

                    <td style={tdStyle}>{deployment.domain}</td>

                    <td style={tdStyle}>{deployment.image}</td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          ...getStatusStyle(deployment.status),
                          padding: "6px 12px",
                          borderRadius: "999px",
                          fontSize: "14px",
                          fontWeight: "bold",
                        }}
                      >
                        {deployment.status}
                      </span>
                    </td>

                    <td style={tdStyle}>{deployment.port}</td>

                    <td style={tdStyle}>
                      {deployment.domain && (
                        <a
                          href={`https://${deployment.domain}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            color: "#2563eb",
                            fontWeight: "bold",
                            textDecoration: "none",
                          }}
                        >
                          Open
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "12px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  outline: "none",
};

const thStyle = {
  textAlign: "left",
  padding: "14px",
  borderBottom: "1px solid #eee",
};

const tdStyle = {
  padding: "14px",
  borderBottom: "1px solid #eee",
};

export default App;
