import { Context } from "../../context"
import { exprEmail, generateToken, getUserId, validatePassword } from "../../utils"

const typeDefs = `#graphql
    extend type Query {
        getAll_sys_usuario: [sys_usuario]
        getOne_sys_usuario(usu_id: String!): sys_usuario
    }

    extend type Mutation {
        login(data: LoginInput!): AuthPayload
        create_sys_usuario(data: sys_usuarioInput!): sys_usuario
        update_sys_usuario(usu_id: String!, data: sys_usuarioInput!): sys_usuario
    }

    type sys_usuario {
        usu_id:          String!
        usu_correo:      String!
        usu_nombre:      String!
        usu_persona:     Int!
        usu_st:          String
        usu_fech_create: DateTime
        usu_fech_update: DateTime
        usu_create:      String
        usu_update:      String
        usu_token:       String
        sys_control:     [sys_control]
        persona:         persona
    }

    input sys_usuarioInput {
        usu_correo:      String!
        usu_password:    String!
        usu_nombre:      String!
        usu_persona:     Int!
    }

    input LoginInput {
        usu_correo:      String!
        usu_password:    String!
    }

    input UpdateAccesoInput {
        usu_persona:     Int!
        usu_correo:      String!
        usu_nombre:      String!
        usu_password:    String!
    }

    type AuthPayload {
        token: String
        user: sys_usuario
    }

    type validaPayload {
        estado: Boolean
        usu_id: String
        usu_nombre: String
        token: String
    }

    scalar DateTime
`

interface I_sys_usuario {
    usu_id: string,
    usu_correo: string,
    usu_password: string,
    usu_nombre: string,
    usu_persona: number,
    usu_st: string,
    usu_fech_create: Date,
    usu_fech_update: Date,
    usu_create: string,
    usu_update: string,
    usu_token: string
}

const resolvers = {
    Query: {
        getAll_sys_usuario: async (_parent: any, _args: any, context: Context) => {
            getUserId(context)
            return await context.prisma.sys_usuario.findMany()
        },
        getOne_sys_usuario: async (_parent: any, _args: { usu_id: string }, context: Context) => {
            getUserId(context)
            return await context.prisma.sys_usuario.findUnique({
                where: {
                    usu_id: _args.usu_id
                }
            })
        }
    },
    Mutation: {
        create_sys_usuario: async (_parent: any, _args: { data: I_sys_usuario }, context: Context) => {
            getUserId(context)
            return await context.prisma.sys_usuario.create({
                data: _args.data
            })
        },
        update_sys_usuario: async (_parent: any, _args: { usu_id: string, data: I_sys_usuario }, context: Context) => {
            getUserId(context)
            return await context.prisma.sys_usuario.update({
                where: {
                    usu_id: _args.usu_id
                },
                data: _args.data
            })
        },
        login: async (_parent: any, _args: { data: { usu_correo: string, usu_password: string } }, context: Context) => {
            const { usu_correo, usu_password } = _args.data
            console.log(usu_correo, "procesando login")
            exprEmail(usu_correo)
            const user = await context.prisma.sys_usuario.findUnique({
                where: {
                    usu_correo
                }
            })
            if (!user) {
                throw new Error('Usuario no encontrado')
            }
            const validaPass = await validatePassword(usu_password, user.usu_password)
            if (!validaPass) {
                throw new Error('Contraseña incorrecta')
            }

            const ID: any = user.usu_id
            return {
                token: generateToken(ID),
                user
            }
        }
    },
    sys_usuario: {
        sys_control: async (parent: I_sys_usuario, _args: any, context: Context) => {
            return await context.prisma.sys_usuario.findUnique({
                where: {
                    usu_id: parent.usu_id
                }
            }).sys_control()
        },
        persona: async (parent: I_sys_usuario, _args: any, context: Context) => {
            return await context.prisma.sys_usuario.findUnique({
                where: {
                    usu_id: parent.usu_id
                }
            }).persona()
        }
    }
}

export { typeDefs as sys_usuarioTypeDefs, resolvers as sys_usuarioResolvers }