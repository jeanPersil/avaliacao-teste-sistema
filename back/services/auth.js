import { supabase } from "../../banco/supabaseConfig.js";
import { validarEmail } from "../utils/validar.js";

export class Autenticacao {
  async cadastrarUsuario(email, senha, nome, telefone, role = "comum") {
    try {
      if (!email || !senha || !nome) {
        return { sucesso: false, mensagem: "Campos obrigatórios faltando" };
      }

      if (!validarEmail(email)) {
        return { sucesso: false, mensagem: "Email invalido." };
      }

      if (senha.length < 6) {
        return {
          sucesso: false,
          mensagem: "A senha deve ter no minimo 6 caracteres.",
        };
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: senha,
      });

      if (authError) {
        return {
          sucesso: false,
          mensagem: `Falha na autenticação: ${authError.message}`,
        };
      }

      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .insert([
          {
            id: authData.user.id,
            nome_completo: nome,
            telefone: telefone,
            email: email,
            role: role,
          },
        ])
        .select();

      if (userError) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        return {
          sucesso: false,
          mensagem: `Falha ao criar perfil: ${userError.message}`,
        };
      }

      return {
        sucesso: true,
      };
    } catch (error) {
      console.error("Erro no cadastro:", error);
      return {
        sucesso: false,
        mensagem: error.message,
      };
    }
  }

  async login(email, senha) {
    try {
      if (!email || !senha) {
        return {
          sucesso: false,
          mensagem: "É necessário preencher o email e senha",
        };
      }

      if (!validarEmail(email)) {
        return { sucesso: false, mensagem: "Email invalido." };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        return { sucesso: false, mensagem: `Erro no login: ${error.message}` };
      }

      const { data: dataUser, error: errorUser } = await supabase
        .from("usuarios")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (errorUser) {
        return {
          sucesso: false,
          mensagem: `Erro ao buscar a role do usuário: ${errorUser.message}`,
        };
      }

      return {
        sucesso: true,
        dados: data.user,
        role: dataUser.role,
      };
    } catch (error) {
      console.log(`Erro ao fazer login: ${error.message}`);
      return {
        sucesso: false,
        mensagem: "Erro inesperado ao realizar login",
      };
    }
  }
}
