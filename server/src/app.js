import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import "express-async-errors";

import quoteRoutes from "./routes/quotes.js";
import newsletterRoutes from "./routes/newsletter.js";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";
import trackRoutes from "./routes/track.js";
import clientRoutes from "./routes/client.js";
import consentRoutes from "./routes/consent.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";
import { requireDbReady } from "./middleware/dbReady.js";
import { generalLimiter } from "./middleware/rateLimiters.js";

const app = express();

// Needed in production so express-rate-limit and req.ip see the real
// client IP instead of the reverse proxy's (Render/Nginx/etc), which
// would otherwise rate-limit everyone as if they were one visitor.
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Comma-separate multiple origins in CLIENT_ORIGIN if needed, e.g.
// "https://quicktransolution.com,https://www.quicktransolution.com"
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(helmet());
// credentials: true + an explicit origin (not "*") is required for the
// httpOnly session cookie to be sent/accepted cross-origin at all —
// browsers block credentialed requests to a wildcard origin outright.
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header = same-origin request or a non-browser client
      // (curl, server-to-server health checks) — allow those through.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
// Strips any "$"-prefixed or dot-containing keys from req.body/query/
// params — the defense against NoSQL-operator injection discussed
// earlier (e.g. { "$ne": null } sent in place of a plain string).
app.use(mongoSanitize());
app.use(morgan("dev"));
app.use(generalLimiter);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use(requireDbReady);

app.use("/api/quotes", quoteRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/track", trackRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/consent", consentRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;