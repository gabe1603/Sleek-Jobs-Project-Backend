const { prisma } = require('../config/prisma');

exports.getCompanyById = async (req, res) => {
  const { companyId } = req.params;
  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        name: true,
        description: true,
        website: true,
        location: true,
        logo: true,
        createdAt: true,
        updatedAt: true
      }
    });
    if (!company) {
      return res.status(404).json({ error: 'Empresa não encontrada.' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar empresa.' });
  }
}; 