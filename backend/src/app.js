const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const routes = require("./routes");
const { generalLimiter } = require("./middleware/rateLimiter");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(generalLimiter);

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
