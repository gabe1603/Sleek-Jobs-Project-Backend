const { prisma } = require('../config/prisma');
const logger = require('../utils/logger');

exports.applyToJob = async (req, res) => {
  logger.log('Recebida requisição POST /jobs/:id/apply', req.params.id, req.body);
  const { userId } = req.body;
  const jobId = req.params.id;
  try {
    const application = await prisma.application.create({
      data: {
        userId,
        jobId
      }
    });
    logger.log('Candidatura criada:', application.id);
    res.status(201).json(application);
  } catch (error) {
    logger.error('Erro ao aplicar para vaga:', error);
    res.status(500).json({ error: 'Erro ao aplicar para vaga' });
  }
};

exports.getUserApplications = async (req, res) => {
  logger.log('Recebida requisição GET /users/:id/applications', req.params.id);
  try {
    const applications = await prisma.application.findMany({
      where: { userId: req.params.id },
      include: {
        job: {
          select: {
            title: true,
            company: { select: { name: true } }
          }
        }
      }
    });
    logger.log('Candidaturas encontradas para userId:', req.params.id, applications.length);
    res.json(applications);
  } catch (error) {
    logger.error('Erro ao buscar candidaturas:', error);
    res.status(500).json({ error: 'Erro ao buscar candidaturas' });
  }
}; 