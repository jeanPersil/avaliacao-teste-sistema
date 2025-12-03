import supabase from "../config.js";

class UserService {
  async cadastrarUsuario(email, senha, nome, telefone, role) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: senha,
    });

    if (authError) throw new Error(authError.message);

    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .insert([
        {
          id: authData.user.id,
          nome_completo: nome,
          telefone: telefone,
          email: email,
          role: role,
        },
      ])
      .select();

    if (userError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(userError.message);
    }

    return true;
  }
  async logarUsuario(email, password) {
    const { data: login, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    const { data: userData, error: userError } = await supabase
      .from("usuarios")
      .select("role")
      .eq("id", login.user.id)
      .single();

    if (userError) throw new Error(userError.message);

    const roleDoUsuario = userData.role;

    const pagina = roleDoUsuario === "admin" ? "/painelAdmin" : "/produtos";

    return {
      session: login.session,
      pagina,
    };
  }

  async listarUsuarios(pagina = 1, limite = 10) {
    try {
      const inicio = (pagina - 1) * limite;
      const fim = inicio + limite - 1;

      const { data, error, count } = await supabase
        .from("usuarios")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(inicio, fim);

      if (error) {
        throw new Error(`Erro ao buscar usuários: ${error.message}`);
      }

      if (!data) {
        return {
          usuarios: [],
          total: 0,
          totalPaginas: 0,
          paginaAtual: pagina,
          limite: limite,
        };
      }

      const totalPaginas = Math.ceil(count / limite);

      return {
        usuarios: data,
        total: count,
        totalPaginas: totalPaginas,
        paginaAtual: pagina,
        limite: limite,
      };
    } catch (erro) {
      console.error("Erro ao listar usuários:", erro);
      throw erro;
    }
  }

  async excluirUsuario(id) {
    const { data, error } = await supabase
      .from("usuarios")
      .select("role")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);

    if (data) {
      if (data.role === "admin") {
        throw new Error("user é admin");
      }

      const { error: userError } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", id);

      if (userError)
        throw new Error(
          "Erro ao apagar dados (verifique vínculos): " + userError.message
        );
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) throw new Error(authError.message);

    return true;
  }

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
}

export default UserService;
