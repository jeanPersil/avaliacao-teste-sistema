const url = "";

export const cadastrarUsuario = async (email, senha, nome, telefone) => {
  try {
    const data = { email, senha, nome, telefone };
    await axios.post(`${url}/user/cadastrar`, data);
    return true;
  } catch (error) {
    if (error.response) {
      console.error("Erro na requisição:", error.response.data);
      return {
        error: error.response.data.details || "Erro ao cadastrar usuario",
      };
    } else if (error.request) {
      console.error("Erro de conexão:", error.request);
      return {
        error:
          "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      };
    } else {
      console.error("Erro desconhecido:", error.message);
      return { error: "Ocorreu um erro inesperado." };
    }
  }
};

export const efetuarLogin = async (email, password, recapchaToken) => {
  try {
    const data = { email, password, recapchaToken };
    const response = await axios.post(`${url}/user/login`, data);

    return response.data.redirect;
  } catch (error) {
    if (error.response) {
      console.error("Erro na requisição:", error.response.data);
      return { error: error.response.data.details || "Credenciais inválidas." };
    } else if (error.request) {
      console.error("Erro de conexão:", error.request);
      return {
        error:
          "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      };
    } else {
      console.error("Erro desconhecido:", error.message);
      return { error: "Ocorreu um erro inesperado." };
    }
  }
};

export const listar_usuarios = async (pagina, limite) => {
  try {
    const response = await axios.get(`${url}/user`, {
      params: { pagina: pagina, limite: limite },
    });

    console.log(response.data.usuarios);
    return {
      usuarios: response.data.usuarios,
      paginacao: response.data.paginacao,
    };
  } catch (error) {
    if (error.response) {
      console.error("Erro na requisição:", error.response.data);
      return {
        error: error.response.data.details || "Erro ao listar usuarios",
      };
    } else if (error.request) {
      console.error("Erro de conexão:", error.request);
      return {
        error:
          "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      };
    } else {
      console.error("Erro desconhecido:", error.message);
      return { error: "Ocorreu um erro inesperado." };
    }
  }
};

export const excluirUsuario = async (id) => {
  try {
    await axios.delete(`${url}/user/${id}`);

    return { success: true };
  } catch (error) {
    if (error.response) {
      console.error("Erro na requisição:", error.response.data);
      return {
        error: error.response.data.details || "Erro ao deletar produto",
      };
    } else if (error.request) {
      console.error("Erro de conexão:", error.request);
      return {
        error:
          "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      };
    } else {
      console.error("Erro desconhecido:", error.message);
      return { error: "Ocorreu um erro inesperado." };
    }
  }
};

export const adicionar_produto = async (nome, preco, quantidade, validade) => {
  try {
    const dados = { nome, preco, quantidade, validade };
    console.log(dados);

    await axios.post(`${url}/produto`, dados);

    return { success: true };
  } catch (error) {
    if (error.response) {
      console.error("Erro na requisição:", error.response.data);
      return {
        error: error.response.data.details || "Erro ao adicionar produto",
      };
    } else if (error.request) {
      console.error("Erro de conexão:", error.request);
      return {
        error:
          "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      };
    } else {
      console.error("Erro desconhecido:", error.message);
      return { error: "Ocorreu um erro inesperado." };
    }
  }
};

export const listarProduto = async (pagina, limite) => {
  try {
    const response = await axios.get(`${url}/produto`, {
      params: { pagina: pagina, limite: limite },
    });

    return {
      produtos: response.data.produtos,
      paginacao: response.data.paginacao,
    };
  } catch (error) {
    if (error.response) {
      console.error("Erro na requisição:", error.response.data);
      return {
        error: error.response.data.details || "Erro ao listar produtos",
      };
    } else if (error.request) {
      console.error("Erro de conexão:", error.request);
      return {
        error:
          "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      };
    } else {
      console.error("Erro desconhecido:", error.message);
      return { error: "Ocorreu um erro inesperado." };
    }
  }
};

export const editarProduto = async (id, nome, preco, quantidade, validade) => {
  try {
    const dados = { id, nome, preco, quantidade, validade };
    await axios.put(`${url}/produto`, dados);

    return { success: true };
  } catch (error) {
    if (error.response) {
      console.error("Erro na requisição:", error.response.data);
      return {
        error: error.response.data.details || "Erro ao editar produto",
      };
    } else if (error.request) {
      console.error("Erro de conexão:", error.request);
      return {
        error:
          "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      };
    } else {
      console.error("Erro desconhecido:", error.message);
      return { error: "Ocorreu um erro inesperado." };
    }
  }
};

export const excluirProduto = async (id) => {
  try {
    await axios.delete(`${url}/produto/${id}`);

    return { success: true };
  } catch (error) {
    if (error.response) {
      console.error("Erro na requisição:", error.response.data);
      return {
        error: error.response.data.details || "Erro ao deletar produto",
      };
    } else if (error.request) {
      console.error("Erro de conexão:", error.request);
      return {
        error:
          "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      };
    } else {
      console.error("Erro desconhecido:", error.message);
      return { error: "Ocorreu um erro inesperado." };
    }
  }
};

export const realizarVenda = async (produtoId, quantidade) => {
  try {
    const dados = { produtoId, quantidade };
    await axios.post(`${url}/produto/venda`, dados, {
      withCredentials: true,
    });

    return { success: true };
  } catch (error) {
    if (error.response) {
      console.error("Erro na requisição:", error.response.data);
      return {
        error: error.response.data.details || "Erro ao efetuar compra",
      };
    } else if (error.request) {
      console.error("Erro de conexão:", error.request);
      return {
        error:
          "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      };
    } else {
      console.error("Erro desconhecido:", error.message);
      return { error: "Ocorreu um erro inesperado." };
    }
  }
};

export const enviarFeedback = async (tipo, mensagem) => {
  try {
    const dados = { tipo, mensagem };
    await axios.post(`${url}/feedback`, dados, {
      withCredentials: true,
    });

    return { success: true };
  } catch (error) {
    if (error.response) {
      console.error("Erro na requisição:", error.response.data);
      return {
        error: error.response.data.details || "Erro ao enviar feedback",
      };
    } else if (error.request) {
      console.error("Erro de conexão:", error.request);
      return {
        error:
          "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      };
    } else {
      console.error("Erro desconhecido:", error.message);
      return { error: "Ocorreu um erro inesperado." };
    }
  }
};

export const listarFeedbacks = async (pagina, limite) => {
  try {
    const response = await axios.get(`${url}/feedback`, {
      params: { pagina: pagina, limite: limite },
    });

    return {
      feedbacks: response.data.feedbacks,
      paginacao: response.data.paginacao,
    };
  } catch (error) {
    if (error.response) {
      console.error("Erro na requisição:", error.response.data);
      return {
        error: error.response.data.details || "Erro ao listar feedbacks",
      };
    } else if (error.request) {
      console.error("Erro de conexão:", error.request);
      return {
        error:
          "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      };
    } else {
      console.error("Erro desconhecido:", error.message);
      return { error: "Ocorreu um erro inesperado." };
    }
  }
};

export const editarFeedback = async (status, id) => {
  try {
    const dados = { status, id };
    await axios.put(`${url}/feedback`, dados);

    return { success: true };
  } catch (error) {
    if (error.response) {
      console.error("Erro na requisição:", error.response.data);
      return {
        error: error.response.data.details || "Erro ao editar feedback",
      };
    } else if (error.request) {
      console.error("Erro de conexão:", error.request);
      return {
        error:
          "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      };
    } else {
      console.error("Erro desconhecido:", error.message);
      return { error: "Ocorreu um erro inesperado." };
    }
  }
};

export const excluirFeedback = async (id) => {
  try {
    await axios.delete(`${url}/feedback/${id}`);

    return { success: true };
  } catch (error) {
    if (error.response) {
      console.error("Erro na requisição:", error.response.data);
      return {
        error: error.response.data.details || "Erro ao deletar produto",
      };
    } else if (error.request) {
      console.error("Erro de conexão:", error.request);
      return {
        error:
          "Não foi possível conectar ao servidor. Tente novamente mais tarde.",
      };
    } else {
      console.error("Erro desconhecido:", error.message);
      return { error: "Ocorreu um erro inesperado." };
    }
  }
};
