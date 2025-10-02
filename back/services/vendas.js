import { supabase } from "../../banco/supabaseConfig.js";
import { Estoque } from "./estoque.js";

export class Vendas {
  constructor() {
    this.estoqueService = new Estoque();
  }

  async registrarVenda(produtoId, quantidade, clienteId = null) {
    try {
      const produtos = await this.estoqueService.listarProdutos();
      const produto = produtos.find(p => p.id == produtoId);

      if (!produto) {
        return { sucesso: false, mensagem: "Produto não encontrado." };
      }
      if (produto.quantidade < quantidade) {
        return { sucesso: false, mensagem: "Estoque insuficiente." };
      }

      const { error: vendaErro } = await supabase
        .from("vendas")
        .insert([
          {
            cliente_id: clienteId,
            produto_id: produto.id,
            quantidade,
            total: produto.preco * quantidade,
            data_venda: new Date().toISOString(),
          }
        ]);

      if (vendaErro) {
        return { sucesso: false, mensagem: "Não foi possível registrar a venda." };
      }

      return { sucesso: true, mensagem: "O produto foi vendido com sucesso!" };
    } catch {
      return { sucesso: false, mensagem: "Não foi possível concluir a venda." };
    }
  }
}
