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

function abrirModalReportFeedback() {
  const modal = document.getElementById("modal-novo-report");

  // Adicionei id="form-feedback" na tag form abaixo e removi o erro de digitação
  modal.innerHTML = `
    <div class="modal-box">
      <form id="form-feedback"> 
      
        <div class="modal-titulo">Novo Report</div>
        <p style="color: #666; font-size: 13px; margin-bottom: 15px;">
          Selecione a categoria e descreva o item detalhadamente.
        </p>

        <div style="margin-bottom: 15px;">
          <label style="font-size: 13px; font-weight: bold; display: block; margin-bottom: 5px;">Categoria</label>
          <select id="novo-tipo" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px;">
            <option value="bug">Bug (Erro)</option>
            <option value="melhoria">Melhoria</option>
          </select>
        </div>

        <div>
          <label style="font-size: 13px; font-weight: bold; display: block; margin-bottom: 5px;">Detalhes</label>
          <textarea 
            id="nova-mensagem" 
            required 
            rows="5" 
            style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 6px; resize: vertical;"
            placeholder="Ex: O botão de login não responde..."
          ></textarea>
        </div>

        <div class="modal-acoes" style="margin-top: 20px;">
          <button type="button" class="btn-fechar" id="fecharFeedback">Cancelar</button>
          
          <button type="submit" class="btn-salvar">Enviar</button>
        </div>

      </form>
    </div>
  `;

  modal.classList.add("aberto");
}

function fecharModalReportFeedback() {
  const modal = document.getElementById("modal-novo-report");
  modal.classList.remove("aberto");
  modal.innerHTML = "";
}

function abrirModalEditarFeedback(feedback) {
  const modal = document.getElementById("modal-novo-report");

  const statusPendente = feedback.status === "pendente" ? "selected" : "";
  const statusResolvido = feedback.status === "resolvido" ? "selected" : "";

  modal.innerHTML = `
    <div class="modal-box">
      <form id="form-editar-feedback">
      
        <div class="modal-titulo">Detalhes do Report #${feedback.id}</div>

        <div style="margin-bottom: 15px;">
           <label style="font-size: 12px; color: #666;">Usuário</label>
           <input type="text" value="${
             feedback.nome_usuario || "Anônimo"
           }" disabled 
             style="width: 100%; padding: 8px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px;">
        </div>

        <div style="margin-bottom: 15px;">
           <label style="font-size: 12px; color: #666;">Descrição</label>
           <textarea disabled 
             style="width: 100%; padding: 8px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 4px; resize: none;" 
             rows="4">${feedback.mensagem}</textarea>
        </div>

        <div style="margin-bottom: 20px;">
          <label style="font-size: 13px; font-weight: bold; display: block; margin-bottom: 5px;">Atualizar Status</label>
          <select id="edit-status" style="width: 100%; padding: 10px; border: 1px solid #333; border-radius: 6px; background: #fff;">
              <option value="Pendente">Pendente</option>
              <option value="Em analise">Em analise</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Recusado">Recusado</option>
          </select>
        </div>

        <div class="modal-acoes" style="margin-top: 20px; display: flex; justify-content: space-between; align-items: center;">
          
          <button type="button" id="btnExcluirFeedback" style="background: #ffebee; color: #c62828; border: 1px solid #ef9a9a; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold;">
            Excluir
          </button>

          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn-fechar" id="fecharEdicao">Cancelar</button>
            <button type="submit" class="btn-salvar">Salvar</button>
          </div>

        </div>

      </form>
    </div>
  `;

  modal.classList.add("aberto");
}

export {
  abrirModalEdicao,
  fecharModal,
  abrirModalReportFeedback,
  fecharModalReportFeedback,
  abrirModalEditarFeedback,
};
