import { Usuario } from "../back/services/usuario.js";

export class ListagemUsuarios {
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
    
    // Adiciona evento de duplo clique na linha para editar (opcional)
    document.getElementById("tabelaUsuarios").addEventListener("dblclick", (e) => {
      const linha = e.target.closest('tr');
      if (linha && linha.getAttribute('data-id')) {
        this.editarUsuario(linha.getAttribute('data-id'));
      }
    });
  }

  async carregarUsuarios() {
    const tabela = document.getElementById("tabelaUsuarios");

    try {
      tabela.innerHTML =
        '<tr><td colspan="6" class="text-center"><div class="spinner-border text-primary" role="status"></div><br>Carregando usuários...</td></tr>';

      console.log('Iniciando carregamento de usuários...');
      const usuarios = await this.usuarioService.listarUsuarios();
      console.log('Usuários carregados:', usuarios);

      if (!usuarios || usuarios.length === 0) {
        tabela.innerHTML =
          '<tr><td colspan="6" class="text-center text-muted">Nenhum usuário cadastrado.</td></tr>';
        return;
      }

      this.renderizarUsuarios(usuarios);
      this.adicionarEventosAcoes();
    } catch (erro) {
      console.error('Erro ao carregar usuários:', erro);
      tabela.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-danger">
            <strong>Erro ao carregar usuários:</strong><br>
            ${erro.message}
            <br><br>
            <button class="btn btn-sm btn-warning" onclick="location.reload()">
               Tentar Novamente
            </button>
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

      // Verifica se é um usuário recente (cadastrado nos últimos 7 dias)
      const classeRecente = this.isUsuarioRecente(usuario.created_at) ? 'text-success fw-bold' : '';

      linha.innerHTML = `
        <td class="fw-bold">#${usuario.id}</td>
        <td>${usuario.nome_completo || "-"}</td>
        <td>${usuario.email || "-"}</td>
        <td>${usuario.telefone || "-"}</td>
        <td class="${classeRecente}">${dataCadastro}${classeRecente ? '' : ''}</td>
        <td>
          <div class="btn-group" role="group">
            <button class="btn btn-danger btn-sm btn-remover" data-id="${usuario.id}" title="Remover usuário">
              Remover
            </button>
          </div>
        </td>
      `;

      tabela.appendChild(linha);
    });

    // Adiciona contador de usuários
    this.atualizarContador(usuarios.length);
  }

  isUsuarioRecente(dataCadastro) {
    if (!dataCadastro) return false;
    
    const dataUsuario = new Date(dataCadastro);
    const hoje = new Date();
    const diffTime = hoje.getTime() - dataUsuario.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= 7;
  }

  atualizarContador(total) {
    const header = document.querySelector('.header-actions h2');
    if (header) {
      const contadorExistente = header.querySelector('.badge');
      if (contadorExistente) {
        contadorExistente.remove();
      }
      const badge = document.createElement('span');
      badge.className = 'badge bg-primary ms-2';
      badge.textContent = total;
      header.appendChild(badge);
    }
  }

  adicionarEventosAcoes() {
    // Eventos para botões de remover
    const botoesRemover = document.querySelectorAll('.btn-remover');
    botoesRemover.forEach(botao => {
      botao.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = e.target.getAttribute('data-id');
        const nomeUsuario = e.target.closest('tr').querySelector('td:nth-child(2)').textContent;
        await this.removerUsuario(id, nomeUsuario);
      });
    });

    // Eventos para botões de editar
    const botoesEditar = document.querySelectorAll('.btn-editar');
    botoesEditar.forEach(botao => {
      botao.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = e.target.getAttribute('data-id');
        await this.editarUsuario(id);
      });
    });
  }

  async removerUsuario(id, nomeUsuario) {
    if (!confirm(`Tem certeza que deseja remover o usuário "${nomeUsuario}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      console.log(`Removendo usuário ID: ${id}`);
      const resultado = await this.usuarioService.removerUsuario(id);
      
      if (resultado) {
        this.mostrarMensagemTemporaria(`Usuário "${nomeUsuario}" removido com sucesso!`, 'success');
        this.carregarUsuarios();
      } else {
        this.mostrarMensagemTemporaria('Erro ao remover usuário. Tente novamente.', 'error');
      }
    } catch (erro) {
      console.error('Erro ao remover usuário:', erro);
      this.mostrarMensagemTemporaria('Erro ao remover usuário: ' + erro.message, 'error');
    }
  }

  async editarUsuario(id) {
    try {
      console.log(`Editando usuário ID: ${id}`);
      
      // Busca os dados do usuário
      const usuarios = await this.usuarioService.listarUsuarios();
      const usuario = usuarios.find(u => u.id == id);
      
      if (!usuario) {
        this.mostrarMensagemTemporaria('Usuário não encontrado!', 'error');
        return;
      }

      // Redireciona para a página de cadastro com os dados do usuário
      const params = new URLSearchParams({
        editar: 'true',
        id: usuario.id,
        nome_completo: usuario.nome_completo || '',
        email: usuario.email || '',
        telefone: usuario.telefone || ''
      });

      window.location.href = `cadusuario.html?${params.toString()}`;

    } catch (erro) {
      console.error('Erro ao editar usuário:', erro);
      this.mostrarMensagemTemporaria('Erro ao carregar dados do usuário: ' + erro.message, 'error');
    }
  }

  mostrarMensagemTemporaria(mensagem, tipo) {
    // Cria uma mensagem temporária na parte superior
    const alerta = document.createElement('div');
    alerta.className = `alert alert-${tipo} alert-dismissible fade show position-fixed`;
    alerta.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    alerta.innerHTML = `
      ${mensagem}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alerta);
    
    // Remove automaticamente após 5 segundos
    setTimeout(() => {
      if (alerta.parentNode) {
        alerta.remove();
      }
    }, 5000);
  }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  console.log('Inicializando listagem de usuários...');
  new ListagemUsuarios();
});

// Também recarrega quando a página for focada novamente
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    setTimeout(() => {
      const listagem = document.querySelector('.listagem-usuarios');
      if (listagem) {
        console.log('Página focada - recarregando usuários...');
        // Recarrega os usuários se a listagem estiver visível
        new ListagemUsuarios().carregarUsuarios();
      }
    }, 1000);
  }
});