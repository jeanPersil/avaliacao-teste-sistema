import express from "express";
import UserController from "../controller/userController.js";
import AuthMiddleware from "../middleware/autenticacao.js";
import { validarRecaptcha } from "../middleware/recaptchaMiddleware.js";

const router = express.Router();
const userController = new UserController();

router.post("/cadastrar", validarRecaptcha, userController.cadastrar);

router.post("/login", validarRecaptcha, userController.login);

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
