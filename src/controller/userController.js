import UserService from "../service/userService.js";

const userService = new UserService();

class UserController {
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email.trim() || !password.trim()) {
        return res.status(400).json({
          detail: "Email e senha devem ser preenchidos.",
        });
      }

      const { session, pagina } = await userService.logarUsuario(
        email,
        password
      );

      res.cookie("authToken", session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
        sameSite: "strict",
      });

      return res.status(200).json({
        redirect: pagina,
      });
    } catch (error) {
      if (error.message.includes("Invalid login credential")) {
        return res
          .status(401)
          .json({ details: "O email ou a senha estão incorretos." });
      }
      console.error(error);
      return res.status(500).json({
        detail: "erro no servidor",
      });
    }
  }

  async logout(req, res) {
    try {
      res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(200).json({
        redirect: "/",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        detail: "erro no servidor",
      });
    }
  }
}

export default UserController;
