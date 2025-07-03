const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hash = password => bcrypt.hashSync(password, 10);

  // Clear existing data
  await prisma.application.deleteMany();
  await prisma.cV.deleteMany();
  await prisma.job.deleteMany();
  await prisma.company.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const admin = await prisma.user.create({
    data: {
      name: 'Admin Master',
      email: 'admin@jobhub.com',
      password: hash('admin123'),
      role: 'admin',
      avatar: './uploads/admin.jpg'
    }
  });

  const employer = await prisma.user.create({
    data: {
      name: 'Example Company',
      email: 'company@jobhub.com',
      password: hash('company123'),
      role: 'employer',
      abn: '12312312312',
      avatar: './uploads/employer.jpg'
    }
  });

  const candidate = await prisma.user.create({
    data: {
      name: 'Test Candidate',
      email: 'user@jobhub.com',
      password: hash('user123'),
      role: 'student',
      avatar: './uploads/student.jpg'
    }
  });

  // Create associated company
  const company = await prisma.company.create({
    data: {
      name: 'Tech Solutions',
      description: 'Technology and innovation company',
      website: 'https://techsolutions.com',
      location: 'Perth, AUS',
      logo: './uploads/company_image.jpg',
      users: { connect: { id: employer.id } }
    }
  });

  // Create skills
  const skillNames = ['Node.js', 'PostgreSQL', 'Docker', 'React', 'TypeScript'];
  const skills = [];

  for (const name of skillNames) {
    const skill = await prisma.skill.create({
      data: { name }
    });
    skills.push(skill);
  }

  // Relate skills to candidate
  await prisma.user.update({
    where: { id: candidate.id },
    data: {
      skills: {
        connect: skills.slice(0, 3).map(skill => ({ id: skill.id })) // Node.js, PostgreSQL, Docker
      }
    }
  });

  // Create jobs with salaryMin and salaryMax
  const jobs = [];
  for (let i = 1; i <= 10; i++) {
    const job = await prisma.job.create({
      data: {
        title: `Senior ICT Officer ${i}`,
        description: `${i} Metro Tasmania plays an important role in the lives of many Tasmanians, enabling them to maintain their connection to work, family, community and essential services. We connect the people and communities across our state and have been doing so for over 70 years. 
            We are an evolving Tasmanian organisation, and our future looks bright with the introduction of innovative and sustainable projects that continue to reduce our carbon footprint and work towards the Tasmanian government target of net zero emissions by 2050.
            We employ more than 500 people across Tasmania. Our people are diverse, skilled and passionate about delivering efficient and safe services to our customers. 
            We are building a team of capable and talented IT professionals and we require a Senior ICT Officer. The role is responsible for providing advanced technical support to Metro’s Enterprise systems and infrastructure.  This role is critical to supporting the ICT aspects of the Metro business including legacy system support and future technologies.
            Duties include but are not limited to:
            •	Provide expert advice and specialist, second-level support to enterprise systems and infrastructure including system security.
            •	Ensure that ICT systems are set up and managed in accordance with best practices with respect to performance, stability and security.
            •	Ensure assigned ICT requests are completed in a timely manner and meet stakeholder expectations.
            •	Assist with ICT projects ensuring projects are completed within agreed parameters.
            •	Take the technical lead, supporting and advising on business projects where there are ICT requirements and/or implications.
            •	Provide guidance and support to business areas to allow them to access data and build reports.
            A position description can be found on our website at Current vacancies - Metro Tasmania.
            To apply, please send your CV and cover letter to careers@metrotas.com.au
            .`,
        requirements: ['Node.js', 'PostgreSQL', 'Docker'],
        location: 'Remote',
        type: 'FULL_TIME',
        salaryMin: 60000 + i * 3000,
        salaryMax: 80000 + i * 4000,
        image: '/uploads/logo.jpg',
        closeDate: new Date('2025-08-01'),
        companyId: company.id,
        createdById: employer.id,
        skills: {
          connect: skills.slice(0, 3).map(skill => ({ id: skill.id }))
        }
      }
    });
    jobs.push(job);
  }

  // Create CV
  await prisma.cV.create({
    data: {
      userId: candidate.id,
      content: `
        Professional Summary: Full-stack developer with 3 years of experience.
        Experience:
        - Jr Dev at Startup XYZ (2022–2023)
        - Intern at ABC Agency (2021–2022)
        Education:
        - Computer Science - UFSP (2018–2022)
        Languages:
        - Advanced English
      `.trim()
    }
  });

  // Apply to the first job
  await prisma.application.create({
    data: {
      userId: candidate.id,
      jobId: jobs[0].id,
      status: 'PENDING'
    }
  });

  console.log('🌱 Seed successfully executed!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
