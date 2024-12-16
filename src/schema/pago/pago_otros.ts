import { DateResolver, DateTimeResolver, PositiveFloatResolver } from "graphql-scalars";
import { Context } from "../../context";
import { Decimal } from "@prisma/client/runtime/library";

const typeDefs = `#graphql
    extend type Query {
        getAll_pago_otros: [pago_otros]
        getOne_pago_otros(pago_o_id: Int!): pago_otros
    }

    type pago_otros {
        pago_o_id:           Int
        pago_o_pago:         Int
        pago_o_concepto:     Int
        pago_o_desc:         String
        pago_o_importe:      Decimal
        pago_o_usu_create:   String
        pago_o_fecha_create: DateTime
        pago_o_usu_update:   String
        pago_o_fecha_update: DateTime
        concepto:            concepto
        pago:                pago
    }
    
    scalar DateTime
    scalar Date
    scalar Decimal
`

interface pago_otros {
    pago_o_id: number;
    pago_o_pago: number;
    pago_o_concepto: number;
    pago_o_desc: string | null;
    pago_o_importe: Decimal | null;
    pago_o_usu_create: string | null;
    pago_o_fecha_create: Date | null;
    pago_o_usu_update: string | null;
    pago_o_fecha_update: Date | null;
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Decimal: PositiveFloatResolver,
    Query: {
        getAll_pago_otros: async (
            _parent: unknown,
            _args: unknown,
            context: Context
        ): Promise<pago_otros[]> => {
            try {
                return await context.prisma.pago_otros.findMany();
            } catch (error) {
                throw new Error(`Error al obtener los pagos_otros: ${error}`);
            }
        },
        getOne_pago_otros: async (
            _parent: unknown,
            { pago_o_id }: { pago_o_id: number },
            context: Context
        ): Promise<pago_otros | null> => {
            return await context.prisma.pago_otros.findUnique({
                where: { pago_o_id },
            });
        },
    },
    pago_otros: {
        concepto: async (parent: pago_otros, _args: unknown, context: Context): Promise<any> => {
            return await context.prisma.concepto.findUnique({
                where: { conc_id: parent.pago_o_concepto },
            });
        },
        pago: async (parent: pago_otros, _args: unknown, context: Context): Promise<any> => {
            return await context.prisma.pago.findUnique({
                where: { pago_id: parent.pago_o_pago },
            });
        },
    },
};

export { typeDefs as pago_otrosTypeDefs, resolvers as pago_otrosResolvers };