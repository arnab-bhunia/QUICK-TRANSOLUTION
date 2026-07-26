import express from "express";
import cors from "cors";
import morgan from "morgan";
import "express-async-errors";

import quoteRoutes from "./routes/quotes.js";
import newsletterRoutes from "./routes/newsletter.js";
import chatRoutes from "./routes/chat.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js"; 

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/quotes", quoteRoutes);
app.use("/api/newsletter", newsletterRoutes);
app.use("/api/chat", chatRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
