import { Context } from "../../context"
import { getUserId } from "../../utils"

const tipeDefs = `#graphql

    extend type Query {
        getAll_sys_submenu: [sys_submenu!]!
        getOne_sys_submenu(submenu_id: Int!): sys_submenu
    }

    extend type Mutation {
        createsys_submenu(data: sys_submenuInput!): sys_submenu
        updatesys_submenu(submenu_id: Int!, data: sys_submenuInput!): sys_submenu
    }

    type sys_submenu {
        submenu_id:     Int!
        submenu_padre:  Int!
        submenu_titulo: String!
        submenu_icon:   String
        submenu_href:   String
        sys_menu:       sys_menu
    }

    input sys_submenuInput {
        submenu_padre:  Int!
        submenu_titulo: String!
        submenu_icon:   String
        submenu_href:   String
    }
`

interface I_sys_submenu {
    submenu_id: number,
    submenu_padre: number,
    submenu_titulo: string,
    submenu_icon: string,
    submenu_href: string
}

const resolvers = {
    Query: {
        getAll_sys_submenu: async (_parent: any, _args: any, context: Context) => {
            getUserId(context)
            return await context.prisma.sys_submenu.findMany()
        },
        getOne_sys_submenu: async (_parent: any, args: { submenu_id: number }, context: Context) => {
            getUserId(context)
            return await context.prisma.sys_submenu.findUnique({
                where: {
                    submenu_id: args.submenu_id
                }
            })
        }
    },
    Mutation: {
        createsys_submenu: async (_parent: any, args: { data: I_sys_submenu }, context: Context) => {
            getUserId(context)
            return await context.prisma.sys_submenu.create({
                data: {
                    submenu_padre: args.data.submenu_padre,
                    submenu_titulo: args.data.submenu_titulo,
                    submenu_icon: args.data.submenu_icon,
                    submenu_href: args.data.submenu_href
                }
            })
        },
        updatesys_submenu: async (_parent: any, args: { submenu_id: number, data: I_sys_submenu }, context: Context) => {
            getUserId(context)
            return await context.prisma.sys_submenu.update({
                where: {
                    submenu_id: args.submenu_id
                },
                data: {
                    submenu_padre: args.data.submenu_padre,
                    submenu_titulo: args.data.submenu_titulo,
                    submenu_icon: args.data.submenu_icon,
                    submenu_href: args.data.submenu_href
                }
            })
        }
    },
    sys_submenu: {
        sys_menu: async (parent: I_sys_submenu, _args: any, context: Context) => {
            return await context.prisma.sys_menu.findUnique({
                where: {
                    menu_id: parent.submenu_padre
                }
            })
        }
    }
}

export { tipeDefs as sys_submenuTipeDef, resolvers as sys_submenuResolv }