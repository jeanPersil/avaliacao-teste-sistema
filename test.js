import { Estoque } from "./back/model/estoque.js";
import { Produto } from "./back/model/produto.js";


const estoque = new Estoque();

let produtos = await estoque.listarProdutos();

console.log(produtos)














