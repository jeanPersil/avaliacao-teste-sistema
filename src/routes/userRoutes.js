import express from "express";
import UserController from "../controller/userController.js";

const router = express.Router();
const userController = new UserController();

router.post("/login", userController.login);

router.post("/logout", userController.logout);

export default router;
