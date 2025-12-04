import express from "express";
import ProdutoController from "../controller/produtoController.js";
import AuthMiddleware from "../middleware/autenticacao.js";

const produtoController = new ProdutoController();
const router = express.Router();

router.get("/", produtoController.listar);

router.post(
  "/",
  AuthMiddleware.verificar_autenticacao,
  AuthMiddleware.verificarAdmin,
  produtoController.adicionar
);

router.put(
  "/",
  AuthMiddleware.verificar_autenticacao,
  AuthMiddleware.verificarAdmin,
  produtoController.editar
);

router.delete(
  "/:id",
  AuthMiddleware.verificar_autenticacao,
  AuthMiddleware.verificarAdmin,
  produtoController.excluir
);

router.post(
  "/venda",
  AuthMiddleware.verificar_autenticacao,
  produtoController.venda
);

export default router;
