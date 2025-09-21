import { db } from "./drizzle";
import { users, plans } from "./schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/session";
import { createPayPalPlan } from "@/lib/payments/createPlan";
import { createPayPalProduct } from "@/lib/payments/createProductId";

async function seedAdmin() {
  const email = "test@test.com";
  const password = "admin123";

  // Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  if (existingUser.length > 0) {
    console.log("Admin user already exists, skipping...");
    return;
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values([
      {
        email,
        passwordHash,
        role: "owner",
      },
    ])
    .returning();

  console.log("Admin user created:", user);
}

async function seedPlan() {
  console.log("Seeding PayPal product and plans...");

  // Check if plans already exist
  const existingPlans = await db.select().from(plans);
  if (existingPlans.length > 0) {
    console.log("Plans already exist, skipping...");
    return;
  }

  // Create PayPal Product
  const productId = await createPayPalProduct({
    name: "Video Content Platform",
    description: "Subscription to premium video streaming service",
  });
  console.log("Product created:", productId);

  // Create PayPal Plans
  const planConfigs = [
    { name: "Monthly Plan", description: "Billed monthly", price: "9.99" },
    { name: "Annual Plan", description: "Billed yearly", price: "99.99" },
  ];

  for (const config of planConfigs) {
    const paypalPlanId = await createPayPalPlan(
      config.name,
      config.description,
      config.price,
      productId
    );

    await db.insert(plans).values({
      name: config.name,
      description: config.description,
      price: config.price,
      paypalPlanId,
    });

    console.log(
      `Plan "${config.name}" created with PayPal ID: ${paypalPlanId}`
    );
  }

  console.log("🎉 Seeding Plan completed!");
}

async function main() {
  try {
    await seedAdmin();
    await seedPlan();
    console.log("🚀 All seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

main();
