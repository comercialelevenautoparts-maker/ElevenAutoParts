const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({
  path: "c:/Users/TGL Solutions/Desktop/TGL2025/ElevenAutoParts/backend/.env",
});

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

async function check() {
  console.log("Checking products in Supabase...");
  const { data, error } = await supabase
    .from("produtos")
    .select("id, nome, ativo, stripe_price_id, stripe_product_id");

  if (error) {
    console.error("Error fetching products:", error);
    return;
  }

  console.log(`Found ${data.length} products total.`);
  data.forEach((p) => {
    console.log(
      `- ${p.nome}: Active=${p.ativo}, StripePrice=${p.stripe_price_id}, StripeProd=${p.stripe_product_id}`,
    );
  });

  const activeWithStripe = data.filter((p) => p.ativo && p.stripe_price_id);
  console.log(
    `\nProducts that should be visible (Active && StripePrice): ${activeWithStripe.length}`,
  );
}

check();
