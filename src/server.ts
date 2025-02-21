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
import publicacionesRouter from './api/publicaciones';

const prisma01 = new PrismaClient();
// const prisma02 = new PrismaClient2();

async function startApolloServer() {
    const app = express();

    const allowedOrigins = ['https://crox.up.railway.app', 'http://localhost:5173']; // Agrega más orígenes aquí

    app.use(cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('No permitido por CORS'));
            }
        },
        credentials: true,
    }));
    app.use(express.json());

    // Usar el router de la API
    app.use('/api', apiRouter);
    app.use('/api/publicaciones', publicacionesRouter);


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
