import { Produto } from "../model/produto.js";
import { supabase } from "../../banco/supabaseConfig.js";
import { validarCampos } from "../utils/validar.js";

export class Estoque {
  constructor() {
    this.produtos = [];
  }

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
    try {
      let validar = validarCampos(nome, preco, quantidade, validade);

      if (!validar.sucesso) {
        return { sucesso: false, mensagem: validar.error };
      }

      let produtoExiste = await this.verificarProdutoExiste(nome);
      
      if (produtoExiste) {
        return { sucesso: false, mensagem: "Este produto ja esta cadastrado." };
      }

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

      if (error) {
        return {
          sucesso: false,
          mensagem: `Erro ao adicionar produto: ${error.message}`,
        };
      }

      if (!data || data.length === 0) {
        return {
          sucesso: false,
          mensagem: "Nenhum dado foi retornado após inserção",
        };
      }

      return { sucesso: true, mensagem: "Produto adicionado com sucesso!" };
    } catch (erro) {
      console.error("Erro ao adicionar produto:", erro);
      return { sucesso: false, mensagem: erro.message || erro };
    }
  }

  async listarProdutos() {
    try {
      const { data, error } = await supabase.from("produtos").select("*");

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

  async editarProduto(id, nome, preco, quantidade, validade) {
    let validar = validarCampos(nome, preco, quantidade, validade);

    if (!validar.sucesso) {
      return { sucesso: false, mensagem: validar.error };
    }

    try {
      const dadosAtualizados = {
        nome: nome,
        preco: preco,
        quantidade: quantidade,
        validade: validade,
      };

      const { data, error } = await supabase
        .from("produtos")
        .update(dadosAtualizados)
        .eq("id", id)
        .select();

      if (error) {
        throw new Error(`Erro ao editar produto: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return {
          sucesso: false,
          mensagem: "Produto não encontrado ou nenhum campo alterado.",
        };
      }

      return { sucesso: true };
    } catch (erro) {
      console.error("Erro ao editar produto:", erro);
      return { sucesso: false, mensagem: "Erro inesperado ao editar produto." };
    }
  }

  async removerProduto(id) {
    try {
      if (!id) {
        return { sucesso: false, mensagem: "ID do produto é obrigatório" };
      }

      const { data, error } = await supabase
        .from("produtos")
        .delete()
        .eq("id", id)
        .select();

      if (error) {
        throw new Error(`Erro ao remover produto: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return { sucesso: false, mensagem: "Produto não encontrado" };
      }

      return { sucesso: true, mensagem: "Produto removido com sucesso" };
    } catch (erro) {
      console.error("Erro ao remover produto:", erro);
      return { sucesso: false, mensagem: erro.message };
    }
  }
}
