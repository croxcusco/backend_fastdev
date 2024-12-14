// model aportaciones {
//     aport_id           Int        @id @default(autoincrement())
//     aport_colegiado    Int
//     aport_pago         Int
//     aport_periodo      Int
//     aport_mes          Int
//     aport_monto        Decimal    @db.Decimal(10, 2)
//     aport_fecha        DateTime   @db.DateTime(0)
//     aport_usu_create   String?    @db.VarChar(45)
//     aport_fecha_create DateTime?  @db.DateTime(0)
//     aport_usu_update   String?    @db.VarChar(45)
//     aport_fecha_update DateTime?  @db.DateTime(0)
//     colegiados         colegiados @relation(fields: [aport_colegiado], references: [col_id], onUpdate: Restrict, map: "fk_aport_colegiado")
//     pago               pago       @relation(fields: [aport_pago], references: [pago_id], onUpdate: Restrict, map: "fk_aport_pago")
//     periodos           periodos   @relation(fields: [aport_periodo], references: [period_id], onUpdate: Restrict, map: "fk_aport_periodo")

import { DateResolver, DateTimeResolver } from "graphql-scalars";
import { Context } from "../../context";

import { Decimal } from "@prisma/client/runtime/library";

//     @@index([aport_colegiado], map: "fk_aport_colegiado_idx")
//     @@index([aport_pago], map: "fk_aport_pago_idx")
//     @@index([aport_periodo], map: "fk_aport_periodo_idx")
//   }

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
    Query: {
        getOne_aportaciones: async (
            _parent: unknown,
            { aport_id }: { aport_id: number },
            context: Context
        ): Promise<aportaciones | null> => {
            return await context.prisma.aportaciones.findUnique({
                where: { aport_id },
            });
        },
    },
    aportaciones: {
        colegiados: async (
            { aport_colegiado }: aportaciones,
            _args: unknown,
            context: Context
        ) => {
            return await context.prisma.colegiados.findUnique({
                where: { col_id: aport_colegiado },
            });
        },
        pago: async (
            { aport_pago }: aportaciones,
            _args: unknown,
            context: Context
        ) => {
            return await context.prisma.pago.findUnique({
                where: { pago_id: aport_pago },
            });
        },
        periodos: async (
            { aport_periodo }: aportaciones,
            _args: unknown,
            context: Context
        ) => {
            return await context.prisma.periodos.findUnique({
                where: { period_id: aport_periodo },
            });
        },
    },
};

export { typeDefs as aportacionesTypeDefs, resolvers as aportacionesResolvers };

