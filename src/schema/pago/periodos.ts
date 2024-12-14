// model periodos {
//     period_id           Int            @id @default(autoincrement())
//     period_anio         Int
//     period_cuota        Decimal        @db.Decimal(10, 2)
//     period_desc         String?        @db.VarChar(45)
//     period_usu_create   String?        @db.VarChar(45)
//     period_fecha_create DateTime?      @db.DateTime(0)
//     period_usu_update   String?        @db.VarChar(45)
//     period_fecha_update DateTime?      @db.DateTime(0)
//     aportaciones        aportaciones[]
//   }


import { Decimal } from "@prisma/client/runtime/library";
import { DateResolver, DateTimeResolver } from "graphql-scalars";
import { context, Context } from "../../context";

const typeDefs = `#graphql
    extend type Query {
        getAll_periodos: [periodos!]!
        getOne_periodos(period_id: Int!): periodos
    }

    extend type Mutation {
        create_periodos(data: periodosInput!): periodos!
        update_periodos(period_id: Int!, fieldName: String!, value: String): periodos!
    }

    type periodos {
        period_id: Int!
        period_anio: Int!
        period_cuota: Decimal!
        period_desc: String
        period_usu_create: String
        period_fecha_create: DateTime
        period_usu_update: String
        period_fecha_update: DateTime
        aportaciones: [aportaciones!]!
    }

    input periodosInput {
        period_anio: Int!
        period_cuota: Decimal!
        period_desc: String
        period_usu_create: String
        period_fecha_create: DateTime
        period_usu_update: String
        period_fecha_update: DateTime
    }

    scalar DateTime
    scalar Date
`;

interface periodo {
    period_id: number;
    period_anio: number;
    period_cuota: Decimal;
    period_desc: string | null;
    period_usu_create: string | null;
    period_fecha_create: Date | null;
    period_usu_update: string | null;
    period_fecha_update: Date | null;
}

interface periodoForm {
    period_anio: number;
    period_cuota: Decimal;
    period_desc: string;
    period_usu_create: string;
    period_fecha_create: Date;
    period_usu_update: string;
    period_fecha_update: Date;
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getAll_periodos: async (_parent: unknown, _args: unknown, context: Context): Promise<periodo[]> => {
            try {
                return await context.prisma.periodos.findMany();
            } catch (error) {
                throw new Error(`Error al obtener los periodos: ${error}`);
            }
        },
        getOne_periodos: async (
            _parent: unknown,
            { period_id }: { period_id: number },
            context: Context
        ): Promise<periodo | null> => {
            try {
                return await context.prisma.periodos.findUnique({
                    where: { period_id },
                });
            } catch (error) {
                throw new Error(`Error al obtener el periodo: ${error}`);
            }
        },
    },
    Mutation: {
        create_periodos: async (_parent: unknown,
            { data }: { data: periodoForm },
            context: Context): Promise<periodo> => {
            try {
                return await context.prisma.periodos.create({
                    data,
                });
            } catch (error) {
                throw new Error(`Error al crear el periodo: ${error}`);
            }
        },
        update_periodos: async (
            _parent: unknown,
            { period_id, fieldName, value }: { period_id: number; fieldName: string; value: string },
            context: Context
        ): Promise<periodo> => {
            const fieldTypes: { [key: string]: string } = {
                period_anio: "number",
                period_cuota: "Decimal",
                period_desc: "string",
                period_usu_create: "string",
                period_fecha_create: "Date",
                period_usu_update: "string",
                period_fecha_update: "Date",
            }

            // Verificar si el campo existe en la lista de campos válidos
            if (!(fieldName in fieldTypes)) {
                throw new Error(`El campo ${fieldName} no es válido para actualización.`);
            }

            // Validación y conversión del valor dependiendo del tipo de campo
            let formattedValue: number | string | Date | Decimal = value;
            switch (fieldTypes[fieldName]) {
                case 'number':
                    formattedValue = +value
                    if (isNaN(formattedValue)) throw new Error(`El valor de ${fieldName} debe ser un número válido.`)
                    break;
                case 'Date':
                    // Asumimos que el valor es una fecha en formato string, lo convertimos a Date                    
                    const dateValue: Date = new Date(value);
                    formattedValue = dateValue;
                    if (isNaN(dateValue.getTime())) throw new Error(`El valor de ${fieldName} debe ser una fecha válida.`)
                    break;
                case 'string':
                    // En este caso, solo aseguramos que el valor sea una cadena
                    if (typeof value !== 'string') throw new Error(`El valor de ${fieldName} debe ser un string.`)
                default:
                    throw new Error(`Tipo de dato desconocido para el campo ${fieldName}.`);
            }

            try {
                const updatedPeriodo = await context.prisma.periodos.update({
                    where: { period_id },
                    data: {
                        // Usamos la clave del campo dinámicamente para actualizar solo ese campo
                        [fieldName]: formattedValue,
                        period_fecha_update: new Date(),
                        period_usu_update: "admin"
                    },
                });
                return updatedPeriodo;
            } catch (error) {
                throw new Error(`Error al actualizar el periodo: ${error}`);
            }

        },
        periodos: {
            aportaciones: async (_parent: periodo, _args: any, context: Context) => {
                return await context.prisma.aportaciones.findMany({
                    where: {
                        aport_periodo: _parent.period_id
                    }
                })
            }
        }
    }
}

export { typeDefs as periodosTypeDefs, resolvers as periodosResolvers}


