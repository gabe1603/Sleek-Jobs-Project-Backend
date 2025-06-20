const { prisma } = require('../config/prisma');
const logger = require('../utils/logger');

exports.getAllJobs = async (req, res) => {
  logger.log('Recebida requisição GET /jobs');
  try {
    const jobs = await prisma.job.findMany({
      include: {
        company: { select: { name: true } },
        skills: true,
        createdBy: { select: { id: true } },
        applications: { select: { userId: true } }
      }
    });
    logger.log('Jobs recuperados do banco:', jobs.length);
    // Mapear para retornar createdBy como string (id), incluir image e closeDate
    const jobsMapped = jobs.map(job => {
      const { applications, ...restOfJob } = job;
      return {
        ...restOfJob,
        image: job.image,
        closeDate: job.closeDate,
        createdBy: job.createdById,
        applicants: applications.map(app => app.userId)
      };
    });
    res.json(jobsMapped);
  } catch (error) {
    logger.error('Erro ao buscar jobs:', error);
    res.status(500).json({ error: 'Erro ao buscar vagas' });
  }
};

exports.getJobById = async (req, res) => {
  logger.log('Recebida requisição GET /jobs/:id', req.params.id);
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        skills: true,
        createdBy: { select: { id: true } },
        applications: { select: { userId: true } }
      }
    });
    if (!job) {
      logger.log('Job não encontrado:', req.params.id);
      return res.status(404).json({ error: 'Vaga não encontrada' });
    }
    logger.log('Job encontrado:', job.id);
    // Retornar createdBy como string (id), incluir image, closeDate e applicants
    const { applications, ...restOfJob } = job;
    const jobMapped = {
      ...restOfJob,
      image: job.image,
      closeDate: job.closeDate,
      createdBy: job.createdById,
      applicants: applications.map(app => app.userId)
    };
    res.json(jobMapped);
  } catch (error) {
    logger.error('Erro ao buscar job:', error);
    res.status(500).json({ error: 'Erro ao buscar vaga' });
  }
};

// Criação de vaga
exports.createJob = async (req, res) => {
  logger.log('Recebida requisição POST /jobs');
  try {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'COMPANY') {
      logger.log('Acesso negado para userId:', req.user.id);
      return res.status(403).json({ error: 'Acesso negado' });
    }
    // Buscar empresa vinculada ao usuário (caso seja COMPANY)
    let empresaId = req.body.companyId;
    if (req.user.role === 'COMPANY' && !empresaId) {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      empresaId = user.companyId;
    }
    const job = await prisma.job.create({
      data: {
        ...req.body,
        companyId: empresaId,
        createdById: req.user.id
      }
    });
    logger.log(`Vaga criada por userId=${req.user.id}, jobId=${job.id}`);
    res.status(201).json(job);
  } catch (error) {
    logger.error('Erro ao criar vaga:', error);
    res.status(500).json({ error: 'Erro ao criar vaga' });
  }
};

// Upload de imagem da vaga
exports.uploadJobImage = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }
    const imagePath = `/uploads/${req.file.filename}`;
    await prisma.job.update({
      where: { id },
      data: { image: imagePath }
    });
    res.json({ url: imagePath });
  } catch (error) {
    next(error);
  }
};

// Retorna todas as vagas criadas por um usuário específico
exports.getJobsByCreator = async (req, res) => {
  const { userId } = req.params;
  logger.log(`Recebida requisição GET para vagas criadas por: ${userId}`);
  try {
    const jobs = await prisma.job.findMany({
      where: {
        createdById: userId
      },
      include: {
        company: { select: { name: true } },
        skills: true,
        applications: { select: { userId: true } }
      }
    });

    // Log para depuração
    logger.log(`[Depuração] Encontradas ${jobs.length} vagas para o criador ${userId}.`);

    // Mapear para o formato final
    const jobsMapped = jobs.map(job => {
      const { applications, ...restOfJob } = job;
      return {
        ...restOfJob,
        image: job.image,
        closeDate: job.closeDate,
        createdBy: job.createdById,
        applicants: applications.map(app => app.userId)
      };
    });

    res.json(jobsMapped);
  } catch (error) {
    logger.error(`Erro ao buscar vagas do criador ${userId}:`, error);
    res.status(500).json({ error: 'Erro ao buscar vagas' });
  }
}; 