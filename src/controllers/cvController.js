const { prisma } = require('../config/prisma');
const logger = require('../utils/logger');

exports.getCV = async (req, res) => {
  logger.log('Recebida requisição GET /cv/:userId', req.params.userId);
  try {
    const cv = await prisma.cV.findUnique({
      where: { userId: req.params.userId }
    });
    if (!cv) {
      logger.log('CV não encontrado para userId:', req.params.userId);
      return res.status(404).json({ error: 'CV não encontrado' });
    }
    logger.log('CV encontrado para userId:', req.params.userId);
    res.json(cv);
  } catch (error) {
    logger.error('Erro ao buscar CV:', error);
    res.status(500).json({ error: 'Erro ao buscar CV' });
  }
};

exports.upsertCV = async (req, res) => {
  logger.log('Recebida requisição POST /cv', req.body);
  const { userId, content } = req.body;
  try {
    const cv = await prisma.cV.upsert({
      where: { userId },
      update: { content },
      create: { userId, content }
    });
    logger.log('CV criado/atualizado para userId:', userId);
    res.json(cv);
  } catch (error) {
    logger.error('Erro ao criar/atualizar CV:', error);
    res.status(500).json({ error: 'Erro ao criar/atualizar CV' });
  }
}; 