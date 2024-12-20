// model web {
//     web_id           Int       @id @default(autoincrement())
//     web_categoria    String    @db.VarChar(45)
//     web_titulo       String    @db.VarChar(100)
//     web_mini_desc    String?   @db.VarChar(100)
//     web_desc         String?   @db.VarChar(500)
//     web_img_portada  String?   @db.VarChar(100)
//     web_img          String?   @db.VarChar(100)
//     web_st           Int?
//     web_portada      Int
//     web_usu_create   String?   @db.VarChar(45)
//     web_fecha_create DateTime? @db.DateTime(0)
//     web_usu_update   String?   @db.VarChar(45)
//     web_fecha_update DateTime? @db.DateTime(0)
//   }

import { DateResolver, DateTimeResolver } from 'graphql-scalars';
import { Context } from '../../context';

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
        web_categoria: String!
        web_titulo: String!
        web_mini_desc: String
        web_desc: String
        web_img_portada: String
        web_img: String
        web_st: Int
        web_portada: Int
        web_usu_create: String
        web_fecha_create: DateTime
        web_usu_update: String
        web_fecha_update: DateTime
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
        web_categoria: String!
        web_titulo: String!
        web_mini_desc: String
        web_desc: String
        web_img_portada: String
        web_img: String
        web_st: Int
        web_portada: Int
    }
    
    scalar DateTime
    scalar Date
    scalar Decimal
`

interface web {
    web_id: number
    web_categoria: string
    web_titulo: string
    web_mini_desc: string
    web_desc: string
    web_img_portada: string
    web_img: string
    web_st: number
    web_portada: number
    web_usu_create: string
    web_fecha_create: Date
    web_usu_update: string
    web_fecha_update: Date
}

interface formWeb {
    web_categoria: string
    web_titulo: string
    web_mini_desc: string
    web_desc: string
    web_img_portada: string
    web_img: string
    web_st: number
    web_portada: number
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
                const edges = webs.map((web:any) => ({
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
    }
}

export { typeDefs as webTypeDefs, resolvers as webResolvers }