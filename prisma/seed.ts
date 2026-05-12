import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.question.deleteMany();
  await prisma.note.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.year.deleteMany();

  // Create Years
  const year1 = await prisma.year.create({
    data: { year: 1 }
  });

  const year2 = await prisma.year.create({
    data: { year: 2 }
  });

  const year3 = await prisma.year.create({
    data: { year: 3 }
  });

  // Create Subjects for Year 1
  const constLaw = await prisma.subject.create({
    data: {
      yearId: year1.id,
      name_en: 'Constitutional Law',
      name_np: 'संवैधानिक कानून',
      slug: 'constitutional-law',
      icon: '📜'
    }
  });

  const jurisprudence = await prisma.subject.create({
    data: {
      yearId: year1.id,
      name_en: 'Jurisprudence',
      name_np: 'न्यायशास्त्र',
      slug: 'jurisprudence',
      icon: '⚖️'
    }
  });

  // Create Chapters for Constitutional Law
  const chapter1 = await prisma.chapter.create({
    data: {
      subjectId: constLaw.id,
      title_en: 'Introduction to Constitutional Law',
      title_np: 'संवैधानिक कानूनको परिचय',
      order: 1
    }
  });

  const chapter2 = await prisma.chapter.create({
    data: {
      subjectId: constLaw.id,
      title_en: 'Fundamental Rights',
      title_np: 'मौलिक अधिकार',
      order: 2
    }
  });

  // Create Notes for Chapter 1
  await prisma.note.create({
    data: {
      chapterId: chapter1.id,
      title_en: 'Basics of Constitutional Law',
      title_np: 'संवैधानिक कानूनको आधार',
      content_en:
        'Constitutional law is the body of law which defines the role, powers, and structure of different entities within the state. It also defines the fundamental principles by which the state is governed.',
      content_np:
        'संवैधानिक कानून भनेको कानूनको शाखा हो जसले राज्यभित्र विभिन्न संस्थाहरूको भूमिका, शक्तिहरु र संरचना परिभाषित गर्दछ। यसले राज्य कसरी शासित हुन्छ भन्ने मौलिक सिद्धान्तहरु पनि परिभाषित गर्दछ।',
      order: 1
    }
  });

  // Create Questions for Chapter 1
  await prisma.question.create({
    data: {
      chapterId: chapter1.id,
      question_en: 'Define Constitutional Law',
      question_np: 'संवैधानिक कानूनको परिभाषा दिनुहोस्',
      answer_en:
        'Constitutional law is the body of law which defines the role, powers, and structure of different entities within the state.',
      answer_np:
        'संवैधानिक कानून भनेको कानूनको शाखा हो जसले राज्यभित्र विभिन्न संस्थाहरूको भूमिका, शक्तिहरु र संरचना परिभाषित गर्दछ।',
      type: 'past'
    }
  });

  await prisma.question.create({
    data: {
      chapterId: chapter1.id,
      question_en: 'What is the main purpose of a constitution?',
      question_np: 'संविधानको मुख्य उद्देश्य के हो?',
      answer_en:
        'The main purpose of a constitution is to establish the structure of government, define its powers, and protect the rights of citizens.',
      answer_np:
        'संविधानको मुख्य उद्देश्य सरकारको संरचना स्थापना गर्न, यसका शक्तिहरु परिभाषित गर्न र नागरिकहरुको अधिकार रक्षा गर्न हो।',
      type: 'possible'
    }
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
