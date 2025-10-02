import { supabase } from "../../banco/supabaseConfig.js";

export class Usuario {
  constructor() {
    this.usuarios = [];
  }

  async verificarUsuarioExiste(email) {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id")
      .eq("email", email);

    if (error) {
      throw new Error(`Erro ao verificar usuário: ${error.message}`);
    }

    return data && data.length > 0;
  }

  async adicionarUsuario(nome_completo, email, telefone) {
    try {
      let usuarioExiste = await this.verificarUsuarioExiste(email);

      if (usuarioExiste) {
        return { sucesso: false, mensagem: "Este usuário já está cadastrado." };
      }

      const { error } = await supabase.from("usuarios").insert([
        {
          nome_completo,
          email,
          telefone,
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      return { sucesso: true };
    } catch (erro) {
      console.error("Erro ao adicionar usuário:", erro);
      return { sucesso: false, mensagem: erro.message };
    }
  }

  async listarUsuarios() {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar usuários: ${error.message}`);
      }

      this.usuarios = data || [];
      return this.usuarios;
    } catch (erro) {
      console.error("Erro ao listar usuários:", erro);
      throw erro;
    }
  }

  async editarUsuario(id, nome_completo, email, telefone) {
    try {
      const { error } = await supabase
        .from("usuarios")
        .update({ nome_completo, email, telefone })
        .eq("id", id);

      if (error) {
        throw new Error(`Erro ao editar usuário: ${error.message}`);
      }

      return { sucesso: true };
    } catch (erro) {
      console.error("Erro ao editar usuário:", erro);
      return { sucesso: false, mensagem: "Erro inesperado ao editar usuário." };
    }
  }

  async removerUsuario(id) {
    const { error } = await supabase.from("usuarios").delete().eq("id", id);

    if (error) {
      console.error("Erro ao remover usuário:", error);
      return false;
    }
    return true;
  }
}
