import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from 'graphql-scalars';
import { Context } from '../../context';
import { getUserId } from '../../utils';
import { now } from 'moment-timezone';

const typeDefs = `#graphql
    extend type Query {
        getAll_persona(first: Int, after: String, filter: String): PersonaConnection!
        getOne_persona(per_id: Int!): persona
    }

    extend type Mutation {
        create_persona(data: personaForm!): persona
        update_persona(per_id: Int!, fieldName: String!, value: String): persona
        # per_id: number, fieldName: string, value: any
    }
    
    type persona {
        per_id:           Int!
        per_tdoc:         Int!
        per_nro_doc:      String!
        per_nombre:       String!
        per_appat:        String!
        per_apmat:        String
        per_sexo:         String!
        per_correo:       String
        per_nacionalidad: String
        per_direccion1:   String
        per_direccion2:   String
        per_lugar_nac:    String
        per_fech_nac:     String
        per_st:           String
        per_telf:         String
        per_celular1:     String
        per_celular2:     String
        per_fech_create:  DateTime
        per_fech_update:  DateTime
        per_usu_create:   String
        per_usu_update:   String
        tipo_documento:   tipo_documento
        colegiados:       [colegiados]
    }

    type PersonaConnection {
        edges: [PersonaEdge!]!
        pageInfo: PageInfo!
    }

    type PersonaEdge {
        cursor: String!
        node: persona!
    }

    type PageInfo {
        hasNextPage: Boolean!
        endCursor: String
    }

    input personaInput {
        per_tdoc:         Int
        per_nro_doc:      String
        per_nombre:       String
        per_appat:        String
        per_apmat:        String
        per_sexo:         String
        per_correo:       String
        per_nacionalidad: String
        per_direccion1:   String
        per_direccion2:   String
        per_lugar_nac:    String
        per_fech_nac:     String
        per_st:           String
        per_telf:         String
        per_celular1:     String
        per_celular2:     String
    }

    input personaForm {
        col_nro_cop:            String
        col_fecha_colegiatura:  DateTime
        col_st:                 String
        col_obs:                String
        col_centro_trabajo:     String
        per_tdoc:               Int
        per_sexo:               String
        per_nro_doc:            String
        per_nombre:             String
        per_appat:              String
        per_apmat:              String
        per_correo:             String
        per_nacionalidad:       String
        per_direccion1:         String
        per_direccion2:         String
        per_lugar_nac:          String
        per_fech_nac:           String
        per_st:                 String
        per_telf:               String
        per_celular1:           String
        per_celular2:           String
    }

    scalar DateTime
    scalar Date
    scalar JSON
`
interface persona {
    per_id: number;
    per_tdoc: number;
    per_nro_doc: string | null;
    per_nombre: string | null;
    per_appat: string | null;
    per_apmat: string | null;
    per_sexo: string | null;
    per_correo: string | null;
    per_nacionalidad: string | null;
    per_direccion1: string | null;
    per_direccion2: string | null;
    per_lugar_nac: string | null;
    per_fech_nac: string | null;
    per_st: string | null;
    per_telf: string | null;
    per_celular1: string | null;
    per_celular2: string | null;
    per_fech_create: Date | null;
    per_fech_update: Date | null;
    per_usu_create: string | null;
    per_usu_update: string | null;
}

interface formPersona {
    col_nro_cop: string,
    col_fecha_colegiatura: Date,
    col_st: string,
    col_obs: string,
    col_centro_trabajo: string,
    per_tdoc: number,
    per_sexo: string,
    per_nro_doc: string,
    per_nombre: string,
    per_appat: string,
    per_apmat: string,
    per_correo: string,
    per_nacionalidad: string,
    per_direccion1: string,
    per_direccion2: string,
    per_lugar_nac: string,
    per_fech_nac: string,
    per_st: string,
    per_telf: string,
    per_celular1: string,
    per_celular2: string,
}

