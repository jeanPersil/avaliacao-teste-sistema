export function formatarData(dataISO) {
  if (!dataISO) return "N/A";

  const data = new Date(dataISO);
  return data.toLocaleDateString("pt-BR"); // "28/11/2025"
}
