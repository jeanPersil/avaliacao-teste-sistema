import express from "express";
import ProdutoController from "../controller/produtoController.js";

const produtoController = new ProdutoController();

const router = express.Router();

router.post("/", produtoController.adicionarProduto);
router.get("/", produtoController.listarProdutos);

export default router;
