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
import { DateResolver, DateTimeResolver } from 'graphql-scalars';
import { Context } from '../../context';
import { v2 as cloudinary } from 'cloudinary';

const typeDefs = `#graphql
    extend type Query {
        getAll_web(first: Int, after: String, filter: String): webConnection!
        getOne_web(web_id: Int!): web
    }

    extend type Mutation {
        create_web(web: webForm!): web!
        update_web(web_id: Int!, fieldName: String!, value: String): web!
    }

    type web {
        web_id: Int!
        web_categoria: Int!
        web_titulo: String!
        web_mini_desc: String!
        web_desc: String!
        web_img: String!
        web_st: Int
        web_usu_create: String
        web_fecha_create: DateTime
        web_usu_update: String
        web_fecha_update: DateTime
        tabweb_categoria: web_categoria
        web_galeria: [web_galeria]
    }

    type webConnection {
        edges: [webEdge!]!
        pageInfo: PageInfo!
    }

    type webEdge {
        cursor: String!
        node: web!
    }

    type PageInfo {
        endCursor: String!
        hasNextPage: Boolean!
    }

    input webForm {
        web_categoria: Int!
        web_titulo: String!
        web_mini_desc: String!
        web_desc: String!
        web_img: String!
        web_st: Int
        web_usu_create: String
        web_fecha_create: DateTime
        web_usu_update: String
        web_fecha_update: DateTime
    }
    
    scalar DateTime
    scalar Date
`

interface web {
    web_id: number;
    web_categoria: number;
    web_titulo: string;
    web_mini_desc: string;
    web_desc: string;
    web_img: string;
    web_st: number | null;
    web_usu_create: string | null;
    web_fecha_create: Date | null;
    web_usu_update: string | null;
    web_fecha_update: Date | null;
}

interface formWeb {
    web_categoria: number;
    web_titulo: string;
    web_mini_desc: string;
    web_desc: string;
    web_img: string;
    web_st: number | null;
    web_usu_create: string | null;
    web_fecha_create: Date | null;
    web_usu_update: string | null;
    web_fecha_update: Date | null;
}

interface webConnection {
    edges: { node: web; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

interface webPageFilter {
    first?: number;
    after?: string | null;
    filter?: string | null;
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getAll_web: async (
            _parent: unknown,
            { first = 10, after = null, filter = "" }: webPageFilter,
            context: Context
        ): Promise<webConnection> => {
            const take = Math.min(first, 100);
            // Límite máximo de registros
            const decodedCursor = after ? parseInt(Buffer.from(after, 'base64').toString('ascii')) : null;

            try {
                const webs = await context.prisma.web.findMany({
                    where: filter ? {
                        web_titulo: {
                            contains: filter
                        }
                    } : {},
                    orderBy: { web_id: 'desc' },
                    cursor: decodedCursor ? { web_id: decodedCursor } : undefined,
                    skip: decodedCursor ? 1 : 0,
                    take: take + 1 // Obtener un registro extra para determinar `hasNextPage`
                });
                // Determinar si hay más páginas
                const hasNextPage = webs.length > take;
                if (hasNextPage) webs.pop(); // Quitar el registro extra

                // Crear edges con nodos y cursores
                const edges = webs.map((web: any) => ({
                    node: web,
                    cursor: Buffer.from(web.web_id.toString()).toString('base64'),
                }));

                // Obtener el cursor final
                const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

                return {
                    edges,
                    pageInfo: {
                        hasNextPage,
                        endCursor,
                    },
                } as webConnection;
            } catch (error) {
                console.error('Error al obtener webs:', error);
                throw new Error('Error al obtener webs');
            }
        },
        getOne_web: async (_parent: unknown, _args: { web_id: number }, context: Context) => {
            if (!_args.web_id) throw new Error('ID de web no proporcionado')
            if (isNaN(_args.web_id)) throw new Error('ID de web debe ser un número válido')

            try {
                const resp = await context.prisma.web.findUnique({
                    where: {
                        web_id: _args.web_id
                    }
                })
                return resp
            } catch (error) {
                throw new Error(`Registro no encontrado ${error}`)
            }
        }
    },
    Mutation: {
        create_web: async (_parent: unknown, { web }: { web: formWeb }, context: Context): Promise<web> => {
            try {

            } catch (error) {
                console.error('Error al crear web:', error);
                throw new Error('Error al crear web');
            }
        },
        update_web: async (_parent: unknown, { web_id, fieldName, value }: { web_id: number, fieldName: string, value: string }, context: Context): Promise<web> => {
            try {
                let updateData: any = { [fieldName]: value };


            } catch (error) {
                console.error('Error al actualizar web:', error);
                throw new Error('Error al actualizar web');
            }
        }
    },
    web: {
        tabweb_categoria: async (
            parent: web,
            _args: unknown,
            context: Context
        ) => {
            return await context.prisma.web_categoria.findUnique({
                where: {
                    cat_id: parent.web_categoria
                }
            });
        },
        web_galeria: async (
            parent: web,
            _args: unknown,
            context: Context
        ) => {
            return await context.prisma.web_galeria.findMany({
                where: {
                    gal_web: parent.web_id
                }
            });
        }
    }
}

export { typeDefs as webTypeDefs, resolvers as webResolvers }