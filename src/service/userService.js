import supabase from "../config.js";

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
}

export default UserService;
