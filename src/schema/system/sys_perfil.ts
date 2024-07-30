import { Context } from "../../context"

const tipeDefs = `#graphql 

    extend type Query {
        getAllsys_perfil: [sys_perfil!]!
        getOnesys_perfil(perf_id: Int!): sys_perfil
    }

    extend type Mutation {
        create_sys_perfil(perf_desc: String!): sys_perfil
        update_sys_perfil(perf_id: Int!, data: sys_perfilInput!): sys_perfil
    }

    type sys_perfil {
        perf_id:     Int
        perf_desc:   String
        sys_dperfil: [sys_dperfil!]!
        sys_control: [sys_control!]!
    }

    input sys_perfilInput {
        perf_desc:   String
    }

`

interface I_sys_perfil {
    perf_id: number,
    perf_desc: string
}

const resolvers = {
    Query: {
        getAllsys_perfil: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.sys_perfil.findMany()
        },
        getOnesys_perfil: async (_parent: any, args: { perf_id: number }, context: Context) => {
            return await context.prisma.sys_perfil.findUnique({
                where: {
                    perf_id: args.perf_id
                }
            })
        }
    },
    Mutation: {
        create_sys_perfil: async (_parent: any, args: { perf_desc: string }, context: Context) => {
            return await context.prisma.sys_perfil.create({
                data: {
                    perf_desc: args.perf_desc
                }
            })
        },
        update_sys_perfil: async (_parent: any, args: { perf_id: number, data: I_sys_perfil }, context: Context) => {
            return await context.prisma.sys_perfil.update({
                where: {
                    perf_id: args.perf_id
                },
                data: {
                    perf_desc: args.data.perf_desc
                }
            })
        }
    },
    sys_perfil: {
        sys_dperfil: async (parent: I_sys_perfil, _args: any, context: Context) => {
            return await context.prisma.sys_dperfil.findMany({
                where: {
                    dperf_perfil: parent.perf_id
                }
            })
        },
        sys_control: async (parent: I_sys_perfil, _args: any, context: Context) => {
            return await context.prisma.sys_control.findMany({
                where: {
                    cont_perfil: parent.perf_id
                }
            })
        }
    }
}

export { tipeDefs as sys_perfilSchema, resolvers as sys_perfilResolvers }
