import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";
import * as bcrypt from "bcrypt";

dotenv.config({ path: path.join(process.cwd(), '.env') });

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001/api/auth",
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password: string) => {
        return bcrypt.hash(password, 10);
      },
      verify: async (data: { password: string; hash: string }) => {
        return bcrypt.compare(data.password, data.hash);
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "https://butterfast.com",
    "https://api.butterfast.com",
  ],
});
