import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Creating year...");

  const year = await prisma.year.create({
    data: {
      year: 1,
      subjects: {
        create: {
          name_en: "Math",
          name_np: "गणित",
          slug: "math",
          chapters: {
            create: {
              title_en: "Numbers",
              title_np: "संख्या",
              order: 1,
              notes: {
                create: {
                  title_en: "What are numbers?",
                  title_np: "संख्या के हुन्?",
                  content_en: "Numbers are 1, 2, 3, 4...",
                  content_np: "संख्या १, २, ३, ४...",
                  order: 1,
                },
              },
            },
          },
        },
      },
    },
    include: {
      subjects: {
        include: {
          chapters: {
            include: {
              notes: true,
            },
          },
        },
      },
    },
  });

  console.log("✓ SUCCESS! Your note was saved!");
  console.log(JSON.stringify(year, null, 2));
}

main()
  .catch((e) => {
    console.error("✗ ERROR! Something went wrong:");
    console.error(e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
