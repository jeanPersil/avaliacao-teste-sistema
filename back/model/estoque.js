import { Produto } from "./produto.js";


 export class Estoque {
    constructor(){
        this.apiUrl = "www.test.br"; 
        this.produtos = [];
    }

    async adicionarProduto(nome, preco, quantidade, validade){
        try {
            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    acao: "produto",
                    nome: nome,
                    preco: preco,
                    quantidade: quantidade,
                    validade: validade
                })
            });

            const resultado = await response.text(); 

            if (response.ok) {
                return resultado;
            } 

            throw new Error(resultado);
            

        } catch (erro) {
            console.error("Erro ao adicionar produto:", erro);
            return false;
        }
    }

    listarProdutos(){
        return this.produtos;
    }

}