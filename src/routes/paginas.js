import express from "express";
import path from "path";

const router = express.Router();

router.get("/", (req, res) => {
  path.join(import.meta.dirname("..", "..", "public", "index.html"));
});

router.get("/cadastro",(req, res) => {
  path.join(import.meta.dirname("..", "..", "public", "cadastro.html"))
})

router.get("/painelAdmin", (req, res) => {
  path.join(import.meta.dirname("..", "..", "public", "paineladm.html"))
})

router.get("/cadprod", (req, res) => {
  path.join(import.meta.dirname("..", "..", "public", "cadprod.html"))
})

router.get("/listprod",(req, res) =>{
  path.join(import.meta.dirname("..", "..", "public", "listprod.html"))
})

router.get("/produtos", (req, res) =>{
  path.join(import.meta.dirname("..", "..", "public", "produtos.html"))
})



export default router;
