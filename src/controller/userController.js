import UserService from "../service/userService.js";
import {
  validarEmail,
  validarNumero,
  validarSenha,
  validarNomeCompleto,
} from "../utils/validar.js";

const userService = new UserService();

class UserController {
  async cadastrar(req, res) {
    try {
      const { email, senha, nome, telefone } = req.body;

      if (!email || !senha || !nome || !telefone) {
        return res.status(401).json({
          details: "Campos obrigatorios faltando",
        });
      }

      validarEmail(email);

      validarSenha(senha);

      validarNumero(telefone);

      validarNomeCompleto(nome);

      await userService.cadastrarUsuario(email, senha, nome, telefone, "comum");

      return res.sendStatus(200);
    } catch (error) {
      if (error.message.includes("Nome inválido")) {
        return res.status(401).json({
          details: "Nome Completo invalido",
        });
      }
      if (error.message.includes("Senha invalida")) {
        return res.status(401).json({
          details: error.message,
        });
      }

      if (error.message.includes("Email inválido")) {
        return res.status(401).json({
          details: error.message,
        });
      }
      if (error.message.includes("Número inválido")) {
        return res.status(401).json({
          details: error.message,
        });
      }
      if (error.message.includes("User already registered")) {
        return res.status(401).json({
          details: "Ja existe uma conta cadastrada com este email",
        });
      }
      console.error(error);
      return res.status(500).json({
        details: "erro no servidor",
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email.trim() || !password.trim()) {
        return res.status(400).json({
          details: "Email e senha devem ser preenchidos.",
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
        details: "erro no servidor",
      });
    }
  }

  async listarUsuarios(req, res) {
    try {
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 10;

      if (pagina < 1 || limite < 1 || limite > 100) {
        return res.status(400).json({
          details: "Parâmetros de paginação inválidos",
        });
      }

      const resultado = await userService.listarUsuarios(pagina, limite);

      res.status(200).json({
        usuarios: resultado.usuarios,
        paginacao: {
          paginaAtual: resultado.paginaAtual,
          totalItens: resultado.total,
          totalPaginas: resultado.totalPaginas,
          limitePorPagina: resultado.limite,
          hasProxima: resultado.paginaAtual < resultado.totalPaginas,
          hasAnterior: resultado.paginaAtual > 1,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        details: "erro no servidor",
      });
    }
  }

  async excluir(req, res) {
    try {
      const usuarioId = req.params.id;

      await userService.excluirUsuario(usuarioId);

      return res.sendStatus(200);
    } catch (error) {
      if (error.message.includes("user é admin")) {
        return res.status(401).json({
          details: "Não é possivel excluir o administrador do sistema",
        });
      }
      console.error(error);
      return res.status(500).json({
        details: "erro no servidor",
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

      return res.redirect("/");
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        details: "erro no servidor",
      });
    }
  }

  async feedback(req, res) {
    try {
      const token = req.cookies.authToken;
      const { tipo, mensagem } = req.body;
      const tiposValidos = ["bug", "melhoria"];

      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({
          details: `Tipo inválido. Opções permitidas: ${tiposValidos.join(
            ", "
          )}`,
        });
      }

      if (mensagem.lenght > 150) {
        return res.status(401).json({
          details: "Quantidade de caracteres invalida",
        });
      }

      if (mensagem.lenght < 10 || !mensagem) {
        return res.status(401).json({
          details:
            "A sua mensagem esta curta demais. Por favor, descreva melhor o que deseja relatar.",
        });
      }

      await userService.feedbackUsuario(token, tipo, mensagem);

      return res.sendStatus(200);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        details: "erro no servidor",
      });
    }
  }
}

export default UserController;
