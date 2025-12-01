import ProdutoService from "../service/produtoService.js";
import { validarCampos } from "../utils/validar.js";

const produtoService = new ProdutoService();

class ProdutoController {
  async adicionar(req, res) {
    try {
      const { nome, preco, quantidade, validade } = req.body;

      validarCampos(nome, preco, quantidade, validade);

      await produtoService.adicionarProduto(nome, preco, quantidade, validade);

      return res.sendStatus(201);
    } catch (error) {
      if (error.message.includes("numeric field overflow")) {
        return res
          .status(401)
          .json({ details: "Quantidade ou preço inválido" });
      }
      if (error.message.includes("Campos inválidos")) {
        return res.status(401).json({ details: error.message });
      }
      if (
        error.message.includes("Este produto atualmente ja esta cadastrado")
      ) {
        return res
          .status(409)
          .json({ details: "Este produto atualmente ja esta cadastrado" });
      }
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

      const resultado = await produtoService.listarProdutos(pagina, limite);

      res.status(200).json({
        produtos: resultado.produtos,
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
      const { id, nome, preco, quantidade, validade } = req.body;
      const validacao = validarCampos(nome, preco, quantidade, validade);

      if (!validacao.sucesso) {
        return res.status(400).json({ details: validacao.error });
      }

      const dadosAtualizados = {
        nome: nome,
        preco: preco,
        quantidade: quantidade,
        validade: validade,
      };

      await produtoService.editarProduto(id, dadosAtualizados);

      return res.sendStatus(200);
    } catch (error) {
      if (error.message.includes("numeric field overflow")) {
        return res.status(401).json({
          details: "Quantidade de caracteres invalida.",
        });
      }

      if (error.message.includes("Campos inválidos")) {
        return res.status(401).json({ details: error.message });
      }
      console.error(error);
      return res.status(500).json({
        details: "erro no servidor",
      });
    }
  }

  async excluir(req, res) {
    try {
      const produtoId = req.params.id;

      await produtoService.removerProduto(produtoId);

      return res.sendStatus(204);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        details: "erro no servidor",
      });
    }
  }

  async venda(req, res) {
    const token = req.cookies.authToken;
    const { produtoId, quantidade } = req.body;

    console.log(`
      token: ${token}
      produtoId : ${produtoId}
      quantidade: ${quantidade}
      
      `);

    if (!token || !produtoId || !quantidade || quantidade <= 0) {
      return res.status(400).json({
        details:
          "Dados de requisição inválidos (token, ID do produto ou quantidade faltando/inválida).",
      });
    }

    try {
      await produtoService.registrarVenda(produtoId, quantidade, token);

      return res.sendStatus(200);
    } catch (error) {
      console.error("Erro no registro de venda:", error.message);

      if (error.message.includes("Produto não foi encontrado")) {
        return res.status(404).json({
          details: "Produto não encontrado.",
        });
      }

      if (error.message.includes("Estoque insuficiente")) {
        return res.status(409).json({
          details:
            "Estoque insuficiente. A quantidade solicitada não está disponível.",
        });
      }

      if (
        error.message.includes("JWT") ||
        error.message.includes("invalid claim")
      ) {
        return res.status(401).json({
          details:
            "Token de autenticação inválido ou expirado. Faça login novamente.",
        });
      }

      return res.status(500).json({
        details: error.message,
      });
    }
  }
}

export default ProdutoController;
