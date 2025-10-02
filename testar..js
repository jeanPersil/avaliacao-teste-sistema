import { Estoque } from "./back/services/estoque.js";

const estoque = new Estoque();

let produto = await estoque.listarProdutos();

console.log(produto);
