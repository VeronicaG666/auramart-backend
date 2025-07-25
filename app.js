const express = require("express");
require("express-async-errors"); 
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const dotenv = require("dotenv");

dotenv.config();

const routes = require("./routes");
const authRoutes = require("./routes/auth");
const unknownEndpoint = require("./middleware/unKnownEndpoint");
const { handleError } = require("./helpers/error");

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "https://your-vercel-app.vercel.app" // Replace later with actual Vercel URL
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "auth-token"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(compression());
app.use(helmet());
app.use(cookieParser());

app.get("/", (req, res) => res.send("<h1 style='text-align: center'> API is running</h1>"));

app.use("/api/auth", authRoutes);
app.use("/api", routes);

app.use(unknownEndpoint);

app.use(handleError);

module.exports = app;
