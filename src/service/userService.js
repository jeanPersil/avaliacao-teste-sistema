import supabase from "../config.js";

class UserService {
  async cadastrarUsuario(email, senha, nome, telefone, role) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: senha,
      options: {
        emailRedirectTo: "https://cityshop-iota.vercel.app/",
        data: {
          nome_completo: nome,
          telefone: telefone,
          role: role,
        },
      },
    });

    if (authError) throw new Error(authError.message);

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

    if (userError) throw new Error("Erro ao recuperar perfil do usuário.");

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
        .from("view_usuarios_admin")
        .select("*", { count: "exact" })

        .not("email_confirmed_at", "is", null)
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

    if (data && data.role === "admin") {
      throw new Error("Não é permitido excluir um administrador.");
    }

    const { error: authError } = await supabase.auth.admin.deleteUser(id);

    if (authError) throw new Error(authError.message);

    return true;
  }
}

export default UserService;
