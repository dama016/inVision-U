import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { registerAnalyticsRoutes } from "./routes/analytics.js";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerCandidateRoutes } from "./routes/candidates.js";

const app = express();
const PORT = Number(process.env.SERVER_PORT) || 4000;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

registerAuthRoutes(app);
registerAnalyticsRoutes(app);
registerCandidateRoutes(app);

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
