import { DateResolver, DateTimeResolver, DateTimeTypeDefinition, DateTypeDefinition } from 'graphql-scalars';
import { Context } from '../../context';
import { getUserId } from '../../utils';
const typeDefs = `#graphql
    extend type Query {
        getAll_persona: [persona!]!
        getOne_persona(per_id: Int!): persona
    }

    extend type Mutation {
        create_persona(data: personaForm!): persona
        update_persona(per_id: Int!, data: personaInput!): persona
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

    input personaInput {
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
    }

    input personaForm {
        col_nro_cop:            String
        col_fecha_colegiatura:  Date
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
`
interface persona {
    per_id: number
    per_tdoc: number
    per_nro_doc: string
    per_nombre: string
    per_appat: string
    per_apmat: string
    per_sexo: string
    per_correo: string
    per_nacionalidad: string
    per_direccion1: string
    per_direccion2: string
    per_lugar_nac: string
    per_fech_nac: string
    per_st: string
    per_telf: string
    per_celular1: string
    per_celular2: string
    per_fech_create: Date
    per_fech_update: Date
    per_usu_create: string
    per_usu_update: string
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

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getAll_persona: async (_parent: any, _args: any, context: Context) => {
            // getUserId(context)
            return await context.prisma.persona.findMany()
        },
        getOne_persona: async (_parent: any, _args: { per_id: number }, context: Context) => {
            getUserId(context)
            return await context.prisma.persona.findUnique({
                where: {
                    per_id: _args.per_id
                }
            })
        }
    },
    Mutation: {
        create_persona: async (_parent: any, _args: { data: formPersona }, context: Context) => {
            // getUserId(context)

            const { data } = _args
            return await context.prisma.persona.findUnique({
                where: {
                    per_nro_doc: data.per_nro_doc
                }
            })

            // return await context.prisma.persona.create({
            //     data: _args.data
            // })
        },
        update_persona: async (_parent: any, _args: { per_id: number, data: persona }, context: Context) => {
            getUserId(context)
            return await context.prisma.persona.update({
                where: {
                    per_id: _args.per_id
                },
                data: _args.data
            })
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
