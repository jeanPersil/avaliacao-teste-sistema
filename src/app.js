import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import paginas from "./routes/paginas.js";
import userRoutes from "./routes/userRoutes.js";
import produtoRoutes from "./routes/produtoRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";

app.set("view engine", "ejs")
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());




// Ajuste do static
app.use(express.static(path.join(__dirname, "../public")));

app.use("/", paginas);
app.use("/user", userRoutes);
app.use("/produto", produtoRoutes);
app.use("/feedback", feedbackRoutes);

export default app;
