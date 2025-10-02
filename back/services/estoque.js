import { Produto } from "../model/produto.js";
import { supabase } from "../../banco/supabaseConfig.js";

export class Estoque {
  constructor() {
    this.produtos = [];
  }

  async listarProdutos() {
    const { data, error } = await supabase.from("produtos").select("*");
    if (error) {
      console.error("Erro listar produtos:", error);
      throw new Error(error.message);
    }
    const produtosMapeados = data.map((p) => Produto.fromSupabase(p));
    this.produtos = produtosMapeados;
    return this.produtos;
  }

  async atualizarQuantidade(id, quantidadeVendida) {
    try {
      const pid = parseInt(id, 10);
      console.log("➡ RPC diminuir_estoque chamada | id:", pid, "qtd vendida:", quantidadeVendida);

      const { data, error } = await supabase.rpc("diminuir_estoque", {
        pid: pid,
        qtd: quantidadeVendida,
      });

      if (error) {
        console.error("Erro na RPC diminuir_estoque:", error);
        return { sucesso: false, mensagem: error.message };
      }

      console.log("RPC executar com sucesso, data:", data);
      return { sucesso: true };
    } catch (err) {
      console.error("Erro ao chamar RPC:", err);
      return { sucesso: false, mensagem: err.message };
    }
  }
}
