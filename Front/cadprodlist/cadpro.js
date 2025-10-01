import { Estoque } from "../../back/services/estoque.js";

const estoque = new Estoque();

async function cadastrarProduto(produto) {
  try {
    console.log("Dados do produto:", produto); // Debug

    let res = await estoque.adicionarProduto(
      produto.nome,
      produto.preco,
      produto.quantidade,
      produto.validade
    );

    console.log("Resposta do backend:", res);

    if (!res.sucesso) {
      return alert(`Erro ao cadastrar produto: ${res.mensagem}`);
    }

    const mensagem = document.getElementById("mensagem");
    mensagem.textContent = `Produto "${produto.nome}" cadastrado com sucesso!`;
    mensagem.style.display = "block";
    mensagem.className = "mt-3 alert alert-success";

    document.getElementById("formProduto").reset();

    setTimeout(() => {
      window.location.href = "./listprod.html";
    }, 1500);
  } catch (erro) {
    console.error("Erro no cadastro:", erro);
    alert(`Erro inesperado: ${erro.message}`);
  }
}

document.getElementById("formProduto").addEventListener("submit", function (e) {
  e.preventDefault();

  const produto = {
    nome: document.getElementById("nome").value.trim(),
    preco: parseFloat(document.getElementById("preco").value),
    quantidade: parseInt(document.getElementById("quantidade").value),
    validade: document.getElementById("validade").value,
  };

  cadastrarProduto(produto);
});
