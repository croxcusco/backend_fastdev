import { Context } from "../../context"

const typeDefs = `#graphql

    extend type Query {
        getAll_sys_control: [sys_control!]!
        getOne_sys_control(cont_id: Int!): sys_control
    }

    extend type Mutation {
        create_sys_control(data: sys_controlInput!): sys_control
        update_sys_control(cont_id: Int!, data: sys_controlInput!): sys_control
    }

    type sys_control {
        cont_id:      Int!
        cont_sede:    Int!
        cont_usuario: String!
        cont_perfil:  Int!
        cont_st:      Int
        sys_sede:     sys_sede
        sys_perfil:   sys_perfil
        sys_usuario:  sys_usuario
    }

    input sys_controlInput {
        cont_sede:    Int!
        cont_usuario: String!
        cont_perfil:  Int!
        cont_st:      Int
    }
`

interface I_sys_control {
    cont_id:      number,
    cont_sede:    number,
    cont_usuario: string,
    cont_perfil:  number,
    cont_st:      number
}

const resolvers = {
    Query: {
        getAll_sys_control: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.sys_control.findMany()
        },
        getOne_sys_control: async (_parent: any, args: { cont_id: number }, context: Context) => {
            return await context.prisma.sys_control.findUnique({
                where: {
                    cont_id: args.cont_id
                }
            })
        }
    },
    Mutation: {
        create_sys_control: async (_parent: any, args: { data: I_sys_control }, context: Context) => {
            return await context.prisma.sys_control.create({
                data: args.data
            })
        },
        update_sys_control: async (_parent: any, args: { cont_id: number, data: I_sys_control }, context: Context) => {
            return await context.prisma.sys_control.update({
                where: {
                    cont_id: args.cont_id
                },
                data: args.data
            })
        }
    },
    sys_control: {
        sys_sede: async (parent: I_sys_control, _args: any, context: Context) => {
            return await context.prisma.sys_control.findUnique({
                where: {
                    cont_id: parent.cont_id
                }
            }).sys_sede()
        },
        sys_perfil: async (parent: I_sys_control, _args: any, context: Context) => {
            return await context.prisma.sys_control.findUnique({
                where: {
                    cont_id: parent.cont_id
                }
            }).sys_perfil()
        },
        sys_usuario: async (parent: I_sys_control, _args: any, context: Context) => {
            return await context.prisma.sys_control.findUnique({
                where: {
                    cont_id: parent.cont_id
                }
            }).sys_usuario()
        }
    }
}

export { typeDefs as sys_controlTypeDefs, resolvers as sys_controlResolvers}