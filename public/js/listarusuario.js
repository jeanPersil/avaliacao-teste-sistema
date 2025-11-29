import { listar_usuarios, excluirUsuario } from "./api.js";
import { formatarData } from "./utils.js";

const tabela = document.getElementById("tabelaDeUsuarios");

let paginaAtual = 1;
const limitePorPagina = 6;
let totalPaginas = 1;
let listaUsuario = [];

function exibirUsuarios(usuarios) {
  if (!tabela) {
    console.error("Elemento #tabelaDeUsuarios não encontrado!");
    return;
  }

  tabela.innerHTML = "";

  if (!usuarios || usuarios.length === 0) {
    tabela.innerHTML = `<tr><td colspan="5">Nenhum usuário encontrado</td></tr>`;
    return;
  }

  usuarios.forEach((usuario) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${usuario.nome_completo}</td>
      <td>${usuario.email}</td>
      <td>${usuario.role}</td>
      <td>${formatarData(usuario.created_at) || "N/A"}</td>
      <td>
        <button class="btn-acao btn-deletar"  data-id="${
          usuario.id
        }">Excluir</button>
      </td>
    `;
    tabela.appendChild(tr);
  });
}

tabela.addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-deletar")) {
    const usuarioId = e.target.getAttribute("data-id");

    if (!confirm("Tem certeza que deseja excluir este usuario?")) {
      return;
    }

    const res = await excluirUsuario(usuarioId);

    if (res.error) {
      alert(res.error);
      return;
    }

    alert("Usuario excluido com sucesso!");
    window.location.reload();
  }
});

function atualizarPaginacao(paginacao) {
  const navPaginacao = document.getElementById("paginacao-lista"); // ✅ ID CORRETO

  if (!navPaginacao || !paginacao) return;

  paginaAtual = paginacao.paginaAtual;
  totalPaginas = paginacao.totalPaginas;

  navPaginacao.innerHTML = "";

  // Botão Anterior
  const liAnterior = document.createElement("li");
  liAnterior.innerHTML = `
    <a href="#" class="${paginaAtual === 1 ? "disabled" : ""}" data-pagina="${
    paginaAtual - 1
  }">
      Anterior
    </a>
  `;
  navPaginacao.appendChild(liAnterior);

  // Números das páginas
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

  // Botão Próximo
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
  const links = document.querySelectorAll("#paginacao-lista a[data-pagina]"); // ✅ SELETOR CORRETO

  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      if (this.classList.contains("disabled")) return;

      const novaPagina = parseInt(this.getAttribute("data-pagina"));
      carregarUsuarios(novaPagina, limitePorPagina);
    });
  });
}

async function carregarUsuarios(pagina = 1, limite = 7) {
  try {
    console.log(`Carregando página ${pagina}...`);

    listaUsuario = await listar_usuarios(pagina, limite);

    if (listaUsuario.error) {
      console.error("Erro:", listaUsuario.error);
      exibirUsuarios([]);
      return;
    }

    console.log("Usuários carregados:", listaUsuario.usuarios);
    console.log("Dados paginação:", listaUsuario.paginacao);

    exibirUsuarios(listaUsuario.usuarios);
    atualizarPaginacao(listaUsuario.paginacao);
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
    exibirUsuarios([]);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  carregarUsuarios(1, limitePorPagina);
});
