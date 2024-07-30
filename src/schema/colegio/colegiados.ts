import { DateResolver, DateTimeResolver } from "graphql-scalars"
import { Context } from "../../context"
import { getUserId } from "../../utils"

const typeDefs = `#graphql

    extend type Query {
        getAll_colegiados: [colegiados!]!
        getOne_colegiados(col_id: Int!): colegiados
    }

    extend type Mutation {
        create_colegiados(data: colegiadosInput): colegiados
        update_colegiados(col_id: Int!, data: colegiadosInput): colegiados
    }

    type colegiados {
        col_id:                Int
        col_persona:           Int
        col_nro_cop:           String
        col_fecha_colegiatura: DateTime
        col_centro_trabajo:    String
        col_st:                String
        col_obs:               String
        col_foto:              String
        col_fech_create:       DateTime
        col_fech_update:       DateTime
        col_usu_create:        String
        col_usu_update:        String
        persona:               persona
    }

    input colegiadosInput {
        col_persona:           Int
        col_nro_cop:           String
        col_fecha_colegiatura: DateTime
        col_centro_trabajo:    String
        col_st:                String
        col_obs:               String
        col_foto:              String
    }

    
    scalar DateTime
    scalar Date
`

interface I_coolegiados {
    col_id: number
    col_persona: number
    col_nro_cop: string
    col_fecha_colegiatura: string
    col_centro_trabajo: string
    col_st: string
    col_obs: string
    col_foto: string
    col_fech_create: string
    col_fech_update: string
    col_usu_create: string
    col_usu_update: string
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getAll_colegiados: async (_parent: any, _args: any, context: Context) => {
            getUserId(context)
            return await context.prisma.colegiados.findMany()
        },
        getOne_colegiados: async (_parent: any, args: { col_id: number }, context: Context) => {
            getUserId(context)
            return await context.prisma.colegiados.findUnique({
                where: {
                    col_id: args.col_id
                }
            })
        }
    },
    Mutation: {
        create_colegiados: async (_parent: any, args: { data: I_coolegiados }, context: Context) => {
            getUserId(context)
            return await context.prisma.colegiados.create({
                data: args.data
            })
        },
        update_colegiados: async (_parent: any, args: { col_id: number, data: I_coolegiados }, context: Context) => {
            getUserId(context)
            return await context.prisma.colegiados.update({
                where: {
                    col_id: args.col_id
                },
                data: args.data
            })
        }
    },
    colegiados: {
        persona: async (parent: any, _args: any, context: Context) => {
            return await context.prisma.persona.findUnique({
                where: {
                    per_id: parent.col_persona
                }
            })
        }
    }
}

export { typeDefs as colegiadosTypeDefs, resolvers as colegiadosResolvers }