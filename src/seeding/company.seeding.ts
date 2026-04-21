import { CompanyModel } from "@hrmssuite/persistence";
import { Hashpassword } from "../common/utils/password.js";
import { mongoDB } from "../DB/connect.js";


const companies = [
  {
    name: "Acme Corp",
    email: "acme@gmail.com",
    password: "Acme@1234",
  },
];

async function seed() {
  await mongoDB();

  for (const company of companies) {
    const exists = await CompanyModel.findOne({ email: company.email });

    if (exists) {
      console.log(`Skipping ${company.email} — already exists`);
      continue;
    }

    const hashedPassword = await Hashpassword(company.password);
    await CompanyModel.create({ ...company, password: hashedPassword });
    console.log(`Seeded: ${company.name}`);
  }

  console.log("Seeding complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});