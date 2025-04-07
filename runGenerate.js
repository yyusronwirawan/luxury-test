import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;
const PEPPER = "default-pepper-value"; // <-- PEPPER barumu
const password = "adminmps123"; // <-- password asli user

async function run() {
  const pepperedPassword = password + PEPPER;
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(pepperedPassword, salt);

  console.log("New password hash:", hash);
}

run();
