import { editarProduto } from "./api.js"; // Navegadores precisam do .js no final

const modal = document.getElementById("modalEdicao");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.querySelector(".btn-cancelar");

function abrirModalEdicao(produto) {
  document.getElementById("editId").value = produto.id;

  document.getElementById("editNome").value = produto.nome || "";
  document.getElementById("editPreco").value = produto.preco || "";
  document.getElementById("editQuantidade").value = produto.quantidade || "";

  // Preenche Data
  const inputValidade = document.getElementById("editValidade");
  inputValidade.value = "";

  if (produto.validade) {
    const dataObj = new Date(produto.validade);

    if (!isNaN(dataObj.getTime())) {
      try {
        const dataFormatada = dataObj.toISOString().split("T")[0];
        inputValidade.value = dataFormatada;
      } catch (error) {
        console.error("Erro ao formatar data:", produto.validade);
      }
    } else {
      console.warn("Formato de data desconhecido recebido:", produto.validade);
    }
  }

  modal.style.display = "flex";
}

function fecharModal() {
  modal.style.display = "none";
}

if (closeBtn) {
  closeBtn.addEventListener("click", fecharModal);
}

if (cancelBtn) {
  cancelBtn.addEventListener("click", fecharModal);
}

if (modal) {
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      fecharModal();
    }
  });
}

const formEdicao = document.getElementById("formEdicao");

if (formEdicao) {
  formEdicao.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editId").value;
    const nome = document.getElementById("editNome").value;
    const preco = parseFloat(document.getElementById("editPreco").value);
    const quantidade = parseInt(
      document.getElementById("editQuantidade").value
    );
    const validade = document.getElementById("editValidade").value;

    const btnSalvar = formEdicao.querySelector('button[type="submit"]');
    const textoOriginal = btnSalvar.innerText;
    btnSalvar.disabled = true;
    btnSalvar.innerText = "Salvando...";

    const res = await editarProduto(id, nome, preco, quantidade, validade);

    btnSalvar.disabled = false;
    btnSalvar.innerText = textoOriginal;

    if (res.success) {
      alert("Produto editado com sucesso!");
      fecharModal();
      window.location.reload();
    } else {
      alert("Erro: " + (res.error || "Erro desconhecido ao editar."));
    }
  });
}

export { abrirModalEdicao, fecharModal };
