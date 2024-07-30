import { Context } from "../../context"

const tipeDefs = `#graphql 
    extend type Query {
        getAllsys_menu: [sys_menu!]!
        getOnesys_menu(menu_id: Int!): sys_menu
    }

    extend type Mutation {
        create_sys_menu(data: sys_menuInput!): sys_menu
        update_sys_menu(menu_id: Int!, data: sys_menuInput!): sys_menu
    }

    type sys_menu {
        menu_id:     Int!
        menu_desc:   String
        sys_submenu: [sys_submenu]
    }

    input sys_menuInput {
        menu_desc:   String
    }

`

interface I_sys_menu {
    menu_id: number,
    menu_desc: string
}


const resolvers = {
    Query: {
        getAllsys_menu: async (_parent: any, _args: any, context: Context) => {
            return await context.prisma.sys_menu.findMany()
        },
        getOnesys_menu: async (_parent: any, args: { menu_id: number }, context: Context) => {
            return await context.prisma.sys_menu.findUnique({
                where: {
                    menu_id: args.menu_id
                }
            })
        }
    },
    Mutation: {
        create_sys_menu: async (_parent: any, args: { data: I_sys_menu }, context: Context) => {
            return await context.prisma.sys_menu.create({
                data: {
                    menu_desc: args.data.menu_desc
                }
            })
        },
        update_sys_menu: async (_parent: any, args: { menu_id: number, data: I_sys_menu }, context: Context) => {
            return await context.prisma.sys_menu.update({
                where: {
                    menu_id: args.menu_id
                },
                data: {
                    menu_desc: args.data.menu_desc
                }
            })
        },
    },
    sys_menu: {
        sys_submenu: async (parent: I_sys_menu, _args: any, context: Context) => {
            return await context.prisma.sys_menu.findUnique({
                where: {
                    menu_id: parent.menu_id
                }
            }).sys_submenu()
        }
    }
}

export { tipeDefs as sys_menuTipeDef, resolvers as sys_menuResolv }


