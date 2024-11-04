// This is a seed script for the StoreItem model in Prisma

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create StoreItem entries for specified font families
  const storeItems = [
    {
      name: 'Hahmlet Font Family',
      description: 'A unique serif font family for classic and modern designs.',
      price: 100,
      type: 'FONT',
      requiredExp: 1500,
    },
    {
      name: 'JetBrains Mono Font Family',
      description: 'A highly readable monospaced font family perfect for coding and development environments.',
      price: 200,
      type: 'FONT',
      requiredExp: 1600,
    },
    {
      name: 'Lora Font Family',
      description: 'An elegant serif font family ideal for both digital and print media.',
      price: 250,
      type: 'FONT',
      requiredExp: 1550,
    },
    {
      name: 'Manrope Font Family',
      description: 'A minimalist, versatile font family great for a wide range of uses.',
      price: 300,
      type: 'FONT',
      requiredExp: 1400,
    },
    {
      name: 'Montserrat Font Family',
      description: 'A modern, geometric font family that suits both professional and casual projects.',
      price: 450,
      type: 'FONT',
      requiredExp: 1520,
    },
    {
      name: 'Noto Sans Font Family',
      description: 'A font family designed to support all languages, ensuring readability and clarity.',
      price: 550,
      type: 'FONT',
      requiredExp: 1500,
    },
    {
      name: 'Raleway Font Family',
      description: 'A stylish sans-serif font family perfect for elegant and modern design projects.',
      price: 650,
      type: 'FONT',
      requiredExp: 1480,
    },
    {
      name: 'Poppins Font Family',
      description: 'A geometric sans-serif font with a modern touch, suitable for all types of content.',
      price: 760,
      type: 'FONT',
      requiredExp: 1520,
    },
    {
      name: 'Roboto Font Family',
      description: 'A popular font family known for its versatility and readability.',
      price: 720,
      type: 'FONT',
      requiredExp: 1450,
    },
    {
      name: 'Sora Font Family',
      description: 'A comprehensive family of fonts suitable for various design projects, offering styles from thin to bold.',
      price: 780,
      type: 'FONT',
      requiredExp: 1500,
    }
  ];

  // Insert each store item into the database
  for (const item of storeItems) {
    await prisma.storeItem.create({
      data: item,
    });
  }

  console.log('Seeded StoreItem data for font families successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
