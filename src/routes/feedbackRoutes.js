import express from "express";
import FeedbackController from "../controller/feedbackController.js";
import AuthMiddleware from "../middleware/autenticacao.js";

const feedbackController = new FeedbackController();

const router = express.Router();

router.post(
  "/",
  AuthMiddleware.verificar_autenticacao,
  feedbackController.adicionar
);
router.get(
  "/",
  AuthMiddleware.verificar_autenticacao,
  AuthMiddleware.verificarAdmin,
  feedbackController.listar
);
router.put(
  "/",
  AuthMiddleware.verificar_autenticacao,
  AuthMiddleware.verificarAdmin,
  feedbackController.editar
);
router.delete(
  "/:id",
  AuthMiddleware.verificar_autenticacao,
  AuthMiddleware.verificarAdmin,
  feedbackController.excluir
);

export default router;
