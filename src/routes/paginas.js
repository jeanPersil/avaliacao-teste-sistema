import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import AuthMiddleware from "../middleware/autenticacao.js";
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

router.get(
  "/painelAdmin",
  AuthMiddleware.verificar_autenticacao,
  (req, res) => {
    sendPage(res, "paineladm.html");
  }
);

router.get("/cadprod", AuthMiddleware.verificar_autenticacao, (req, res) => {
  sendPage(res, "cadprod.html");
});

router.get("/listprod", AuthMiddleware.verificar_autenticacao, (req, res) => {
  sendPage(res, "listprod.html");
});

router.get(
  "/listaUsuarios",
  AuthMiddleware.verificar_autenticacao,
  (req, res) => {
    sendPage(res, "listarusuarios.html");
  }
);

router.get("/produtos", AuthMiddleware.verificar_autenticacao, (req, res) => {
  sendPage(res, "produtos.html");
});

router.get("/feedback", AuthMiddleware.verificar_autenticacao, (req, res) => {
  sendPage(res, "feedback.html");
});

router.get("/meu-feedback", AuthMiddleware.verificar_autenticacao, (req, res) => {
  sendPage(res, "feedback.usuario.html");
});

export default router;
