import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  await prisma.user.update({
    where: { email: 'testcurl99@example.com' },
    data: { role: 'admin', status: 'approved', verified: true }
  });
  console.log("Updated.");
}
run();
