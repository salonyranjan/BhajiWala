import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const menu = [
  ["Pav Bhaji", "Buttery, spicy Maharashtrian street-style bhaji with toasted pav", "SNACKS", 60, true, "SPICY", "Spicy,Vegetarian,Chef's Special"],
  ["Chowmein", "Wok-tossed noodles with crunchy vegetables", "SNACKS", 100, true, "MEDIUM", "Vegetarian,Comfort Food"],
  ["Samosa Chat", "Crushed samosa with yogurt, chutneys, and sev", "SNACKS", 50, true, "MEDIUM", "Vegetarian,Chef's Special"],
  ["Samosa", "Crispy potato-stuffed pastry", "SNACKS", 15, true, "MILD", "Vegetarian,Tea Time"],
  ["Momo", "Steamed or fried vegetable dumplings", "SNACKS", 50, true, "MEDIUM", "Vegetarian,Spicy"],
  ["Burger", "Desi-style crispy veg burger", "SNACKS", 50, true, "MILD", "Vegetarian,Comfort Food"],
  ["Chips", "Classic packaged crunchy chips", "MUNCHIES", 20, true, "MILD", "Vegetarian,Quick Bite"],
  ["Kurkure", "Masala corn puff snack", "MUNCHIES", 20, true, "SPICY", "Vegetarian,Spicy"],
  ["Masala Chai", "Slow-brewed fragrant Indian spiced tea", "BEVERAGES", 15, true, "MILD", "Vegetarian,Chef's Special"],
  ["Coffee", "Fresh, comforting hot coffee", "BEVERAGES", 20, true, "MILD", "Vegetarian"],
  ["Bottled/Canned Beverages", "Chilled soft drinks and packaged beverages", "BEVERAGES", 40, true, "MILD", "Vegetarian,Cold"],
] as const;

async function main() {
  for (const [name, description, category, price, isVegetarian, spiceLevel, tags] of menu) {
    await prisma.menuItem.upsert({
      where: { name },
      update: { description, category, price, isVegetarian, spiceLevel, tags },
      create: { name, description, category, price, isVegetarian, spiceLevel, tags },
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
