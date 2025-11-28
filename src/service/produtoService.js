import { Produto } from "../produto.js";
import supabase from "../config.js";

class ProdutoService {
  async verificarProdutoExiste(nome) {
    const { data, error } = await supabase
      .from("produtos")
      .select("id")
      .eq("nome", nome);

    if (error) {
      throw new Error(`Erro ao verificar produto: ${error.message}`);
    }

    if (data && data.length > 0) return true;

    return false;
  }

  async adicionarProduto(nome, preco, quantidade, validade) {
    let produtoExiste = await this.verificarProdutoExiste(nome);

    if (produtoExiste)
      throw new Error("Este produto atualmente ja esta cadastrado.");

    const { data, error } = await supabase
      .from("produtos")
      .insert([
        {
          nome: nome,
          preco: preco,
          quantidade: quantidade,
          validade: validade,
        },
      ])
      .select();

    if (error) throw new Error(error.message);

    return true;
  }

  async listarProdutos() {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar produtos: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      const produtosMapeados = data.map((produtoData) =>
        Produto.fromSupabase(produtoData)
      );

      this.produtos = produtosMapeados;
      return this.produtos;
    } catch (erro) {
      console.error("Erro ao listar produtos:", erro);
      throw erro;
    }
  }
}

export default ProdutoService;
