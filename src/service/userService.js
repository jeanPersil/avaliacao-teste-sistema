import supabase from "../config.js";
import { formatarData } from "../utils/validar.js";

class UserService {
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

      const usuariosFormatados = data.map((usuario) => ({
        ...usuario,
        created_at: formatarData(usuario.created_at),
      }));

      const totalPaginas = Math.ceil(count / limite);

      return {
        usuarios: usuariosFormatados,
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
}

export default UserService;
