import { supabase } from "../../banco/supabaseConfig.js";

export class Autenticacao {
  async cadastrarUsuario(email, senha, nome, telefone, role = "comum") {
    try {
      if (!email || !senha || !nome) {
        return { sucesso: false, mensagem: "Campos obrigatórios faltando" };
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
        .from("users")
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
}
