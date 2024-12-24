import { PrismaClient } from '@prisma/client';
// import { PrismaClient as PrismaClient1 } from '@prisma/client1';
// import { PrismaClient as PrismaClient2 } from '@prisma/client2';

const prisma = new PrismaClient()

interface Context {
    prisma: PrismaClient
    // prisma2: PrismaClient2
    req: any
}
function context(req: any) {
    return {
        ...req,
        prisma
    }
}

export { Context, context }