const { prisma } = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

exports.login = async (req, res) => {
  logger.log('Recebida requisição POST /auth/login');
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    logger.log('Busca de usuário por email:', email);
    if (!user) {
      logger.log('Usuário não encontrado:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      logger.log('Senha inválida para usuário:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    logger.log('Usuário autenticado:', user.id);

    // Monta payload do token
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId || undefined
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Monta resposta (apenas dados básicos e o JWT)
    const response = {
      id: user.id,
      email: user.email,
      name: user.name,
      jwt: token
    };

    res.json(response);
  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao autenticar' });
  }
}; 