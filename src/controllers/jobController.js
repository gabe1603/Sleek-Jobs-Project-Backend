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
    const userRole = req.user.role ? req.user.role.toUpperCase() : '';
    logger.log('Usuário autenticado:', req.user.id, 'Role:', userRole);
    logger.log('Body recebido:', req.body);
    logger.log('File recebido:', req.file ? req.file.originalname : 'Nenhum arquivo');
    logger.log('Location recebido:', req.body.location);

    if (userRole !== 'ADMIN' && userRole !== 'EMPLOYER') {
      logger.log('Acesso negado para userId:', req.user.id);
      return res.status(403).json({ error: 'Acesso negado' });
    }
    // Buscar empresa vinculada ao usuário (caso seja EMPLOYER)
    let empresaId = req.body.companyId;
    if (userRole === 'EMPLOYER' && !empresaId) {
      const user = await prisma.user.findUnique({ where: { id: req.user.id } });
      empresaId = user.companyId;
      logger.log('Empresa vinculada ao EMPLOYER:', empresaId);
    }
    // Lida com upload de imagem
    let imagePath = undefined;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
      logger.log('Imagem salva em:', imagePath);
    }
    // Lida com salaryMin e salaryMax
    const salaryMin = req.body.salaryMin ? Number(req.body.salaryMin) : null;
    const salaryMax = req.body.salaryMax ? Number(req.body.salaryMax) : null;
    logger.log('Salários:', { salaryMin, salaryMax });
    // Lida com closeDate
    const closeDate = req.body.closeDate ? new Date(req.body.closeDate) : null;
    logger.log('closeDate:', closeDate);
    // Lida com skills (array de IDs)
    let skills = [];
    if (req.body.skills) {
      if (Array.isArray(req.body.skills)) {
        skills = req.body.skills;
      } else {
        try {
          skills = JSON.parse(req.body.skills);
        } catch {
          skills = [req.body.skills];
        }
      }
    }
    logger.log('Skills recebidas:', skills);

    // Conversão do type para o enum do Prisma
    let type = req.body.type;
    if (type) {
      const typeMap = {
        'Full time': 'FULL_TIME',
        'Part time': 'PART_TIME',
        'Internship': 'INTERNSHIP',
        'Contract': 'CONTRACT'
      };
      type = typeMap[type] || type;
      logger.log('Type convertido para enum:', type);
    }

    logger.log('Dados finais para criação da vaga:', {
      ...req.body,
      salaryMin,
      salaryMax,
      image: imagePath,
      closeDate,
      companyId: empresaId,
      createdById: req.user.id,
      skills,
      type
    });

    const job = await prisma.job.create({
      data: {
        ...req.body,
        salaryMin,
        salaryMax,
        image: imagePath,
        closeDate,
        companyId: empresaId,
        createdById: req.user.id,
        skills: skills.length > 0 ? {
          connect: skills.map(id => ({ id }))
        } : undefined,
        type
      }
    });
    logger.log(`Vaga criada por userId=${req.user.id}, jobId=${job.id}`);
    res.status(201).json(job);
  } catch (error) {
    logger.error('Erro ao criar vaga:', error);
    if (error instanceof Error && error.stack) {
      logger.error('Stack trace:', error.stack);
    }
    res.status(500).json({ error: 'Erro ao criar vaga', details: error.message });
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

// Deleta uma vaga pelo ID (apenas ADMIN ou EMPLOYER criador)
exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    logger.log('Requisição DELETE /api/jobs/:id', { id, userAuth: req.user });
    const job = await prisma.job.findUnique({ where: { id } });

    if (!job) {
      logger.log('Vaga não encontrada para id:', id);
      return res.status(404).json({ error: 'Vaga não encontrada' });
    }

    // Só ADMIN ou EMPLOYER criador pode deletar
    const userRole = req.user.role ? req.user.role.toUpperCase() : '';
    logger.log('Role do usuário:', userRole, 'Criador da vaga:', job.createdById);
    if (
      userRole !== 'ADMIN' &&
      !(userRole === 'EMPLOYER' && job.createdById === req.user.id)
    ) {
      logger.log('Acesso negado para userId:', req.user.id);
      return res.status(403).json({ error: 'Acesso negado' });
    }

    await prisma.job.delete({ where: { id } });
    logger.log('Vaga deletada com sucesso:', id);
    res.json({ message: 'Vaga deletada com sucesso' });
  } catch (error) {
    logger.error('Erro ao deletar vaga:', error);
    if (error instanceof Error && error.stack) {
      logger.error('Stack trace:', error.stack);
    }
    res.status(500).json({ error: 'Erro ao deletar vaga', details: error.message });
  }
}; 