import { DateResolver, DateTimeResolver } from 'graphql-scalars';
import { Context } from "../../context";

const typeDefs = `#graphql
    extend type Query {
        getAll_web_galeria(first: Int, after: String, filter: String): webGaleriaConnection!
        getOne_web_galeria(gal_id: Int!): web_galeria
    }

    extend type Mutation {
        create_web_galeria(galeria: webGaleriaForm!): web_galeria!
        update_web_galeria(gal_id: Int!, fieldName: String!, value: String): web_galeria!
    }

    type web_galeria {
        gal_id: Int!
        gal_web: Int!
        gal_img: String!
        gal_st: Int
        gal_usu_create: String
        gal_fecha_create: DateTime
        gal_usu_update: String
        gal_fecha_update: DateTime
        web: web
    }

    type webGaleriaConnection {
        edges: [webGaleriaEdge!]!
        pageInfo: PageInfo!
    }

    type webGaleriaEdge {
        cursor: String!
        node: web_galeria!
    }

    type PageInfo {
        endCursor: String!
        hasNextPage: Boolean!
    }

    input webGaleriaForm {
        gal_web: Int!
        gal_img: String!
        gal_st: Int
        gal_usu_create: String
        gal_fecha_create: DateTime
        gal_usu_update: String
        gal_fecha_update: DateTime
    }
    
    scalar DateTime
    scalar Date
    scalar Decimal
`

interface web_galeria {
    gal_id: number;
    gal_web: number;
    gal_img: string;
    gal_st: number | null;
    gal_usu_create: string | null;
    gal_fecha_create: Date | null;
    gal_usu_update: string | null;
    gal_fecha_update: Date | null;
}

interface formWebGaleria {
    gal_web: number;
    gal_img: string;
    gal_st: number | null;
    gal_usu_create: string | null;
    gal_fecha_create: Date | null;
    gal_usu_update: string | null;
    gal_fecha_update: Date | null;
}

interface webGaleriaConnection {
    edges: { node: web_galeria; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

interface webGaleriaPageFilter {
    first?: number;
    after?: string | null;
    filter?: string | null;
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getAll_web_galeria: async (
            _parent: unknown,
            { first = 10, after = null, filter = "" }: webGaleriaPageFilter,
            context: Context
        ): Promise<webGaleriaConnection> => {
            const take = Math.min(first, 100); // Límite máximo de registros
            const decodedCursor = after ? parseInt(Buffer.from(after, 'base64').toString('ascii')) : null;

            try {
                const galerias = await context.prisma.web_galeria.findMany({
                    where: filter ? {
                        gal_img: {
                            contains: filter
                        }
                    } : {},
                    orderBy: { gal_id: 'desc' },
                    cursor: decodedCursor ? { gal_id: decodedCursor } : undefined,
                    skip: decodedCursor ? 1 : 0,
                    take: take + 1 // Obtener un registro extra para determinar `hasNextPage`
                });
                // Determinar si hay más páginas
                const hasNextPage = galerias.length > take;
                if (hasNextPage) galerias.pop(); // Quitar el registro extra

                // Crear edges con nodos y cursores
                const edges = galerias.map((galeria: any) => ({
                    node: galeria,
                    cursor: Buffer.from(galeria.gal_id.toString()).toString('base64'),
                }));

                // Obtener el cursor final
                const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

                return {
                    edges,
                    pageInfo: {
                        hasNextPage,
                        endCursor,
                    },
                } as webGaleriaConnection;
            } catch (error) {
                console.error('Error al obtener galerías:', error);
                throw new Error('Error al obtener galerías');
            }
        },
        getOne_web_galeria: async (_parent: unknown, _args: { gal_id: number }, context: Context) => {
            if (!_args.gal_id) throw new Error('ID de galería no proporcionado')
            if (isNaN(_args.gal_id)) throw new Error('ID de galería debe ser un número válido')

            try {
                const resp = await context.prisma.web_galeria.findUnique({
                    where: {
                        gal_id: _args.gal_id
                    }
                })
                return resp
            } catch (error) {
                throw new Error(`Registro no encontrado ${error}`)
            }
        }
    },
    Mutation: {
        create_web_galeria: async (_parent: unknown, { galeria }: { galeria: formWebGaleria }, context: Context): Promise<web_galeria> => {
            try {
                const newGaleria = await context.prisma.web_galeria.create({
                    data: galeria
                })
                return newGaleria
            } catch (error) {
                console.error('Error al crear galería:', error);
                throw new Error('Error al crear galería');
            }
        },
        update_web_galeria: async (_parent: unknown, { gal_id, fieldName, value }: { gal_id: number, fieldName: string, value: string }, context: Context): Promise<web_galeria> => {
            try {
                const updatedGaleria = await context.prisma.web_galeria.update({
                    where: { gal_id },
                    data: { [fieldName]: value }
                })
                return updatedGaleria
            } catch (error) {
                console.error('Error al actualizar galería:', error);
                throw new Error('Error al actualizar galería');
            }
        }
    },
    web_galeria: {
        web: async (parent: web_galeria, _args: unknown, context: Context) => {
            return await context.prisma.web.findUnique({
                where: {
                    web_id: parent.gal_web
                }
            });
        }
    }
}

export { typeDefs as webGaleriaTypeDefs, resolvers as webGaleriaResolvers }

