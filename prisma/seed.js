const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Seed a test coupon if none exist
  const couponCount = await prisma.coupon.count();
  if (couponCount === 0) {
    await prisma.coupon.create({
      data: {
        code: "WELCOME10",
        type: "percent",
        value: 10,
        minOrderAmount: 100000, // ₹1000
        maxUses: 100,
      },
    });
    console.log("Created test coupon: WELCOME10 (10% off, min ₹1000)");
  }

  const placeholderUrl =
    process.env.DEFAULT_PRODUCT_IMAGE_URL ||
    "https://placehold.co/800x1000/FFFFFF/000000?text=Verlano";

  const productsWithoutImages = await prisma.product.findMany({
    where: {
      images: {
        none: {},
      },
    },
  });

  if (productsWithoutImages.length === 0) {
    console.log("All products already have at least one image. Nothing to seed.");
    return;
  }

  console.log(
    `Attaching placeholder image to ${productsWithoutImages.length} product(s)...`,
  );

  for (const [index, product] of productsWithoutImages.entries()) {
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: placeholderUrl,
        alt: product.title,
        position: 0,
        isPrimary: true,
      },
    });
    console.log(
      `  [${index + 1}/${productsWithoutImages.length}] ${product.slug} seeded`,
    );
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

