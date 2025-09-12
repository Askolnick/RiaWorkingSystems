const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'avriel@kionnali.com';
  const newPassword = 'password123';
  
  console.log(`Resetting password for ${email}...`);
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
  
  console.log('Password reset successfully!');
  console.log('\nYou can now sign in with:');
  console.log(`Email: ${email}`);
  console.log(`Password: ${newPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });