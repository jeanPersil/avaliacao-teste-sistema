export class Produto {
  constructor(id, nome, preco, quantidade, validade, created_at) {
    this.id = id;
    this.nome = nome;
    this.preco = preco;
    this.quantidade = quantidade;
    this.validade = validade;
    this.created_at = created_at;
  }

  static fromSupabase(data) {
    return new Produto(
      data.id,
      data.nome,
      data.preco,
      data.quantidade,
      data.validade,
      data.created_at
    );
  }
}
