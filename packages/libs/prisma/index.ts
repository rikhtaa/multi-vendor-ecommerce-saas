import { PrismaClient } from "@prisma/client";

declare global {
    var prismadb: PrismaClient | undefined
}

const prisma = globalThis.prismadb ?? new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
} as any)

if(process.env.NODE_ENV !== "production") globalThis.prismadb = prisma
export default prisma