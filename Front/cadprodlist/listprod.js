import { Estoque } from "../../back/services/estoque.js";

const tabelaProdutos = document.getElementById("tabelaProdutos");
const botaoAdicionar = document.getElementById("adicionarProduto");
const estoque = new Estoque();

async function obterProdutos() {
  tabelaProdutos.innerHTML = "";

  let produtos = await estoque.listarProdutos();

  produtos.forEach((produto) => {
    const linha = document.createElement("tr");
    const dataValidade = new Date(produto.validade).toLocaleDateString("pt-BR");

    linha.innerHTML = `
            <td>${produto.id}</td>
            <td>${produto.nome}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>${produto.quantidade}</td>
            <td>${dataValidade}</td>
            <td>
            <button class="btn btn-danger btn-sm btn-remover" data-id="${
              produto.id
            }"> 
                Remover 
            </button>
        </td>
        `;
    tabelaProdutos.appendChild(linha);
  });
}

async function removerProduto(id) {
  try {
    let resultado = await estoque.removerProduto(id);

    if (!resultado.sucesso) {
      alert(`Erro ao remover produto: ${resultado.mensagem}`);
      return;
    }

    alert(resultado.mensagem || "Produto removido com sucesso!");
    await obterProdutos();
  } catch (erro) {
    console.error("Erro ao remover produto:", erro);
    alert("Erro inesperado ao remover produto.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await obterProdutos();

  tabelaProdutos.addEventListener("click", async (e) => {
    const botaoRemover = e.target.closest(".btn-remover");

    if (botaoRemover) {
      const produto_id = botaoRemover.dataset.id;
      await removerProduto(produto_id);
    }
  });

  botaoAdicionar.addEventListener("click", () => {
    window.location.href = "./cadprod.html";
  });
});
