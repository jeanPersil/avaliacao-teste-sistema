import ProdutoService from "../service/produtoService.js";
import { validarCampos } from "../utils/validar.js";

const produtoService = new ProdutoService();

class ProdutoController {
  async adicionarProduto(req, res) {
    try {
      const { nome, preco, quantidade, validade } = req.body;

      const validacao = validarCampos(nome, preco, quantidade, validade);

      if (!validacao.sucesso) {
        return res.status(400).json({ details: validacao.error });
      }

      await produtoService.adicionarProduto(nome, preco, quantidade, validade);

      return res.sendStatus(201);
    } catch (error) {
      if (
        error.message.includes("Este produto atualmente ja esta cadastrado")
      ) {
        return res
          .status(409)
          .json({ details: "Este produto atualmente ja esta cadastrado" });
      }
      console.error(error);
      return res.status(500).json({
        detail: "erro no servidor",
      });
    }
  }

  async listarProdutos(req, res) {
    try {
      const listaDeProdutos = await produtoService.listarProdutos();

      res.status(200).json({
        produtos: listaDeProdutos,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        detail: "erro no servidor",
      });
    }
  }
}

export default ProdutoController;
