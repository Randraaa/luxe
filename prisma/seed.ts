import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { hashPassword } from "better-auth/crypto";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Cleaning database...");
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creating categories...");
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Men",
        slug: "men",
        description: "Premium menswear collections including shirts, trousers, and outerwear.",
        image: "https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=600&auto=format&fit=crop",
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "Women",
        slug: "women",
        description: "Elegant and modern womenswear featuring dresses, tops, and tailoring.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=600&auto=format&fit=crop",
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: "Accessories",
        slug: "accessories",
        description: "Timeless luxury leather goods, sunglasses, and minimal jewelry.",
        image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop",
        order: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: "Footwear",
        slug: "footwear",
        description: "Handcrafted Italian leather shoes, minimalist sneakers, and boots.",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop",
        order: 4,
      },
    }),
  ]);

  console.log("Creating users...");
  const adminPasswordHash = await hashPassword("admin123");
  const admin = await prisma.user.create({
    data: {
      name: "Admin Luxe",
      email: "admin@luxe.com",
      role: Role.ADMIN,
      emailVerified: true,
      accounts: {
        create: {
          accountId: "admin@luxe.com",
          providerId: "credential",
          password: adminPasswordHash,
        },
      },
    },
  });

  const customerPasswordHash = await hashPassword("password123");
  const customer = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "john@luxe.com",
      role: Role.CUSTOMER,
      emailVerified: true,
      accounts: {
        create: {
          accountId: "john@luxe.com",
          providerId: "credential",
          password: customerPasswordHash,
        },
      },
    },
  });

  console.log("Creating coupons...");
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        description: "10% off for new customers",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minPurchase: 250000,
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
      },
      {
        code: "LUXELIMITED",
        description: "Rp 100.000 off on minimum purchase of Rp 1.000.000",
        discountType: "FIXED_AMOUNT",
        discountValue: 100000,
        minPurchase: 1000000,
        startDate: new Date(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 14 days
      },
    ],
  });

  console.log("Creating banners...");
  await prisma.banner.createMany({
    data: [
      {
        title: "The Autumn Edit",
        subtitle: "Minimalist tailoring & transitional outerwear",
        image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=1600&auto=format&fit=crop",
        position: "HERO",
        isActive: true,
      },
      {
        title: "Summer Essentials",
        subtitle: "Up to 30% off lightweight linens",
        image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=1200&auto=format&fit=crop",
        position: "PROMO",
        isActive: true,
      },
    ],
  });

  console.log("Creating products (16 dummy products)...");
  const productsData = [
    // 1. Men
    {
      name: "Minimalist Linen Shirt",
      slug: "minimalist-linen-shirt",
      description: "Crafted from 100% organic linen, this shirt features a relaxed fit, point collar, and a clean french placket. Perfect for warm days and effortless styling.",
      brand: "LUXE",
      price: 549000,
      sku: "LX-MLS-001",
      weight: 200,
      stock: 50,
      isFeatured: true,
      isNewArrival: true,
      categoryId: categories[0].id,
      images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop"],
      variants: [
        { size: "S", color: "White", colorHex: "#FFFFFF", stock: 10 },
        { size: "M", color: "White", colorHex: "#FFFFFF", stock: 15 },
        { size: "L", color: "White", colorHex: "#FFFFFF", stock: 10 },
        { size: "M", color: "Navy", colorHex: "#0B1D33", stock: 15 },
      ],
    },
    {
      name: "Tailored Wool Blazer",
      slug: "tailored-wool-blazer",
      description: "A timeless single-breasted blazer cut from premium Italian virgin wool. Features structuring shoulder pads, notched lapels, and double welt pockets.",
      brand: "LUXE",
      price: 1899000,
      sku: "LX-TWB-002",
      weight: 600,
      stock: 20,
      isFeatured: true,
      isNewArrival: false,
      categoryId: categories[0].id,
      images: ["https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop"],
      variants: [
        { size: "M", color: "Charcoal", colorHex: "#333333", stock: 8 },
        { size: "L", color: "Charcoal", colorHex: "#333333", stock: 12 },
      ],
    },
    {
      name: "Slim-Fit Cotton Chinos",
      slug: "slim-fit-cotton-chinos",
      description: "A versatile pair of chinos cut in a modern slim fit from stretch-cotton twill. Finished with side slip pockets and buttoned welt pockets at the back.",
      brand: "LUXE",
      price: 699000,
      sku: "LX-SFC-003",
      weight: 400,
      stock: 40,
      isFeatured: false,
      isNewArrival: true,
      categoryId: categories[0].id,
      images: ["https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=600&auto=format&fit=crop"],
      variants: [
        { size: "30", color: "Beige", colorHex: "#D2B48C", stock: 10 },
        { size: "32", color: "Beige", colorHex: "#D2B48C", stock: 20 },
        { size: "34", color: "Beige", colorHex: "#D2B48C", stock: 10 },
      ],
    },
    {
      name: "Merino Wool Knit Sweater",
      slug: "merino-wool-knit-sweater",
      description: "Knitted from soft, breathable merino wool, this sweater features a classic crew neck and ribbed trims. Ideal for layering during transitional months.",
      brand: "LUXE",
      price: 899000,
      sku: "LX-MWK-004",
      weight: 350,
      stock: 30,
      isFeatured: false,
      isNewArrival: false,
      categoryId: categories[0].id,
      images: ["https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?q=80&w=600&auto=format&fit=crop"],
      variants: [
        { size: "M", color: "Olive", colorHex: "#556B2F", stock: 15 },
        { size: "L", color: "Olive", colorHex: "#556B2F", stock: 15 },
      ],
    },
    // 2. Women
    {
      name: "Silk Wrap Dress",
      slug: "silk-wrap-dress",
      description: "An elegant wrap dress made from heavyweight mulberry silk. Drapes beautifully with an adjustable waist tie and subtle balloon sleeves.",
      brand: "LUXE",
      price: 1450000,
      sku: "LX-SWD-005",
      weight: 300,
      stock: 35,
      isFeatured: true,
      isNewArrival: true,
      categoryId: categories[1].id,
      images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop"],
      variants: [
        { size: "XS", color: "Emerald", colorHex: "#046A38", stock: 5 },
        { size: "S", color: "Emerald", colorHex: "#046A38", stock: 10 },
        { size: "M", color: "Emerald", colorHex: "#046A38", stock: 10 },
        { size: "S", color: "Black", colorHex: "#000000", stock: 10 },
      ],
    },
    {
      name: "Classic Trench Coat",
      slug: "classic-trench-coat",
      description: "A double-breasted trench coat in water-resistant cotton gabardine. Detailed with storm flaps, epaulettes, and a waist-defining belt.",
      brand: "LUXE",
      price: 2499000,
      sku: "LX-CTC-006",
      weight: 850,
      stock: 15,
      isFeatured: true,
      isNewArrival: false,
      categoryId: categories[1].id,
      images: ["https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop"],
      variants: [
        { size: "S", color: "Beige", colorHex: "#D2B48C", stock: 5 },
        { size: "M", color: "Beige", colorHex: "#D2B48C", stock: 10 },
      ],
    },
    {
      name: "Cashmere Turtleneck Sweater",
      slug: "cashmere-turtleneck-sweater",
      description: "Expertly crafted from pure cashmere for unparalleled softness and warmth. Features a cozy fold-over turtleneck and a slightly relaxed silhouette.",
      brand: "LUXE",
      price: 1299000,
      sku: "LX-CTS-007",
      weight: 320,
      stock: 25,
      isFeatured: false,
      isNewArrival: true,
      categoryId: categories[1].id,
      images: ["https://images.unsplash.com/photo-1574164904299-3a102b110380?q=80&w=600&auto=format&fit=crop"],
      variants: [
        { size: "S", color: "Cream", colorHex: "#FFFDD0", stock: 10 },
        { size: "M", color: "Cream", colorHex: "#FFFDD0", stock: 15 },
      ],
    },
    {
      name: "High-Waisted Tailored Trousers",
      slug: "high-waisted-tailored-trousers",
      description: "These high-waisted trousers are cut with a flattering wide-leg profile from smooth crepe fabric. Features sharp pressed creases and belt loops.",
      brand: "LUXE",
      price: 799000,
      sku: "LX-HTT-008",
      weight: 450,
      stock: 30,
      isFeatured: false,
      isNewArrival: false,
      categoryId: categories[1].id,
      images: ["https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?q=80&w=600&auto=format&fit=crop"],
      variants: [
        { size: "S", color: "Black", colorHex: "#000000", stock: 15 },
        { size: "M", color: "Black", colorHex: "#000000", stock: 15 },
      ],
    },
    // 3. Accessories
    {
      name: "Leather Messenger Bag",
      slug: "leather-messenger-bag",
      description: "Handcrafted from full-grain vegetable-tanned leather. Features a padded laptop compartment, internal organization pockets, and an adjustable shoulder strap.",
      brand: "LUXE",
      price: 1299000,
      sku: "LX-LMB-009",
      weight: 1200,
      stock: 25,
      isFeatured: false,
      isNewArrival: true,
      categoryId: categories[2].id,
      images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=600&auto=format&fit=crop"],
      variants: [
        { size: "One Size", color: "Tan", colorHex: "#B87333", stock: 25 },
      ],
    },
    {
      name: "Classic Aviator Sunglasses",
      slug: "classic-aviator-sunglasses",
      description: "A iconic pair of aviator sunglasses with gold-plated metal frames and green polarized lenses. Complete with 100% UV protection and leather case.",
      brand: "LUXE",
      price: 450000,
      sku: "LX-CAS-010",
      weight: 50,
      stock: 50,
      isFeatured: true,
      isNewArrival: false,
      categoryId: categories[2].id,
      images: ["https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop"],
      variants: [
        { size: "Standard", color: "Gold/Green", colorHex: "#D4AF37", stock: 50 },
      ],
    },
    {
      name: "Minimalist Leather Wallet",
      slug: "minimalist-leather-wallet",
      description: "Slim bifold wallet handcrafted from premium saffiano leather. Features 6 card slots, a cash compartment, and RFID blocking technology.",
      brand: "LUXE",
      price: 349000,
      sku: "LX-MLW-011",
      weight: 80,
      stock: 60,
      isFeatured: false,
      isNewArrival: true,
      categoryId: categories[2].id,
      images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600&auto=format&fit=crop"],
      variants: [
        { size: "One Size", color: "Black", colorHex: "#000000", stock: 30 },
        { size: "One Size", color: "Brown", colorHex: "#8B4513", stock: 30 },
      ],
    },
    {
      name: "Sapphire Chronograph Watch",
      slug: "sapphire-chronograph-watch",
      description: "A luxury chronograph watch featuring a scratch-resistant sapphire crystal dial, stainless steel casing, and a genuine alligator leather strap.",
      brand: "LUXE",
      price: 3499000,
      sku: "LX-SCW-012",
      weight: 150,
      stock: 10,
      isFeatured: true,
      isNewArrival: true,
      categoryId: categories[2].id,
      images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600&auto=format&fit=crop"],
      variants: [
        { size: "40mm", color: "Silver/Black", colorHex: "#C0C0C0", stock: 10 },
      ],
    },
    // 4. Footwear
    {
      name: "Italian Leather Loafers",
      slug: "italian-leather-loafers",
      description: "Classic penny loafers constructed from soft calfskin leather in Tuscany. Fitted with a cushioned footbed and durable leather sole.",
      brand: "LUXE",
      price: 1999000,
      sku: "LX-ILL-013",
      weight: 900,
      stock: 18,
      isFeatured: true,
      isNewArrival: false,
      categoryId: categories[3].id,
      images: ["https://images.unsplash.com/photo-1533867617858-e7b97e060509?q=80&w=600&auto=format&fit=crop"],
      variants: [
        { size: "41", color: "Espresso", colorHex: "#3D2314", stock: 6 },
        { size: "42", color: "Espresso", colorHex: "#3D2314", stock: 8 },
        { size: "43", color: "Espresso", colorHex: "#3D2314", stock: 4 },
      ],
    },
    {
      name: "Minimalist White Sneakers",
      slug: "minimalist-white-sneakers",
      description: "Clean, low-top sneakers crafted from white full-grain leather. Designed with a Margom rubber sole and subtle gold-stamped serial numbers.",
      brand: "LUXE",
      price: 899000,
      sku: "LX-MWS-014",
      weight: 800,
      stock: 30,
      isFeatured: false,
      isNewArrival: true,
      categoryId: categories[3].id,
      images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop"],
      variants: [
        { size: "40", color: "White", colorHex: "#FFFFFF", stock: 10 },
        { size: "41", color: "White", colorHex: "#FFFFFF", stock: 10 },
        { size: "42", color: "White", colorHex: "#FFFFFF", stock: 10 },
      ],
    },
    {
      name: "Suede Chelsea Boots",
      slug: "suede-chelsea-boots",
      description: "Chelsea boots handcrafted in Portugal from water-resistant calf suede. Finished with elasticated side panels and pull tabs for easy wear.",
      brand: "LUXE",
      price: 1599000,
      sku: "LX-SCB-015",
      weight: 950,
      stock: 20,
      isFeatured: true,
      isNewArrival: true,
      categoryId: categories[3].id,
      images: ["https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=600&auto=format&fit=crop"],
      variants: [
        { size: "41", color: "Taupe", colorHex: "#B38B6D", stock: 10 },
        { size: "42", color: "Taupe", colorHex: "#B38B6D", stock: 10 },
      ],
    },
    {
      name: "Handcrafted Leather Sandals",
      slug: "handcrafted-leather-sandals",
      description: "Minimalist slide sandals made from vegetable-tanned straps that will patina beautifully over time. Features an ergonomic leather-lined cork footbed.",
      brand: "LUXE",
      price: 599000,
      sku: "LX-HLS-016",
      weight: 450,
      stock: 35,
      isFeatured: false,
      isNewArrival: false,
      categoryId: categories[3].id,
      images: ["https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=600&auto=format&fit=crop"],
      variants: [
        { size: "40", color: "Brown", colorHex: "#8B4513", stock: 15 },
        { size: "41", color: "Brown", colorHex: "#8B4513", stock: 20 },
      ],
    },
  ];

  for (const item of productsData) {
    const product = await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        description: item.description,
        brand: item.brand,
        price: item.price,
        sku: item.sku,
        weight: item.weight,
        stock: item.stock,
        isFeatured: item.isFeatured,
        isNewArrival: item.isNewArrival,
        categoryId: item.categoryId,
        images: {
          create: item.images.map((url, index) => ({
            url,
            publicId: `luxe/products/${item.slug}_${index}`,
            order: index,
          })),
        },
        variants: {
          create: item.variants.map((v) => ({
            size: v.size,
            color: v.color,
            colorHex: v.colorHex,
            stock: v.stock,
          })),
        },
      },
    });

    console.log(`Created product: ${product.name}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
