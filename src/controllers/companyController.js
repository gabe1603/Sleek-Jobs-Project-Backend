const { prisma } = require('../config/prisma');
const logger = require('../utils/logger');

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
      return res.status(404).json({ error: 'Company not found.' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching company.' });
  }
};

exports.createCompany = async (req, res) => {
  logger.log('Received POST /companies request');
  logger.log('Body received:', req.body);
  logger.log('File received:', req.file ? req.file.originalname : 'No file');
  try {
    const { name, description, website, location } = req.body;
    if (!name) {
      logger.log('Company name not provided');
      return res.status(400).json({ error: 'Company name is required.' });
    }
    let logoPath = undefined;
    if (req.file) {
      logoPath = `/uploads/${req.file.filename}`;
    }
    const company = await prisma.company.create({
      data: { name, description, website, location, logo: logoPath }
    });
    logger.log('Company created successfully:', company.id);
    res.status(201).json(company);
  } catch (error) {
    logger.error('Error creating company:', error);
    res.status(500).json({ error: 'Error creating company.' });
  }
}; 