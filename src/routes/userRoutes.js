import express from "express";
import UserController from "../controller/userController.js";
import AuthMiddleware from "../middleware/autenticacao.js";

const router = express.Router();
const userController = new UserController();

router.post("/cadastrar", userController.cadastrar);

router.post("/login", userController.login);

router.get("/logout", userController.logout);

router.get(
  "/",
  AuthMiddleware.verificar_autenticacao,
  AuthMiddleware.verificarAdmin,
  userController.listarUsuarios
);

router.delete(
  "/:id",
  AuthMiddleware.verificar_autenticacao,
  AuthMiddleware.verificarAdmin,
  userController.excluir
);

export default router;
