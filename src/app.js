import express from "express";
import path from "path";
import cookieParser from "cookie-parser";

const app = express();

import paginas from "./routes/paginas.js";
import userRoutes from "./routes/userRoutes.js";
import produtoRoutes from "./routes/produtoRoutes.js";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(import.meta.dirname, "../public")));

app.use("/", paginas);
app.use("/user", userRoutes);
app.use("/produto", produtoRoutes);

export default app;
