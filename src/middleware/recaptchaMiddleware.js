import axios from "axios";

export const validarRecaptcha = async (req, res, next) => {
  const token = req.body.recaptchaToken;

  if (!token) {
    return res.status(400).json({
      details: "Token do reCAPTCHA não foi enviado.",
    });
  }

  try {
    const { data } = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: process.env.RECAPTCHA_SECRET,
          response: token,
        },
      }
    );

    if (!data.success) {
      return res.status(400).json({
        error: "Falha ao validar reCAPTCHA.",
        details: data["error-codes"],
      });
    }

    next();
  } catch (err) {
    console.error("Erro ao validar reCAPTCHA:", err);
    return res.status(500).json({
      error: "Erro ao conectar com Google.",
    });
  }
};
