import { Context } from "../../context"
import { getUserId } from "../../utils"

const tipeDefs = `#graphql

    extend type Query {
        getAll_sys_empresa: [sys_empresa]
        getOne_sys_empresa(emp_id: Int!): sys_empresa
    }

    extend type Mutation {
        create_sys_empresa(data: sys_empresaInput!): sys_empresa
        update_sys_empresa(emp_id: Int!, data: sys_empresaInput!): sys_empresa
    }

    type sys_empresa {
        emp_id:        Int
        emp_ruc:       String
        emp_rznsocial: String
        emp_acro:      String
        emp_direccion: String
        sys_sede:      [sys_sede]
    }

    input sys_empresaInput {
        emp_ruc:       String
        emp_rznsocial: String
        emp_acro:      String
        emp_direccion: String
    }
`
interface I_sys_empresa {
    emp_id:        number
    emp_ruc:       string
    emp_rznsocial: string
    emp_acro:      string
    emp_direccion: string
}

const resolver = {
    Query: {
        getAll_sys_empresa: async (_parent: any, _args: any, context: Context) => {
            getUserId(context)
            return await context.prisma.sys_empresa.findMany()
        },
        getOne_sys_empresa: async (_parent: any, args: { emp_id: number }, context: Context) => {
            getUserId(context)
            return await context.prisma.sys_empresa.findUnique({
                where: {
                    emp_id: args.emp_id
                }
            })
        }
    },
    Mutation: {
        create_sys_empresa: async (_parent: any, args: { data: I_sys_empresa }, context: Context) => {
            getUserId(context)
            return await context.prisma.sys_empresa.create({
                data: {
                    emp_ruc:       args.data.emp_ruc,
                    emp_rznsocial: args.data.emp_rznsocial,
                    emp_acro:      args.data.emp_acro,
                    emp_direccion: args.data.emp_direccion
                }
            })
        },
        update_sys_empresa: async (_parent: any, args: { emp_id: number, data: I_sys_empresa }, context: Context) => {
            getUserId(context)
            return await context.prisma.sys_empresa.update({
                where: {
                    emp_id: args.emp_id
                },
                data: {
                    emp_ruc:       args.data.emp_ruc,
                    emp_rznsocial: args.data.emp_rznsocial,
                    emp_acro:      args.data.emp_acro,
                    emp_direccion: args.data.emp_direccion
                }
            })
        }
    },
    sys_empresa: {
        sys_sede: async (parent: I_sys_empresa, _args: any, context: Context) => {
            return await context.prisma.sys_sede.findMany({
                where: {
                    sede_empresa: parent.emp_id
                }
            })
        }
    }
}

export { tipeDefs as sys_empresaSchema, resolver as sys_empresaResolver }