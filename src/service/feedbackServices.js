import supabase from "../config.js";

class FeedbackServices {
  async feedbackUsuario(token, tipo, mensagem) {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Token inválido ou expirado." });
    }

    const { error: errorFeedback } = await supabase
      .from("feedbacks")
      .insert([
        {
          usuario_id: user.id,
          tipo: tipo,
          mensagem: mensagem,
        },
      ])
      .select();

    if (errorFeedback) throw new Error(errorFeedback.message);

    return;
  }

  async listarFeedbacks(pagina, limite) {
    try {
      const inicio = (pagina - 1) * limite;
      const fim = inicio + limite - 1;

      const { data, error, count } = await supabase
        .from("feedbacks_resumidos") // View simplificada
        .select("*", { count: "exact" })
        .order("data", { ascending: false })
        .range(inicio, fim);

      if (error) {
        throw new Error(`Erro ao buscar produtos: ${error.message}`);
      }

      if (!data) {
        return {
          feedbacks: [],
          total: 0,
          totalPaginas: 0,
          paginaAtual: pagina,
          limite: limite,
        };
      }

      const totalPaginas = Math.ceil(count / limite);

      return {
        feedbacks: data,
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

  async editarFeedback(status, id) {
    const { error } = await supabase
      .from("feedbacks")
      .update({
        status: status,
      })
      .eq("id", id);

    if (error) throw error;
    return;
  }

  async removerFeedback(id) {
    const { data: produto } = await supabase
      .from("feedbacks")
      .select("id")
      .eq("id", id)
      .single();

    if (!produto) {
      throw new Error("Não existe nenhum feedback com este nome.");
    }

    const { error } = await supabase.from("feedbacks").delete().eq("id", id);

    if (error) {
      console.error("Erro ao remover produto:", error);
      throw new Error(error.message);
    }
    return;
  }
}

export default FeedbackServices;
