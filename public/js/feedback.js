import {
  abrirModalReportFeedback,
  fecharModalReportFeedback,
  abrirModalEditarFeedback,
} from "./modal.js";

import { formatarData } from "./utils.js";
import {
  enviarFeedback,
  listarFeedbacks,
  editarFeedback,
  excluirFeedback,
} from "./api.js";

let paginaAtual = 1;
const limitePorPagina = 4;
let totalPaginas = 1;

const botaoFeedback = document.getElementById("reportarFeedback");

botaoFeedback.addEventListener("click", (e) => {
  e.preventDefault();

  abrirModalReportFeedback();

  const form = document.getElementById("form-feedback");
  const botaofechar = document.getElementById("fecharFeedback");

  botaofechar.addEventListener("click", (evt) => {
    evt.preventDefault();
    fecharModalReportFeedback();
  });

  form.addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const tipo = document.getElementById("novo-tipo").value;
    const mensagem = document.getElementById("nova-mensagem").value;

    console.log("Enviando...", tipo, mensagem);

    const res = await enviarFeedback(tipo, mensagem);

    if (res.error) {
      alert(res.error);
      return;
    }

    alert("Feedback enviado com sucesso!");
    fecharModalReportFeedback();

    carregarFeedbacks(1);
  });
});

export function renderizarFeedbacks(listaFeedbacks) {
  const container = document.querySelector(".lista-cards");

  if (!container) return;
  container.innerHTML = "";

  if (!listaFeedbacks || listaFeedbacks.length === 0) {
    container.innerHTML = "<p>Nenhum feedback encontrado.</p>";
    return;
  }

  listaFeedbacks.forEach((feedback) => {
    const tipoClass = feedback.tipo ? feedback.tipo.toLowerCase() : "geral";
    const statusClass = feedback.status
      ? feedback.status.toLowerCase()
      : "pendente";
    const nomeUsuario = feedback.nome_usuario || "Usuário Desconhecido";

    const divCard = document.createElement("div");
    divCard.className = "feedback-card";
    divCard.id = `feedback-${feedback.id}`;

    divCard.innerHTML = `
        <div class="feedback-header">
          <span class="feedback-tipo ${tipoClass}">${feedback.tipo}</span>
          <span class="feedback-status ${statusClass}">${feedback.status}</span>
        </div>
        <p class="feedback-mensagem">${feedback.mensagem}</p>
        <div class="feedback-footer">
          <span class="feedback-usuario">Usuário: ${nomeUsuario}</span>
          <span class="feedback-data">${formatarData(feedback.data)}</span>
        </div>
    `;

    divCard.addEventListener("click", () => {
      configurarModalEdicao(feedback);
    });

    container.appendChild(divCard);
  });
}

function configurarModalEdicao(feedback) {
  abrirModalEditarFeedback(feedback);

  const form = document.getElementById("form-editar-feedback");
  const btnFechar = document.getElementById("fecharEdicao");
  const btnExcluir = document.getElementById("btnExcluirFeedback");

  btnFechar.addEventListener("click", () => {
    fecharModalReportFeedback();
  });

  btnExcluir.addEventListener("click", async (e) => {
    if (confirm("Tem certeza que deseja excluir este feedback?")) {
      const res = await excluirFeedback(feedback.id);

      if (res.error) {
        alert(res.error);
        return;
      }

      alert("Feedback excluido com sucesso!");
      window.location.reload();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const novoStatus = document.getElementById("edit-status").value;

    if (novoStatus === feedback.status) {
      fecharModalReportFeedback();
      return;
    }

    const res = await editarFeedback(novoStatus, feedback.id);

    if (res.error) {
      alert("Erro ao atualizar: " + res.error);
    } else {
      alert("Status atualizado com sucesso!");
      fecharModalReportFeedback();
      window.location.reload();
    }
  });
}

function atualizarPaginacao(paginacao) {
  const navPaginacao = document.getElementById("paginacao-lista");

  if (!navPaginacao || !paginacao) return;

  paginaAtual = paginacao.paginaAtual;
  totalPaginas = paginacao.totalPaginas;

  navPaginacao.innerHTML = "";

  const liAnterior = document.createElement("li");
  liAnterior.innerHTML = `
    <a href="#" class="${paginaAtual === 1 ? "disabled" : ""}" data-pagina="${
    paginaAtual - 1
  }">
      Anterior
    </a>
  `;
  navPaginacao.appendChild(liAnterior);

  const maxBotoes = 5;
  let inicio = Math.max(1, paginaAtual - Math.floor(maxBotoes / 2));
  let fim = Math.min(totalPaginas, inicio + maxBotoes - 1);

  if (fim - inicio + 1 < maxBotoes) {
    inicio = Math.max(1, fim - maxBotoes + 1);
  }

  for (let i = inicio; i <= fim; i++) {
    const li = document.createElement("li");
    li.innerHTML = `
      <a href="#" class="${
        i === paginaAtual ? "active" : ""
      }" data-pagina="${i}">
        ${i}
      </a>
    `;
    navPaginacao.appendChild(li);
  }

  const liProximo = document.createElement("li");
  liProximo.innerHTML = `
    <a href="#" class="${
      paginaAtual === totalPaginas ? "disabled" : ""
    }" data-pagina="${paginaAtual + 1}">
      Próximo
    </a>
  `;
  navPaginacao.appendChild(liProximo);

  adicionarEventosPaginacao();
}

function adicionarEventosPaginacao() {
  const links = document.querySelectorAll("#paginacao-lista a[data-pagina]");

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      if (this.classList.contains("disabled")) return;

      const novaPagina = parseInt(this.getAttribute("data-pagina"));
      carregarFeedbacks(novaPagina);
    });
  });
}

async function carregarFeedbacks(pagina = 1) {
  try {
    console.log(`Carregando feedbacks página ${pagina}...`);

    const response = await listarFeedbacks(pagina, limitePorPagina);

    if (response.error) {
      console.error("Erro ao buscar dados:", response.error);
      renderizarFeedbacks([]);
      return;
    }

    const lista = response.feedbacks || response.data || [];
    renderizarFeedbacks(lista);

    if (response.paginacao) {
      atualizarPaginacao(response.paginacao);
    }
  } catch (error) {
    console.error("Erro crítico ao carregar dashboard:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarFeedbacks(1);
});
