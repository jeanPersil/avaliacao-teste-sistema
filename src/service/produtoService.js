import { Produto } from "../produto.js";
import supabase from "../config.js";

class ProdutoService {
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

  async listarProdutos(pagina, limite) {
    try {
      const inicio = (pagina - 1) * limite;
      const fim = inicio + limite - 1;

      const { data, error, count } = await supabase
        .from("produtos")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(inicio, fim);

      if (error) {
        throw new Error(`Erro ao buscar produtos: ${error.message}`);
      }

      if (!data) {
        return {
          produtos: [],
          total: 0,
          totalPaginas: 0,
          paginaAtual: pagina,
          limite: limite,
        };
      }

      const produtosMapeados = data.map((produtoData) => {
        const produto = Produto.fromSupabase(produtoData);

        return produto;
      });

      const totalPaginas = Math.ceil(count / limite);

      this.produtos = produtosMapeados;

      return {
        produtos: this.produtos,
        total: count,
        totalPaginas: totalPaginas,
        paginaAtual: pagina,
        limite: limite,
      };
    } catch (erro) {
      console.error("Erro ao listar produtos:", erro);
      throw erro;
    }
  }

  async editarProduto(id, dados) {
    const { data, error } = await supabase
      .from("produtos")
      .update(dados)
      .eq("id", id)
      .select();

    if (error) {
      throw new Error(`Erro ao editar produto: ${error.message}`);
    }

    return { sucesso: true };
  }

  async removerProduto(id) {
    const { data: produto } = await supabase
      .from("produtos")
      .select("id")
      .eq("id", id)
      .single();

    if (!produto) {
      return false;
    }

    const { error } = await supabase.from("produtos").delete().eq("id", id);

    if (error) {
      console.error("Erro ao remover produto:", error);
      return false;
    }
    return true;
  }

  async registrarVenda(produtoId, quantidade, token) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error) throw new Error(error.message);

    const produto = await this.buscarProdutoPorId(produtoId);

    if (!produto) throw new Error("Produto não foi encontrado");

    if (produto.quantidade < quantidade)
      throw new Error("Estoque insuficiente.");

    const { error: vendaErro } = await supabase.from("compras").insert([
      {
        cliente_id: user.id,
        produto_id: produtoId,
        quantidade,
        total: produto.preco * quantidade,
      },
    ]);

    if (vendaErro) {
      return {
        sucesso: false,
        mensagem: `Falha ao registrar venda: ${vendaErro.message}`,
      };
    }

    return {
      sucesso: true,
      mensagem: "Venda registrada com sucesso.",
    };
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

  async buscarProdutoPorId(produtoId) {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("id", produtoId)
      .single();

    if (error) throw error;
    return data;
  }
}

export default ProdutoService;
