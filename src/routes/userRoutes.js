import express from "express";
import UserController from "../controller/userController.js";

const router = express.Router();
const userController = new UserController();

router.post("/login", userController.login);

router.get("/logout", userController.logout);

router.get("/", userController.listarUsuarios);

router.delete("/:id", userController.excluir);

export default router;
