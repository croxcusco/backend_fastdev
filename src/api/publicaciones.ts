// model web {
//     web_id                                         Int           @id @default(autoincrement())
//     web_categoria                                  Int
//     web_titulo                                     String        @db.VarChar(45)
//     web_mini_desc                                  String        @db.VarChar(45)
//     web_desc                                       String        @db.VarChar(500)
//     web_img                                        String        @db.VarChar(2048)
//     web_st                                         Int?
//     web_usu_create                                 String?       @db.VarChar(45)
//     web_fecha_create                               DateTime?     @db.DateTime(0)
//     web_usu_update                                 String?       @db.VarChar(45)
//     web_fecha_update                               DateTime?     @db.DateTime(0)
//     web_categoria_web_web_categoriaToweb_categoria web_categoria @relation("web_web_categoriaToweb_categoria", fields: [web_categoria], references: [cat_id], onUpdate: Restrict, map: "fk_web_categoria")
//     web_galeria                                    web_galeria[]

//     @@index([web_categoria], map: "fk_web_categoria_idx")
//   }

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    try {
        const publicaciones = await prisma.web.findMany({
            where: { 
                web_st: 1,
            },
            select: {
                web_id: true,
                web_titulo: true,
                web_mini_desc: true,
                web_desc: true,
                web_img: true,
                web_fecha_create: true,
                web_categoria: true,
                web_categoria_web_web_categoriaToweb_categoria: {
                    select: {
                        cat_id: true,
                        cat_nombre: true,
                    },
                }
            },
            orderBy: {
                web_fecha_create: 'desc',
            },
            skip: skip,
            take: Number(limit),
        });

        const totalPublicaciones = await prisma.web.count({
            where: { 
                web_st: 1,
            },
        });

        res.json({
            total: totalPublicaciones,
            page: Number(page),
            limit: Number(limit),
            data: publicaciones,
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las publicaciones' });
    }
});

export default router;
