import express from "express";
import FeedbackController from "../controller/feedbackController.js";

const feedbackController = new FeedbackController();

const router = express.Router();

router.post("/", feedbackController.adicionar);
router.get("/", feedbackController.listar);
router.put("/", feedbackController.editar);
router.delete("/:id", feedbackController.excluir);

export default router;
