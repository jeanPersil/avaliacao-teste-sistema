import FeedbackServices from "../service/feedbackServices.js";

const feedbackService = new FeedbackServices();

class FeedbackController {
  async adicionar(req, res) {
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

      if (mensagem.length > 150) {
        return res.status(401).json({
          details: "Quantidade maxima de caracteres permitida: 150",
        });
      }

      if (mensagem.length < 10 || !mensagem) {
        return res.status(401).json({
          details:
            "A sua mensagem esta curta demais. Por favor, descreva melhor o que deseja relatar.",
        });
      }

      await feedbackService.feedbackUsuario(token, tipo, mensagem);

      return res.sendStatus(200);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        details: "erro no servidor",
      });
    }
  }

  async listar(req, res) {
    try {
      const pagina = parseInt(req.query.pagina) || 1;
      const limite = parseInt(req.query.limite) || 10;

      if (pagina < 1) {
        return res.status(400).json({
          details: "O parâmetro 'pagina' deve ser maior que 0",
        });
      }

      if (limite < 1 || limite > 100) {
        return res.status(400).json({
          details: "O parâmetro 'limite' deve estar entre 1 e 100",
        });
      }

      const resultado = await feedbackService.listarFeedbacks(pagina, limite);

      res.status(200).json({
        feedbacks: resultado.feedbacks,
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

  async editar(req, res) {
    try {
      const { status, id } = req.body;

      await feedbackService.editarFeedback(status, id);

      return res.sendStatus(200);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        details: "erro no servidor",
      });
    }
  }

  async excluir(req, res) {
    try {
      const feedbackId = req.params.id;

      await feedbackService.removerFeedback(feedbackId);

      return res.sendStatus(204);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        details: "erro no servidor",
      });
    }
  }
}

export default FeedbackController;
