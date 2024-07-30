import { Context } from "../../context"

const tipeDefs = `#graphql

    extend type Query {
        getAll_sys_sede: [sys_sede]
        getOne_sys_sede(sede_id: Int!): sys_sede
    }

    extend type Mutation {
        create_sys_sede(data: sys_sedeInput): sys_sede
        update_sys_sede(sede_id: Int!, data: sys_sedeInput): sys_sede
    }

    type sys_sede {
        sede_id:        Int
        sede_empresa:   Int
        sede_nombre:    String
        sede_direccion: String
        sys_empresa:    sys_empresa
        sys_control:    [sys_control]
    }

    input sys_sedeInput {
        sede_empresa:   Int!
        sede_nombre:    String!
        sede_direccion: String!
    }
`

interface I_sys_sede {
    sede_id:        number
    sede_empresa:   number
    sede_nombre:    string
    sede_direccion: string
}

const resolvers = {
    Query: {
        getAll_sys_sede: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.sys_sede.findMany()
        },
        getOne_sys_sede: async (_parent: any, args: { sede_id: number }, context: Context) => {
            return await context.prisma.sys_sede.findUnique({
                where: {
                    sede_id: args.sede_id
                }
            })
        }
    },
    Mutation: {
        create_sys_sede: async (_parent: any, args: { data: I_sys_sede }, context: Context) => {
            return await context.prisma.sys_sede.create({
                data: {
                    sede_empresa:   args.data.sede_empresa,
                    sede_nombre:    args.data.sede_nombre,
                    sede_direccion: args.data.sede_direccion
                }
            })
        },
        update_sys_sede: async (_parent: any, args: { sede_id: number, data: I_sys_sede }, context: Context) => {
            return await context.prisma.sys_sede.update({
                where: {
                    sede_id: args.sede_id
                },
                data: {
                    sede_empresa:   args.data.sede_empresa,
                    sede_nombre:    args.data.sede_nombre,
                    sede_direccion: args.data.sede_direccion
                }
            })
        }
    },
    sys_sede: {
        sys_empresa: async (parent: I_sys_sede, _args: any, context: Context) => {
            return await context.prisma.sys_empresa.findUnique({
                where: {
                    emp_id: parent.sede_empresa
                }
            })
        },
        sys_control: async (parent: I_sys_sede, _args: any, context: Context) => {
            return await context.prisma.sys_control.findMany({
                where: {
                    cont_sede: parent.sede_id
                }
            })
        }
    }
}

export { tipeDefs as sys_sedeTypeDefs, resolvers as sys_sedeResolvers }