
//colegio
import { colegiadosResolvers, colegiadosTypeDefs } from "./colegio"
import { aportacionesResolvers, aportacionesTypeDefs } from "./pago/aportaciones"
import { conceptoResolvers, conceptoTypeDefs } from "./pago/concepto"
import { pagoResolvers, pagoTypeDefs } from "./pago/pago"
import { pago_otrosResolvers, pago_otrosTypeDefs } from "./pago/pago_otros"
import { periodosResolvers, periodosTypeDefs } from "./pago/periodos"

//persona
import { personaResolvers, personaTypeDefs, tipo_documento_resolver, tipo_documento_tipeDefs } from "./persona"

//system
import { sys_controlResolvers, sys_controlTypeDefs, sys_dperfilResolv, sys_dperfilTipeDef, sys_empresaResolver, sys_empresaSchema, sys_menuResolv, sys_menuTipeDef, sys_perfilResolvers, sys_perfilSchema, sys_sedeResolvers, sys_sedeTypeDefs, sys_submenuResolv, sys_submenuTipeDef, sys_usuarioResolvers, sys_usuarioTypeDefs } from "./system"
import { webResolvers, webTypeDefs } from "./web/web"

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
    pagoResolvers,
    aportacionesResolvers,
    periodosResolvers,
    conceptoResolvers,
    pago_otrosResolvers,
    webResolvers,
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
    pagoTypeDefs,
    aportacionesTypeDefs,
    periodosTypeDefs,
    conceptoTypeDefs,
    pago_otrosTypeDefs,
    webTypeDefs,
]

export { typeDefs, resolvers }