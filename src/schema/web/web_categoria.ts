// model web_categoria {
//     cat_id                               Int       @id @default(autoincrement())
//     cat_nombre                           String    @db.VarChar(45)
//     cat_st                               Int?
//     cat_usu_create                       String?   @db.VarChar(45)
//     cat_fecha_create                     DateTime? @db.DateTime(0)
//     cat_usu_update                       String?   @db.VarChar(45)
//     cat_fecha_update                     DateTime? @db.DateTime(0)
//     web_web_web_categoriaToweb_categoria web[]     @relation("web_web_categoriaToweb_categoria")
//   }

import { Context } from "../../context";

const typeDefs = `#graphql
    extend type Query {
        getAll_web_categoria: [web_categoria]
    }

    type web_categoria {
        cat_id: Int!
        cat_nombre: String!
        cat_st: Int
        cat_usu_create: String
        cat_fecha_create: DateTime
        cat_usu_update: String
        cat_fecha_update: DateTime
        web: [web]
    }
    
    scalar DateTime
    scalar Date
`

interface web_categoria {
    cat_id: number;
    cat_nombre: string;
    cat_st: number | null;
    cat_usu_create: string | null;
    cat_fecha_create: Date | null;
    cat_usu_update: string | null;
    cat_fecha_update: Date | null;
}


const resolvers = {
    Query: {
        getAll_web_categoria: async (
            _parent: unknown,
            _args: unknown,
            context: Context
        ): Promise<web_categoria[]> => {
            return await context.prisma.web_categoria.findMany();
        }
    },
    web_categoria: {
        web: async (
            parent: web_categoria,
            _args: unknown,
            context: Context
        ) => {
            return await context.prisma.web.findMany({
                where: {
                    web_categoria: parent.cat_id
                }
            });
        }
    }
}

export { typeDefs as web_categoriaTypeDefs, resolvers as web_categoriaResolvers }