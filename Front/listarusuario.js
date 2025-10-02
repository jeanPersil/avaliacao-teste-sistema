import { Usuario } from "../back/services/usuario.js";

class ListagemUsuarios {
  constructor() {
    this.usuarioService = new Usuario();
    this.init();
  }

  init() {
    this.carregarUsuarios();
    this.configurarEventos();
  }

  configurarEventos() {
    document.getElementById("atualizarLista").addEventListener("click", () => {
      this.carregarUsuarios();
    });
  }

  async carregarUsuarios() {
    const tabela = document.getElementById("tabelaUsuarios");

    try {
      tabela.innerHTML =
        '<tr><td colspan="5" class="text-center"><div class="spinner-border text-primary" role="status"></div><br>Carregando usuários...</td></tr>';

      const usuarios = await this.usuarioService.listarUsuarios();

      if (!usuarios || usuarios.length === 0) {
        tabela.innerHTML =
          '<tr><td colspan="5" class="text-center text-muted">Nenhum usuário cadastrado.</td></tr>';
        return;
      }

      this.renderizarUsuarios(usuarios);
      this.adicionarEventosRemover();
    } catch (erro) {
      tabela.innerHTML = `
        <tr>
          <td colspan="5" class="text-center text-danger">
            <strong>Erro ao carregar usuários:</strong><br>
            ${erro.message}
          </td>
        </tr>
      `;
    }
  }

  renderizarUsuarios(usuarios) {
    const tabela = document.getElementById("tabelaUsuarios");
    tabela.innerHTML = "";

    usuarios.forEach((usuario) => {
      const linha = document.createElement("tr");
      linha.setAttribute("data-id", usuario.id);

      let dataCadastro = "N/A";
      if (usuario.created_at) {
        dataCadastro = new Date(usuario.created_at).toLocaleDateString("pt-BR");
      }

      linha.innerHTML = `
        <td class="fw-bold">#${usuario.id}</td>
        <td>${usuario.nome_completo || "-"}</td>
        <td>${usuario.email || "-"}</td>
        <td>${usuario.telefone || "-"}</td>
        <td>${dataCadastro}</td>
        <td>
          <button class="btn btn-danger btn-sm btn-remover" data-id="${usuario.id}">
            🗑 Remover
          </button>
        </td>
      `;

      tabela.appendChild(linha);
    });
  }

  adicionarEventosRemover() {
    const botoesRemover = document.querySelectorAll(".btn-remover");

    botoesRemover.forEach((botao) => {
      botao.addEventListener("click", async (e) => {
        const id = e.target.getAttribute("data-id");
        const nomeUsuario = e.target.closest("tr").querySelector("td:nth-child(2)").textContent;

        if (!confirm(`Tem certeza que deseja remover o usuário "${nomeUsuario}"?`)) {
          return;
        }

        const sucesso = await this.usuarioService.removerUsuario(id);

        if (sucesso) {
          this.carregarUsuarios();
          alert(`Usuário "${nomeUsuario}" removido com sucesso!`);
        } else {
          alert("Erro ao remover usuário. Tente novamente.");
        }
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new ListagemUsuarios();
});
