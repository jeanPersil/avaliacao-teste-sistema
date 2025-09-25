import { Produto } from "./produto.js";
import { supabase } from "../../banco/supabaseConfig.js";


 export class Estoque {
    constructor(){
        this.produtos = [];
    }

   async adicionarProduto(nome, preco, quantidade, validade){

        if(!nome || !preco || !quantidade || !validade){
            throw new Error("Todos os campos são obrigatórios");
        }

        

        try {
            const { data, error } = await supabase
                .from('produtos')
                .insert([
                    {
                        nome: nome,
                        preco: preco,
                        quantidade: quantidade,
                        validade: validade
                    }
                ])
                .select();

            if (error) {
                throw new Error(error.message);
            }

            if (data && data.length > 0) {
                this.produtos.push(data[0]);
                return true;
            }

            throw new Error('Nenhum dado retornado');

        } catch (erro) {
            console.error("Erro ao adicionar produto:", erro);
            return false;
        }
    }



    async removerProduto(id){
        const {data, error} = await supabase.from("produtos").delete().eq("id", id);

        if(error){
            console.error("Erro ao remover produto:", error);
            return false;
        }

        this.produtos = this.produtos.filter(produto => produto.id !== id);
        return true;
    }

async listarProdutos(){
    const { data, error } = await supabase
        .from('produtos')
        .select('*');

    if(error){
        console.error("Erro ao listar produtos:", error);
        return [];
    }

    this.produtos = data.map(produtoData => Produto.fromSupabase(produtoData));

    return this.produtos;
}



}