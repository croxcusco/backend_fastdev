// import { PrismaClient as PrismaClient1 } from '@prisma/client1';
// import { PrismaClient as PrismaClient2 } from '@prisma/client2';
import { PrismaClient } from '@prisma/client';
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from '@apollo/server/express4';
import { context } from "./context";
import { typeDefs, resolvers } from './schema';
import express from 'express';
import cors from 'cors';
import apiRouter from './api/upload';

const prisma01 = new PrismaClient();
// const prisma02 = new PrismaClient2();

async function startApolloServer() {
    const app = express();

    app.use(cors({
        origin: 'http://localhost:5173', // Reemplaza con la URL de tu frontend
        credentials: true,
    }));
    app.use(express.json());

    // Usar el router de la API
    app.use('/api', apiRouter);

    // Ruta para GraphQL
    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    await server.start();

    app.use("/graphql", expressMiddleware(server, { context: context }));

    const PORT = parseInt(process.env.PORT || '4000');
    app.listen(PORT, () => {
        console.log(`🚀 Servidor GraphQL en http://localhost:${PORT}/graphql`);
        console.log(`📂 API de archivos en http://localhost:${PORT}/api/upload`);
    });
}

startApolloServer()
    .catch(async (e) => {
        await prisma01.$disconnect();
        // await prisma02.$disconnect();
        throw e;
    })
    .finally(async () => {
        await prisma01.$disconnect();
        // await prisma02.$disconnect();
    });
