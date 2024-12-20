import { DateResolver, DateTimeResolver } from "graphql-scalars";
import { Context } from "../../context";
import { Decimal } from "@prisma/client/runtime/library";

const typeDefs = `#graphql
    extend type Query {
        getOne_aportaciones(aport_id: Int!): aportaciones
    }

    type aportaciones {
        aport_id: Int
        aport_colegiado: Int
        aport_pago: Int
        aport_periodo: Int
        aport_mes: Int
        aport_monto: Decimal
        aport_fecha: DateTime
        aport_usu_create: String
        aport_fecha_create: DateTime
        aport_usu_update: String
        aport_fecha_update: DateTime
        colegiados: colegiados
        pago: pago
        periodos: periodos
    }
    
    scalar DateTime
    scalar Date
    scalar Decimal
`;

interface aportaciones {
    aport_id: number;
    aport_colegiado: number;
    aport_pago: number;
    aport_periodo: number;
    aport_mes: number;
    aport_monto: Decimal;
    aport_fecha: Date | null;
    aport_usu_create: string | null;
    aport_fecha_create: Date | null;
    aport_usu_update: string | null;
    aport_fecha_update: Date | null;
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    // Decimal: ,
    Query: {
        getOne_aportaciones: async (_parent: unknown, { aport_id }: { aport_id: number }, context: Context): Promise<aportaciones | null> => {
            return await context.prisma.aportaciones.findUnique({
                where: { aport_id },
            });
        },
    },
    aportaciones: {
        colegiados: async ({ aport_colegiado }: aportaciones, _args: unknown, context: Context) => {
            return await context.prisma.colegiados.findUnique({
                where: { col_id: aport_colegiado },
            });
        },
        pago: async ({ aport_pago }: aportaciones, _args: unknown, context: Context) => {
            return await context.prisma.pago.findUnique({
                where: { pago_id: aport_pago },
            });
        },
        periodos: async ({ aport_periodo }: aportaciones, _args: unknown, context: Context) => {
            return await context.prisma.periodos.findUnique({
                where: { period_id: aport_periodo },
            });
        },
    },
};

export { typeDefs as aportacionesTypeDefs, resolvers as aportacionesResolvers };

