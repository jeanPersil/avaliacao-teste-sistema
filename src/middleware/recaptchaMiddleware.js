import axios from "axios";

export const validarRecaptcha = async (req, res, next) => {
  const recaptchaToken = req.body.recaptchaToken;

  if (!recaptchaToken) {
    return res.status(400).json({ error: "Token do reCAPTCHA não fornecido." });
  }

  const secretKey = process.env.RECAPTCHA_SECRET;
  const googleURL = `https://www.google.com/recaptcha/api/siteverify`;

  try {
    const response = await axios.post(googleURL, null, {
      params: {
        secret: secretKey,
        response: recaptchaToken,
      },
    });

    const { success, "error-codes": errorCodes } = response.data;

    if (!success) {
      console.error(`Erro reCAPTCHA: ${JSON.stringify(errorCodes)}`);
      return res.status(400).json({
        error: "Falha na validação do robô (reCAPTCHA).",
        details:
          `Erro no reCAPTCHA: ${JSON.stringify(errorCodes)}` ||
          "Token inválido ou expirado.",
      });
    }

    next();
  } catch (error) {
    console.error("Erro ao conectar com Google:", error);
    return res
      .status(500)
      .json({ error: "Erro interno ao validar reCAPTCHA." });
  }
};
