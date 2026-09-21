import { Resend } from "resend";
import fs from "fs";
import path from "path";

// Load .env.local if not already in process.env
if (!process.env.RESEND_API_KEY) {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || "";
          value = value.trim().replace(/^["']|["']$/g, "");
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  } catch {}
}

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.error("Error: RESEND_API_KEY is not set in .env.local or environment.");
  process.exit(1);
}

const resend = new Resend(apiKey);

async function main() {
  console.log("Sending test email via Resend to wefikworld@gmail.com...");
  const result = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    to: "wefikworld@gmail.com",
    subject: "Hello World",
    html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
  });

  if (result.error) {
    console.error("Resend delivery failed:", result.error);
  } else {
    console.log("Resend delivery SUCCESS! Message ID:", result.data?.id);
  }
}

main().catch(console.error);
