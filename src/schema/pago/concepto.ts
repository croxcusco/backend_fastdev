
// model concepto {
//     conc_id           Int          @id @default(autoincrement())
//     conc_nombre       String       @db.VarChar(45)
//     conc_precio       Decimal      @db.Decimal(10, 2)
//     conc_desc         String?      @db.VarChar(45)
//     conc_usu_create   String?      @db.VarChar(45)
//     conc_fecha_create DateTime?    @db.DateTime(0)
//     conc_usu_update   String?      @db.VarChar(45)
//     conc_fecha_update DateTime?    @db.DateTime(0)
//     pago_otros        pago_otros[]
//   }

import { Decimal } from "@prisma/client/runtime/library";
import { DateResolver, DateTimeResolver } from "graphql-scalars";
import { Context } from "../../context";

const typeDefs = `#graphql
    extend type Query {
        getAll_concepto: [concepto]
        getOne_concepto(conc_id: Int!): concepto
    }

    extend type Mutation {
        createConcepto(data: conceptoForm!): concepto
        update_concepto(conc_id: Int!, fieldName: String!, value: String): concepto
    }

    type concepto {
        conc_id: Int!
        conc_nombre: String!
        conc_precio: Decimal!
        conc_desc: String
        conc_usu_create: String
        conc_fecha_create: DateTime
        conc_usu_update: String
        conc_fecha_update: DateTime
        pago_otros: [pago_otros]
    }

    input conceptoForm {
        conc_nombre: String!
        conc_precio: Decimal!
        conc_desc: String
        conc_usu_create: String
        conc_fecha_create: DateTime
        conc_usu_update: String
        conc_fecha_update: DateTime
    }

    scalar DateTime
    scalar Date
`

interface concepto {
    conc_id: number;
    conc_nombre: string;
    conc_precio: Decimal;
    conc_desc: string | null;
    conc_usu_create: string | null;
    conc_fecha_create: Date | null;
    conc_usu_update: string | null;
    conc_fecha_update: Date | null;
}

interface conceptoForm {
    conc_nombre: string;
    conc_precio: Decimal;
    conc_desc: string;
    conc_usu_create: string;
    conc_fecha_create: Date;
    conc_usu_update: string;
    conc_fecha_update: Date;
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getAll_concepto: async (
            _parent: unknown,
            _args: unknown,
            context: Context
        ): Promise<concepto[]> => {
            try {
                return await context.prisma.concepto.findMany();
            } catch (error) {
                throw new Error(`Error al obtener los conceptos: ${error}`);
            }
        },
        getOne_concepto: async (
            _parent: unknown,
            { conc_id }: { conc_id: number },
            context: Context
        ): Promise<concepto | null> => {
            return await context.prisma.concepto.findUnique({
                where: { conc_id },
            });
        },
    },
    Mutation: {
        createConcepto: async (
            _parent: unknown,
            { data }: { data: conceptoForm },
            context: Context
        ): Promise<concepto> => {
            try {
                return await context.prisma.concepto.create({
                    data,
                });
            } catch (error) {
                throw new Error(`Error al crear el concepto: ${error}`);
            }
        },
        update_concepto: async (
            _parent: unknown,
            { conc_id, fieldName, value }: { conc_id: number; fieldName: string; value: string },
            context: Context
        ): Promise<concepto> => {
            const fieldTypes: { [key: string]: string } = {
                conc_nombre: "string",
                conc_precio: "Decimal",
                conc_desc: "string",
                conc_usu_create: "string",
                conc_fecha_create: "Date",
                conc_usu_update: "string",
                conc_fecha_update: "Date",
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
                    break;
                case 'Decimal':
                    // Asumimos que el valor es una fecha en formato string, lo convertimos a Date
                    const decimalValue: Decimal = new Decimal(value);
                    formattedValue = decimalValue;
                    // En este caso, solo aseguramos que el valor sea una cadena
                    if (typeof value !== 'string') throw new Error(`El valor de ${fieldName} debe ser un string.`)
                default:
                    throw new Error(`Tipo de dato desconocido para el campo ${fieldName}.`);
            }

            try {
                const updatedConcepto = await context.prisma.concepto.update({
                    where: { conc_id },
                    data: {
                        // Usamos la clave del campo dinámicamente para actualizar solo ese campo
                        [fieldName]: formattedValue,
                        conc_fecha_update: new Date(),
                        conc_usu_update: "admin"
                    },
                });
                return updatedConcepto;
            } catch (error) {
                throw new Error(`Error al actualizar el concepto: ${error}`);
            }

        },
    },
    concepto: {
        pago_otros: async (_parent: concepto, _args: any, context: Context) => {
            return await context.prisma.pago_otros.findMany({
                where: {
                    // pago_concepto: _parent.conc_id
                }
            })
        }
    }
}