interface PersonaConnection {
    edges: { node: persona; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

interface PersonaPageFilter {
    first?: number;
    after?: string | null;
    filter?: string | null;
}


const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getAll_persona: async (
            _parent: unknown,
            { first = 10, after = null, filter = "" }: PersonaPageFilter,
            context: Context
        ): Promise<PersonaConnection> => {
            const take = Math.min(first, 100); // Límite máximo de registros
            const decodedCursor = after ? parseInt(Buffer.from(after, 'base64').toString('ascii')) : null;
            const convertido = Number(filter);

            if (typeof filter === 'string' && isNaN(convertido)) {
                // 
                try {
                    // Consulta con cursor utilizando raw query
                    const personas = await context.prisma.$queryRaw<persona[]>`
                        SELECT * 
                        FROM persona
                        WHERE CONCAT(per_nombre, ' ', per_appat, ' ', per_apmat) LIKE ${`%${filter}%`}
                        ORDER BY per_id DESC
                        LIMIT ${take + 1} OFFSET ${decodedCursor || 0}
                    `;

                    // Determinar si hay más páginas
                    const hasNextPage = personas.length > take;
                    if (hasNextPage) personas.pop(); // Quitar el registro extra

                    // Crear edges con nodos y cursores
                    const edges = personas.map((persona) => ({
                        node: persona,
                        cursor: Buffer.from(persona.per_id.toString()).toString('base64'),
                    }));

                    // Obtener el cursor final
                    const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

                    return {
                        edges,
                        pageInfo: {
                            hasNextPage,
                            endCursor,
                        },
                    } as PersonaConnection;
                } catch (error) {
                    console.error('Error al obtener personas:', error);
                    throw new Error('Error al obtener personas');
                }
            }

            // Construcción del filtro dinámico
            const where = filter
                ? {
                    OR: [
                        { per_nro_doc: { contains: filter } },
                        // Filtro por número de colegiado
                        {
                            colegiados: {
                                some: { col_nro_cop: { contains: filter } },
                            },
                        },
                    ],
                }
                : {}; // Sin filtro si `filter` está vacío

            try {
                // Consulta con cursor
                const personas = await context.prisma.persona.findMany({
                    where,
                    orderBy: { per_id: 'desc' },
                    cursor: decodedCursor ? { per_id: decodedCursor } : undefined,
                    skip: decodedCursor ? 1 : 0,
                    take: take + 1 // Obtener un registro extra para determinar `hasNextPage`
                });
                // Determinar si hay más páginas
                const hasNextPage = personas.length > take;
                if (hasNextPage) personas.pop(); // Quitar el registro extra

                // Crear edges con nodos y cursores
                const edges = personas.map((persona) => ({
                    node: persona,
                    cursor: Buffer.from(persona.per_id.toString()).toString('base64'),
                }));

                // Obtener el cursor final
                const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

                return {
                    edges,
                    pageInfo: {
                        hasNextPage,
                        endCursor,
                    },
                } as PersonaConnection;
            } catch (error) {
                console.error('Error al obtener personas:', error);
                throw new Error('Error al obtener personas');
            }
        },
        getOne_persona: async (_parent: unknown, _args: { per_id: number }, context: Context) => {
            // getUserId(context)
            if (!_args.per_id) throw new Error('ID de persona no proporcionado')
            if (isNaN(_args.per_id)) throw new Error('ID de persona debe ser un número válido')

            try {
                const resp = await context.prisma.persona.findUnique({
                    where: {
                        per_id: _args.per_id
                    }
                })
                return resp
            } catch (error) {
                throw new Error(`Registro no encontrado ${error}`)
            }
        }
    },
    Mutation: {
        create_persona: async (_parent: any, _args: { data: formPersona }, context: Context) => {
            // getUserId(context)

            const { data } = _args

            const verificaNroDoc = await context.prisma.persona.findUnique({
                where: {
                    per_nro_doc: data.per_nro_doc
                }
            })

            if (verificaNroDoc) throw new Error('El Nro de Documento ya existe')

            const verificaCorreo = await context.prisma.persona.findMany({
                where: {
                    per_correo: data.per_correo
                }
            })

            if (verificaCorreo.length > 0) throw new Error('El Correo ya existe')

            console.log(verificaCorreo)

            return await context.prisma.persona.create({
                data: {
                    per_tdoc: data.per_tdoc,
                    per_nro_doc: data.per_nro_doc,
                    per_nombre: data.per_nombre,
                    per_appat: data.per_appat,
                    per_apmat: data.per_apmat,
                    per_sexo: data.per_sexo,
                    per_correo: data.per_correo,
                    per_nacionalidad: data.per_nacionalidad,
                    per_direccion1: data.per_direccion1,
                    per_direccion2: data.per_direccion2,
                    per_lugar_nac: data.per_lugar_nac,
                    per_fech_nac: data.per_fech_nac,
                    per_st: data.per_st,
                    per_telf: data.per_telf,
                    per_celular1: data.per_celular1,
                    per_celular2: data.per_celular2,
                    per_fech_create: new Date(),
                    per_usu_create: "admin",
                    colegiados: {
                        create: {
                            col_nro_cop: data.col_nro_cop,
                            col_fecha_colegiatura: data.col_fecha_colegiatura,
                            col_centro_trabajo: data.col_centro_trabajo,
                            col_st: data.col_st,
                            col_obs: data.col_obs,
                            col_foto: "foto.jpg",
                            col_fech_create: new Date(),
                            col_usu_create: "admin"
                        }
                    }
                }
            })
        },
        update_persona: async (_parent: any, _args: { per_id: number, fieldName: string, value: string }, context: Context) => {
            // getUserId(context);

            // Lista de campos y su tipo de datos esperado
            const fieldTypes: { [key: string]: string } = {
                col_nro_cop: "string",
                col_fecha_colegiatura: "Date",
                col_st: "string",
                col_obs: "string",
                col_centro_trabajo: "string",
                per_tdoc: "number",
                per_sexo: "string",
                per_nro_doc: "string",
                per_nombre: "string",
                per_appat: "string",
                per_apmat: "string",
                per_correo: "string",
                per_nacionalidad: "string",
                per_direccion1: "string",
                per_direccion2: "string",
                per_lugar_nac: "string",
                per_fech_nac: "string",
                per_st: "string",
                per_telf: "string",
                per_celular1: "string",
                per_celular2: "string",
            };

            // Verificar si el campo existe en la lista de campos válidos
            if (!(_args.fieldName in fieldTypes)) {
                throw new Error(`El campo ${_args.fieldName} no es válido para actualización.`);
            }

            // Validación y conversión del valor dependiendo del tipo de campo
            let formattedValue: number | string | Date = _args.value;
            switch (fieldTypes[_args.fieldName]) {
                case 'number':
                    formattedValue = +_args.value
                    if (isNaN(formattedValue)) throw new Error(`El valor de ${_args.fieldName} debe ser un número válido.`)
                    break;
                case 'Date':
                    // Asumimos que el valor es una fecha en formato string, lo convertimos a Date                    
                    const dateValue: Date = new Date(_args.value);
                    formattedValue = dateValue;
                    if (isNaN(dateValue.getTime())) throw new Error(`El valor de ${_args.fieldName} debe ser una fecha válida.`)
                    break;
                case 'string':
                    // En este caso, solo aseguramos que el valor sea una cadena
                    if (typeof _args.value !== 'string') throw new Error(`El valor de ${_args.fieldName} debe ser un string.`)
                    break;
                default:
                    throw new Error(`Tipo de dato desconocido para el campo ${_args.fieldName}.`);
            }
            let validaId = []

            try {
                validaId = await context.prisma.colegiados.findMany({
                    where: {
                        col_persona: _args.per_id
                    }
                })
            } catch (error) {
                throw new Error(`Error al actualizar la persona: ${error}`);
            }

            const isColField = _args.fieldName.startsWith("col_");

            if (isColField) {
                try {
                    // Realizar la actualización de un solo campo con el valor formateado
                    const updatedPersona = await context.prisma.persona.update({
                        where: {
                            per_id: _args.per_id
                        },
                        data: {
                            colegiados: {
                                update: {
                                    where: {
                                        col_id: validaId[0].col_id
                                    },
                                    data: {
                                        [_args.fieldName]: formattedValue,
                                        col_fech_update: new Date(),
                                        col_usu_update: "admin"
                                    }
                                }
                            }
                        }
                    });

                    return updatedPersona;
                } catch (error) {
                    throw new Error(`Error al actualizar la persona: ${error}`);
                }
            }
            else {
                try {
                    // Realizar la actualización de un solo campo con el valor formateado
                    const updatedPersona = await context.prisma.persona.update({
                        where: {
                            per_id: _args.per_id
                        },
                        data: {
                            // Usamos la clave del campo dinámicamente para actualizar solo ese campo
                            [_args.fieldName]: formattedValue,
                            per_fech_update: new Date(),
                            per_usu_update: "admin"
                        }
                    });

                    return updatedPersona;
                } catch (error) {
                    throw new Error(`Error al actualizar la persona: ${error}`);
                }
            }
        }
    },
    persona: {
        tipo_documento: async (_parent: persona, _args: any, context: Context) => {
            return await context.prisma.tipo_documento.findUnique({
                where: {
                    tdoc_id: _parent.per_tdoc
                }
            })
        },
        colegiados: async (_parent: persona, _args: any, context: Context) => {
            return await context.prisma.colegiados.findMany({
                where: {
                    col_persona: _parent.per_id
                }
            })
        }
    }
}

export { typeDefs as personaTypeDefs, resolvers as personaResolvers }
