import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== Database Query Test ===");
  
  // 1. Get all categories
  const categories = await prisma.category.findMany();
  console.log(`Categories found: ${categories.length}`);
  categories.forEach(c => console.log(` - [${c.id}] ${c.name} (slug: ${c.slug})`));

  // 2. Query products for category "men"
  const menSlug = "men";
  console.log(`\nQuerying products with category slug: "${menSlug}"`);
  
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      category: {
        slug: menSlug
      }
    },
    include: {
      category: true
    }
  });

  console.log(`Products found under "${menSlug}": ${products.length}`);
  products.forEach(p => console.log(` - ${p.name} (Price: ${p.price}, Category: ${p.category.name})`));

  // 3. Test sorting
  console.log("\n=== Testing Sorting ===");
  const productsSortedAsc = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
    take: 3
  });
  console.log("Sort Price Ascending:");
  productsSortedAsc.forEach(p => console.log(` - ${p.name}: Rp ${p.price}`));

  const productsSortedDesc = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { price: "desc" },
    take: 3
  });
  console.log("Sort Price Descending:");
  productsSortedDesc.forEach(p => console.log(` - ${p.name}: Rp ${p.price}`));
}

main()
  .catch(e => console.error("Error running test query:", e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
