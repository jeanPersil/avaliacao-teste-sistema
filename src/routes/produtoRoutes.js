import express from "express";
import ProdutoController from "../controller/produtoController.js";

const produtoController = new ProdutoController();

const router = express.Router();

router.post("/", produtoController.adicionar);
router.get("/", produtoController.listar);
router.put("/", produtoController.editar);
router.delete("/:id", produtoController.excluir);

export default router;
