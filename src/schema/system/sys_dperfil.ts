import { Context } from "../../context"

const tipeDefs = `#graphql 

    extend type Query {
        getAll_sys_dperfil: [sys_dperfil]
        getOne_sys_dperfil(dperf_id: Int!): sys_dperfil
    }

    extend type Mutation {
        create_sys_dperfil(data: sys_dperfilInput!): sys_dperfil
        update_sys_dperfil(dperf_id: Int!, data: sys_dperfilInput!): sys_dperfil
    }

    type sys_dperfil {
        dperf_id:       Int
        dperf_menu:     Int
        dperf_perfil:   Int
        dperf_permisos: String
        sys_submenu:    sys_submenu
        sys_perfil:     sys_perfil
    }

    input sys_dperfilInput {
        dperf_menu:     Int!
        dperf_perfil:   Int!
        dperf_permisos: String!
    }    

`

interface I_sys_dperfil {
    dperf_id: number,
    dperf_menu: number,
    dperf_perfil: number,
    dperf_permisos: string
}

const resolvers = {
    Query: {
        getAll_sys_dperfil: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.sys_dperfil.findMany()
        },
        getOne_sys_dperfil: async (_parent: any, args: { dperf_id: number }, context: Context) => {
            return await context.prisma.sys_dperfil.findUnique({
                where: {
                    dperf_id: args.dperf_id
                }
            })
        }
    },
    Mutation: {
        create_sys_dperfil: async (_parent: any, args: { data: I_sys_dperfil }, context: Context) => {
            return await context.prisma.sys_dperfil.create({
                data: {
                    dperf_menu: args.data.dperf_menu,
                    dperf_perfil: args.data.dperf_perfil,
                    dperf_permisos: args.data.dperf_permisos
                }
            })
        },
        update_sys_dperfil: async (_parent: any, args: { dperf_id: number, data: I_sys_dperfil }, context: Context) => {
            return await context.prisma.sys_dperfil.update({
                where: {
                    dperf_id: args.dperf_id
                },
                data: {
                    dperf_menu: args.data.dperf_menu,
                    dperf_perfil: args.data.dperf_perfil,
                    dperf_permisos: args.data.dperf_permisos
                }
            })
        }
    },
    sys_dperfil: {
        sys_submenu: async (parent: any, _args: any, context: Context) => {
            return await context.prisma.sys_submenu.findUnique({
                where: {
                    submenu_id: parent.dperf_menu
                }
            })
        },
        sys_perfil: async (parent: any, _args: any, context: Context) => {
            return await context.prisma.sys_perfil.findUnique({
                where: {
                    perf_id: parent.dperf_perfil
                }
            })
        }
    }
}

export { tipeDefs as sys_dperfilTipeDef, resolvers as sys_dperfilResolv}