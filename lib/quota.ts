import { prisma } from "./prisma";

export async function checkQuota(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  if (user.role === "admin") return;

  if (user.usageCount >= user.usageLimit) {
    throw new Error("Usage limit reached. Upgrade required.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { usageCount: { increment: 1 } },
  });
}
