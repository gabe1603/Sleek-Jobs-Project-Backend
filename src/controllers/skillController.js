const { prisma } = require('../config/prisma');
const logger = require('../utils/logger');

exports.getAllSkills = async (req, res) => {
  logger.log('Recebida requisição GET /skills');
  try {
    const skills = await prisma.skill.findMany();
    logger.log('Skills recuperadas:', skills.length);
    res.json(skills);
  } catch (error) {
    logger.error('Erro ao buscar skills:', error);
    res.status(500).json({ error: 'Erro ao buscar skills' });
  }
};

// Retorna as skills de um usuário específico
exports.getUserSkills = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { skills: true }
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user.skills);
  } catch (error) {
    logger.error('Erro ao buscar skills do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar skills do usuário' });
  }
}; 