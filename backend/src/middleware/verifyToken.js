const sql = require('../config/database');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'Token não fornecido.' });
  }

  const sessionId = authHeader.split(' ')[1];

  sql`SELECT id_us FROM usuarios WHERE session_id = ${sessionId}`
    .then((users) => {
      if (users.length === 0) {
        return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
      }
      req.userId = users[0].id_us;
      next();
    })
    .catch((err) => {
      console.error('Erro ao verificar token:', err);
      res.status(500).json({ error: 'Erro interno.' });
    });
}

module.exports = verifyToken;