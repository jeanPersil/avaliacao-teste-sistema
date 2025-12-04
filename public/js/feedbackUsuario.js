import { enviarFeedback } from "./api.js";

class FeedbackController {
  constructor() {
    this.form = document.getElementById("formFeedback");
    this.tipoFeedback = document.getElementById("tipoFeedback");
    this.mensagemFeedback = document.getElementById("mensagemFeedback");
    this.charCount = document.getElementById("charCount");
    this.btnEnviar = document.getElementById("btnEnviar");
    this.mensagemResposta = document.getElementById("mensagemResposta");
    this.listaFeedbacks = document.getElementById("listaFeedbacks");
    this.btnVoltar = document.getElementById("btnVoltar");
    this.userStorageKey = this.gerarChaveUsuario();

    this.init();
  }

  gerarChaveUsuario() {
    
    let sessionKey = sessionStorage.getItem('feedbackSessionKey');
    
    if (!sessionKey) {
     
      sessionKey = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('feedbackSessionKey', sessionKey);
      
     
      this.limparFeedbacksAntigos();
    }
    
    return 'feedbacks_' + sessionKey;
  }

  limparFeedbacksAntigos() {
    // Remove feedbacks de sessões anteriores
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('feedbacks_user_')) {
        localStorage.removeItem(key);
      }
    });
  }

  init() {
    this.configurarEventos();
    this.carregarFeedbacksUsuario();
  }

  configurarEventos() {
   
    this.mensagemFeedback.addEventListener("input", () => {
      this.atualizarContador();
    });

    
    this.form.addEventListener("submit", (e) => {
      this.handleSubmit(e);
    });


    this.btnVoltar.addEventListener("click", () => {
      window.location.href = "/produtos";
    });

    
    this.form.addEventListener("reset", () => {
      this.charCount.textContent = "0";
      this.esconderMensagem();
      
      
      const avisoElement = document.getElementById("avisoValidacao");
      if (avisoElement) {
        avisoElement.style.display = "none";
      }
    });

    
    window.addEventListener('beforeunload', () => {
      
      if (document.referrer.includes('/logout') || window.location.pathname === '/') {
        sessionStorage.removeItem('feedbackSessionKey');
      }
    });
  }

  atualizarContador() {
    const length = this.mensagemFeedback.value.length;
    const mensagem = this.mensagemFeedback.value.trim();
    this.charCount.textContent = length;

   
    let avisoTexto = "";
    let avisoTipo = "";

    
    if (length > 0 && /^\d+$/.test(mensagem)) {
      avisoTexto = "⚠️ Não use apenas números";
      avisoTipo = "aviso";
    }
    
    else if (length > 0 && (/^[^\w\s]+$/u.test(mensagem) || /^[\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u.test(mensagem))) {
      avisoTexto = "⚠️ Não use apenas símbolos ou emojis";
      avisoTipo = "aviso";
    }
    
    else if (length >= 10) {
      const letrasCount = (mensagem.match(/[a-záàâãéèêíïóôõöúçñA-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/g) || []).length;
      if (letrasCount < 3) {
        avisoTexto = "⚠️ Use palavras válidas";
        avisoTipo = "aviso";
      }
    }

    
    const avisoElement = document.getElementById("avisoValidacao");
    if (avisoTexto && avisoElement) {
      avisoElement.textContent = avisoTexto;
      avisoElement.style.display = "block";
      avisoElement.className = `form-hint aviso-${avisoTipo}`;
    } else if (avisoElement) {
      avisoElement.style.display = "none";
    }

   
    if (length < 10) {
      this.charCount.style.color = "#dc3545";
    } else if (length > 140) {
      this.charCount.style.color = "#ffc107";
    } else {
      this.charCount.style.color = "#667eea";
    }

    
    if (length > 150) {
      this.charCount.style.color = "#dc3545";
      this.charCount.style.fontWeight = "bold";
    }
  }

  async handleSubmit(e) {
    e.preventDefault();

    const tipo = this.tipoFeedback.value;
    const mensagem = this.mensagemFeedback.value.trim();

    // Validações
    if (!tipo) {
      this.mostrarMensagem("Por favor, selecione o tipo de feedback.", "aviso");
      return;
    }

    if (mensagem.length < 10) {
      this.mostrarMensagem(
        "A mensagem deve ter pelo menos 10 caracteres.",
        "aviso"
      );
      return;
    }

    if (mensagem.length > 150) {
      this.mostrarMensagem(
        "A mensagem não pode ter mais de 150 caracteres.",
        "erro"
      );
      return;
    }

    
    if (/^\d+$/.test(mensagem)) {
      this.mostrarMensagem(
        "A mensagem não pode conter apenas números. Descreva o problema com palavras.",
        "aviso"
      );
      return;
    }

    
    const apenasEspeciais = /^[^\w\s]+$/u.test(mensagem);
    const apenasEmojis = /^[\p{Emoji}\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/u.test(mensagem);
    
    if (apenasEspeciais || apenasEmojis) {
      this.mostrarMensagem(
        "A mensagem não pode conter apenas símbolos ou emojis. Use palavras para descrever.",
        "aviso"
      );
      return;
    }

    
    const letrasCount = (mensagem.match(/[a-záàâãéèêíïóôõöúçñA-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/g) || []).length;
    if (letrasCount < 3) {
      this.mostrarMensagem(
        "A mensagem deve conter pelo menos algumas palavras válidas.",
        "aviso"
      );
      return;
    }

   
    const especialCount = (mensagem.match(/[^\w\sáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]/g) || []).length;
    const porcentagemEspecial = (especialCount / mensagem.length) * 100;
    
    if (porcentagemEspecial > 30) {
      this.mostrarMensagem(
        "A mensagem contém muitos caracteres especiais. Use palavras para descrever o problema.",
        "aviso"
      );
      return;
    }

  
    this.btnEnviar.disabled = true;
    const btnTexto = this.btnEnviar.querySelector(".btn-text");
    const btnLoading = this.btnEnviar.querySelector(".btn-loading");
    btnTexto.style.display = "none";
    btnLoading.style.display = "inline";

    try {
      const resultado = await enviarFeedback(tipo, mensagem);

      if (resultado && resultado.error) {
        this.mostrarMensagem(resultado.error, "erro");
      } else {
        this.mostrarMensagem(
          "Feedback enviado com sucesso! Obrigado pela sua contribuição.",
          "sucesso"
        );

       
        this.salvarFeedbackNoLocalStorage(tipo, mensagem);

        
        this.form.reset();
        this.charCount.textContent = "0";
        this.charCount.style.color = "#667eea";
        this.charCount.style.fontWeight = "normal";

    
        setTimeout(() => {
          this.carregarFeedbacksUsuario();
        }, 500);
      }
    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      this.mostrarMensagem(
        "Erro ao enviar feedback. Tente novamente.",
        "erro"
      );
    } finally {
      
      this.btnEnviar.disabled = false;
      btnTexto.style.display = "inline";
      btnLoading.style.display = "none";
    }
  }

  async carregarFeedbacksUsuario() {
    try {
      this.listaFeedbacks.innerHTML =
        '<div class="loading">Carregando seus feedbacks...</div>';

      const feedbacksSalvos = this.getFeedbacksDoLocalStorage();

      if (feedbacksSalvos.length === 0) {
        this.listaFeedbacks.innerHTML = `
          <div class="sem-feedbacks">
             Você ainda não enviou nenhum feedback.<br>
            Que tal compartilhar sua experiência conosco?
          </div>
        `;
        return;
      }

      this.listaFeedbacks.innerHTML = "";

      feedbacksSalvos.forEach((feedback) => {
        const feedbackElement = this.criarElementoFeedback(feedback);
        this.listaFeedbacks.appendChild(feedbackElement);
      });
    } catch (error) {
      console.error("Erro ao carregar feedbacks:", error);
      this.listaFeedbacks.innerHTML = `
        <div class="sem-feedbacks">
          ⚠️ Erro ao carregar feedbacks.<br>
          Tente recarregar a página.
        </div>
      `;
    }
  }

  criarElementoFeedback(feedback) {
    const div = document.createElement("div");
    div.className = "feedback-item";

    const tipoTexto = feedback.tipo === "bug" ? " Bug" : " Melhoria";
    const statusTexto = this.getTextoStatus(feedback.status);

    div.innerHTML = `
      <div class="feedback-header">
        <span class="feedback-tipo ${feedback.tipo}">${tipoTexto}</span>
        <span class="feedback-status ${feedback.status}">${statusTexto}</span>
      </div>
      <p class="feedback-mensagem">${feedback.mensagem}</p>
      <div class="feedback-data">${this.formatarData(feedback.data)}</div>
    `;

    return div;
  }

  getTextoStatus(status) {
    const statusMap = {
      pendente: " Pendente",
      em_analise: " Em Análise",
      em_andamento: " Em Andamento",
      finalizado: " Finalizado",
      cancelado: " Cancelado",
      recusado: " Recusado",
    };
    return statusMap[status] || status;
  }

  formatarData(data) {
    const date = new Date(data);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  getFeedbacksDoLocalStorage() {
    
    const feedbacks = localStorage.getItem(this.userStorageKey);
    return feedbacks ? JSON.parse(feedbacks) : [];
  }

  salvarFeedbackNoLocalStorage(tipo, mensagem) {
    
    const feedbacks = this.getFeedbacksDoLocalStorage();
    const novoFeedback = {
      id: Date.now(),
      tipo: tipo,
      mensagem: mensagem,
      status: "pendente",
      data: new Date().toISOString(),
    };
    feedbacks.unshift(novoFeedback);
    localStorage.setItem(this.userStorageKey, JSON.stringify(feedbacks));
  }

  mostrarMensagem(texto, tipo = "sucesso") {
    this.mensagemResposta.style.display = "block";
    this.mensagemResposta.className = `mensagem-alerta ${tipo}`;
    this.mensagemResposta.textContent = texto;

    this.mensagemResposta.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });

   
    setTimeout(() => {
      this.esconderMensagem();
    }, 5000);
  }

  esconderMensagem() {
    this.mensagemResposta.style.display = "none";
  }
}


document.addEventListener("DOMContentLoaded", () => {
  new FeedbackController();
});