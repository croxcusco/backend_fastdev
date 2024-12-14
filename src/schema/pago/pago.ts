
import { DateResolver, DateTimeResolver } from "graphql-scalars";
import { Context } from '../../context';
import { Decimal } from "@prisma/client/runtime/library";

const typeDefs = `#graphql
    extend type Query {
        getAll_pagos(first: Int, after: Int, filter: String): PagosConnection
        getOne_pago(pago_id: Int!): pago
    }

    extend type Mutation {
        create_pago(data: formPago): pago
        update_pago(pago_id: Int!, fieldName: String!, value: String!): pago
    }

    type pago {
        pago_id:              Int
        pago_colegiado:       Int
        pago_fecha:           DateTime
        pago_monto_total:     Decimal
        pago_nro_boletaventa: String
        pago_recibo:          String
        pago_notas:           String
        pago_aporte:          Decimal
        pago_otros:           Decimal
        pago_usu_create:      String
        pago_fecha_create:    DateTime
        pago_usu_update:      String
        pago_fecha_update:    DateTime
        aportaciones:         [aportaciones]
        colegiados:           colegiados
        detalle_pago_otros:   [pago_otros]
    }

    type PagosConnection {
        edges: [PagoEdge]
        pageInfo: PageInfo
    }

    type PagoEdge {
        node: pago
        cursor: String
    }

    type PageInfo {
        hasNextPage: Boolean!
        endCursor: String
    }
    
    input formPago {
        pago_colegiado:       Int
        pago_fecha:           DateTime
        pago_monto_total:     Decimal
        pago_nro_boletaventa: String
        pago_recibo:          String
        pago_notas:           String
        pago_aporte:          Decimal
        pago_otros:           Decimal
        pago_usu_create:      String
        pago_fecha_create:    DateTime
        pago_usu_update:      String
        pago_fecha_update:    DateTime
    }

    scalar DateTime
    scalar Date
`

interface pago {
    pago_id: number;
    pago_colegiado: number;
    pago_fecha: Date | null;
    pago_monto_total: Decimal | null;
    pago_nro_boletaventa: string | null;
    pago_recibo: string | null;
    pago_notas: string | null;
    pago_aporte: Decimal | null;
    pago_otros: Decimal | null;
    pago_usu_create: string | null;
    pago_fecha_create: Date | null;
    pago_usu_update: string | null;
    pago_fecha_update: Date | null;
}

interface formPago {
    pago_colegiado: number;
    pago_fecha: Date;
    pago_monto_total: Decimal;
    pago_nro_boletaventa: string;
    pago_recibo: string;
    pago_notas: string;
    pago_aporte: Decimal;
    pago_otros: Decimal;
    pago_usu_create: string;
    pago_fecha_create: Date;
    pago_usu_update: string;
    pago_fecha_update: Date;
}

interface PagosConnection {
    edges: { node: pago; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

interface PagoPageFilter {
    first?: number;
    after?: string | null;
    filter?: string | null;
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getAll_pagos: async (
            _parent: unknown,
            { first = 10, after = null, filter = "" }: PagoPageFilter,
            context: Context
        ): Promise<PagosConnection> => {
            const take = Math.min(first, 100); // Límite máximo de registros
            const decodedCursor = after ? parseInt(Buffer.from(after, 'base64').toString('ascii')) : null;
            const convertido = Number(filter);

            if (typeof filter === 'string' && isNaN(convertido)) {
                //
                try {
                    // Consulta con cursor utilizando raw query
                    const pagos = await context.prisma.$queryRaw<pago[]>`
                        SELECT *
                        FROM pago p
                        inner join colegiados c on c.col_id=p.pago_colegiado
                        inner join persona per on per.per_id=c.col_per_id
                        where CONCAT(per.per_nombre, ' ', per.per_appat, ' ', per.per_apmat) LIKE ${`%${filter}%`}
                        ORDER BY p.pago_id DESC
                        LIMIT ${take + 1} OFFSET ${decodedCursor || 0}
                    `;

                    // Determinar si hay más páginas
                    const hasNextPage = pagos.length > take;
                    if (hasNextPage) pagos.pop(); // Quitar el registro extra

                    // Crear edges con nodos y cursores
                    const edges = pagos.map((pago) => ({
                        node: pago,
                        cursor: Buffer.from(pago.pago_id.toString()).toString('base64'),
                    }));

                    // Obtener el cursor final
                    const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

                    return {
                        edges,
                        pageInfo: {
                            hasNextPage,
                            endCursor,
                        },
                    } as PagosConnection;
                } catch (error) {
                    console.error('Error al obtener pagos:', error);
                    throw new Error('Error al obtener pagos');
                }
            }

            const where = filter ? {
                

            } : {}

            try {
                const pagos = await context.prisma.pago.findMany({
                    where,
                    orderBy: { pago_id: 'desc' },
                    cursor: decodedCursor ? { pago_id: decodedCursor } : undefined,
                    skip: decodedCursor ? 1 : 0,
                    take: take + 1 // Obtener un registro extra para determinar `hasNextPage`
                });
                // Determinar si hay más páginas
                const hasNextPage = pagos.length > take;
                if (hasNextPage) pagos.pop(); // Quitar el registro extra

                // Crear edges con nodos y cursores
                const edges = pagos.map((pago) => ({
                    node: pago,
                    cursor: Buffer.from(pago.pago_id.toString()).toString('base64'),
                }));

                // Obtener el cursor final
                const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

                return {
                    edges,
                    pageInfo: {
                        hasNextPage,
                        endCursor,
                    },
                } as PagosConnection;
            } catch (error) {
                console.error('Error al obtener pagos:', error);
                throw new Error('Error al obtener pagos');
            }
        },
        getOne_pago: async (_parent: unknown, _args: { pago_id: number }, context: Context) => {
            if (!_args.pago_id) throw new Error('ID de pago no proporcionado')
            if (isNaN(_args.pago_id)) throw new Error('ID de pago debe ser un número válido')

            try {
                const resp = await context.prisma.pago.findUnique({
                    where: {
                        pago_id: _args.pago_id
                    }
                })
                return resp
            } catch (error) {
                throw new Error(`Registro no encontrado ${error}`)
            }
        }
    },
    Mutation: {},
    pago: {
        aportaciones: async (_parent: pago, _args: unknown, context: Context) => {
            return await context.prisma.aportaciones.findMany({
                where: {
                    aport_pago: _parent.pago_id
                }
            })
        },
        colegiados: async (_parent: pago, _args: unknown, context: Context) => {
            return await context.prisma.colegiados.findUnique({
                where: {
                    col_id: _parent.pago_colegiado
                }
            })
        },
        detalle_pago_otros: async (_parent: pago, _args: unknown, context: Context) => {
            return await context.prisma.pago_otros.findMany({
                where: {
                    pago_o_pago: _parent.pago_id
                }
            })
        }
    }
}

export { typeDefs as pagoTypeDefs, resolvers as pagoResolvers }