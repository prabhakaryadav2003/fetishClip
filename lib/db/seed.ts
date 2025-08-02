import { db } from "./drizzle";
import { users, plans } from "./schema";
import { hashPassword } from "@/lib/auth/session";
import { createPayPalPlan } from "@/lib/payments/createPlan";
import { createPayPalProduct } from "@/lib/payments/createProductId";

async function seed() {
  const email = "test@test.com";
  const password = "admin123";
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values([
      {
        email: email,
        passwordHash: passwordHash,
        role: "owner",
      },
    ])
    .returning();

  console.log("Initial user created:", user);

  console.log("Seeding PayPal product and plans...");

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

  console.log("Seeding completed!");
}

seed()
  .catch((error) => {
    console.error("Seed process failed:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seed process finished. Exiting...");
    process.exit(0);
  });
