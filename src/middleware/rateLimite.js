import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 5,
  statusCode: 423,
  message: (req, res) => {
    res.setHeader("Content-Type", "application/json");
    return JSON.stringify({
      details:
        "Muitas tentativas de login. Por favor, aguarde e tente novamente em alguns minutos.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});


const cadastroLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  statusCode: 429,
  message: (req, res) => {
    res.setHeader("Content-Type", "application/json");
    return JSON.stringify({
      details:
        "Muitas tentativas de cadastro a partir deste IP. Por favor, tente novamente em uma hora.",
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { cadastroLimiter, loginLimiter };
