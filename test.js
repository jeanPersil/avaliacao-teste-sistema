import { Estoque } from "./back/model/estoque.js";
import { Produto } from "./back/model/produto.js";


const produto1 = new Produto(1, "feijao", 10, 5)
const produto2 = new Produto(2, "arroz", 2, 5)

const estoque = new Estoque();


let teste = estoque.adicionarProduto(produto1);
estoque.adicionarProduto(produto2)

if(teste){
    console.log("funcionou!")
    console.log(estoque.listarProdutos())
}









