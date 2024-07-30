
//colegio
import { colegiadosResolvers, colegiadosTypeDefs } from "./colegio"

//persona
import { personaResolvers, personaTypeDefs, tipo_documento_resolver, tipo_documento_tipeDefs } from "./persona"

//system
import { sys_controlResolvers, sys_controlTypeDefs, sys_dperfilResolv, sys_dperfilTipeDef, sys_empresaResolver, sys_empresaSchema, sys_menuResolv, sys_menuTipeDef, sys_perfilResolvers, sys_perfilSchema, sys_sedeResolvers, sys_sedeTypeDefs, sys_submenuResolv, sys_submenuTipeDef, sys_usuarioResolvers, sys_usuarioTypeDefs } from "./system"

//laboratorio

const rootTypeDefs = `#graphql
    type Query {
        _: String
    }
    
    type Mutation {
        _: String
    }
`
const resolvers = [
    sys_menuResolv,
    sys_perfilResolvers,
    sys_submenuResolv,
    sys_dperfilResolv,
    personaResolvers,
    tipo_documento_resolver,
    sys_empresaResolver,
    sys_usuarioResolvers,
    sys_controlResolvers,
    sys_sedeResolvers,
    colegiadosResolvers,
]
const typeDefs = [
    rootTypeDefs,
    sys_menuTipeDef,
    sys_perfilSchema,
    sys_submenuTipeDef,
    sys_dperfilTipeDef,
    personaTypeDefs,
    tipo_documento_tipeDefs,
    sys_empresaSchema,
    sys_usuarioTypeDefs,
    sys_controlTypeDefs,
    sys_sedeTypeDefs,
    colegiadosTypeDefs,
]

export { typeDefs, resolvers }