import { Context } from "../../context"
import { getUserId } from "../../utils"

const tipeDefs = `#graphql
    
    extend type Query {
        getAll_tipo_documento: [tipo_documento]
        getOne_tipo_documento(tdoc_id: Int!): tipo_documento
    }
    
    type tipo_documento {
        tdoc_id:   Int
        tdoc_desc: String
    }

`

interface I_tipo_documento {
    tdoc_id: number,
    tdoc_desc: string
}

const resolver = {
    Query: {
        getAll_tipo_documento: async (_parent: any, _args: any, context: Context) => {
            getUserId(context)
            return await context.prisma.tipo_documento.findMany()
        },
        getOne_tipo_documento: async (_parent: any, args: { tdoc_id: number }, context: Context) => {
            getUserId(context)
            return await context.prisma.tipo_documento.findUnique({
                where: {
                    tdoc_id: args.tdoc_id
                }
            })
        }
    }

}

export { tipeDefs as tipo_documento_tipeDefs, resolver as tipo_documento_resolver }