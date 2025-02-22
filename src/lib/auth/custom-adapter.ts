import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { Adapter } from "next-auth/adapters";

export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
  const prismaAdapter = PrismaAdapter(prisma);
  
  return {
    ...prismaAdapter,
    getUser: async (id: string) => {
      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          image: true,
        },
      });
      return user;
    },
    getUserByEmail: async (email: string) => {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          image: true,
        },
      });
      return user;
    },
    getUserByAccount: async ({ providerAccountId, provider }) => {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            providerAccountId,
            provider,
          },
        },
        select: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
              emailVerified: true,
              image: true,
            },
          },
        },
      });
      return account?.user ?? null;
    },
    createUser: async (data) => {
      const user = await prisma.user.create({
        data: {
          ...data,
          role: 'SALES', // Default role for new users
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          image: true,
        },
      });
      return user;
    },
    updateUser: async (data) => {
      const { id, ...userData } = data;
      const user = await prisma.user.update({
        where: { id },
        data: userData,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          image: true,
        },
      });
      return user;
    },
  };
}
