import { PrismaClient} from '@prisma/client';
// import { PrismaClient as PrismaClient1 } from '@prisma/client1';
// import { PrismaClient as PrismaClient2 } from '@prisma/client2';
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from '@apollo/server/standalone';
import { context } from "./context";
import { typeDefs, resolvers } from './schema'
import moment from "moment-timezone";

const prisma01 = new PrismaClient()
// const prisma02 = new PrismaClient2()

async function startApolloServer() {

    const server = new ApolloServer({
        typeDefs,
        resolvers,
    })

    const { url } = await startStandaloneServer(server, {
        context: context,
        listen: {
            port: parseInt(process.env.PORT || '4000'),
        },
    });

    // Configurar la zona horaria
    const timezone = process.env.TIMEZONE || 'America/Lima';
    moment.tz.setDefault(timezone);

    console.log(`🚀 Servidor corriendo en: ${url} en la zona horaria ${timezone}`)
}

startApolloServer()
    .catch(async (e) => {
        await prisma01.$disconnect()
        // await prisma02.$disconnect()
        throw e
    })
    .finally(async () => {
        await prisma01.$disconnect()
        // await prisma02.$disconnect()
    })
