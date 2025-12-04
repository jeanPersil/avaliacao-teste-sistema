import supabase from "../config.js";

class AuthMiddleware {
  async verificar_autenticacao(req, res, next) {
    const token = req.cookies.authToken;

    if (!token) {
      res.clearCookie("authToken");
      return res.redirect("/");
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "Token inválido ou expirado." });
    }

    req.user = user;
    next();
  }

  async verificarAdmin(req, res, next) {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from("usuarios")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) throw new Error(error.message);

    if (data.role !== "admin") {
      return res.redirect("/");
    }
    next();
  }
}

export default new AuthMiddleware();
