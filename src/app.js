const express = require("express");
const reportsRoute = require("./routes/reports");

const app = express();

app.set("trust proxy", 1);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use((req, res, next) => {
  req.setTimeout(25000, () => {
    res.status(408).json({ message: "Request timeout" });
  });
  res.setTimeout(25000, () => {
    res.status(408).json({ message: "Response timeout" });
  });
  next();
});

const apiRouter = express.Router();

apiRouter.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "backend",
    port: process.env.PORT,
    pid: process.pid,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

apiRouter.use("/reports", reportsRoute);

app.use("/api", apiRouter);

app.get("/", (req, res) => {
  res.send("Backend running");
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Global error handler:", err.stack);

  const message =
    process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message;

  res.status(err.status || 500).json({
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
