import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sendPage(res, filename) {
  res.sendFile(path.join(__dirname, "..", "..", "public", "pages", filename));
}

router.get("/", (req, res) => {
  sendPage(res, "index.html");
});

router.get("/cadastro", (req, res) => {
  sendPage(res, "cadastro.html");
});

router.get("/painelAdmin", (req, res) => {
  sendPage(res, "paineladm.html");
});

router.get("/cadprod", (req, res) => {
  sendPage(res, "cadprod.html");
});

router.get("/listprod", (req, res) => {
  sendPage(res, "listprod.html");
});

router.get("/produtos", (req, res) => {
  sendPage(res, "produtos.html");
});

router.get("/listaUsuarios", (req, res) => {
  sendPage(res, "listarusuarios.html");
});

export default router;
