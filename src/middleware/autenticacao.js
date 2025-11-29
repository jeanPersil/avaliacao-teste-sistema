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
}

export default new AuthMiddleware();
