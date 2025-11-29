const url = "http://localhost:3000";

export const efetuarLogin = async (email, password) => {
  console.log(`Login e senha recebidos ${email}, ${password}`);
  try {
    const data = { email, password };
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

export const adicionar_produto = async (nome, preco, quantidade, validade) => {
  try {
    const dados = { nome, preco, quantidade, validade };
    console.log(dados);

    const response = await axios.post(`${url}/produto`, dados);

    return response.data; // ← TEM QUE TER ESTE RETURN
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
