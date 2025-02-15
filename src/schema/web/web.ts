// model web {
//     web_id                                         Int           @id @default(autoincrement())
//     web_categoria                                  Int
//     web_titulo                                     String        @db.VarChar(45)
//     web_mini_desc                                  String        @db.VarChar(45)
//     web_desc                                       String        @db.VarChar(500)
//     web_img                                        String        @db.VarChar(2048)
//     web_st                                         Int?
//     web_usu_create                                 String?       @db.VarChar(45)
//     web_fecha_create                               DateTime?     @db.DateTime(0)
//     web_usu_update                                 String?       @db.VarChar(45)
//     web_fecha_update                               DateTime?     @db.DateTime(0)
//     web_categoria_web_web_categoriaToweb_categoria web_categoria @relation("web_web_categoriaToweb_categoria", fields: [web_categoria], references: [cat_id], onUpdate: Restrict, map: "fk_web_categoria")
//     web_galeria                                    web_galeria[]

//     @@index([web_categoria], map: "fk_web_categoria_idx")
//   }
import { DateResolver, DateTimeResolver } from 'graphql-scalars';
import { Context } from '../../context';
import { v2 as cloudinary } from 'cloudinary';

const typeDefs = `#graphql
    extend type Query {
        getAll_web(first: Int, after: String, filter: String): webConnection!
        getOne_web(web_id: Int!): web
    }

    extend type Mutation {
        create_web(web: webForm!): web!
        update_web(web_id: Int!, fieldName: String!, value: String): web!
    }

    type web {
        web_id: Int!
        web_categoria: Int!
        web_titulo: String!
        web_mini_desc: String!
        web_desc: String!
        web_img: String!
        web_st: Int
        web_usu_create: String
        web_fecha_create: DateTime
        web_usu_update: String
        web_fecha_update: DateTime
        tabweb_categoria: web_categoria
        web_galeria: [web_galeria]
    }

    type webConnection {
        edges: [webEdge!]!
        pageInfo: PageInfo!
    }

    type webEdge {
        cursor: String!
        node: web!
    }

    type PageInfo {
        endCursor: String!
        hasNextPage: Boolean!
    }

    input webForm {
        web_categoria: Int!
        web_titulo: String!
        web_mini_desc: String!
        web_desc: String!
        web_img: String!
        web_st: Int
        web_galeria: [web_galeriaForm]
    }
    
    input web_galeriaForm {
        gal_img: String!
        gal_st: Int
    }

    scalar DateTime
    scalar Date
`

interface web {
    web_id: number;
    web_categoria: number;
    web_titulo: string;
    web_mini_desc: string;
    web_desc: string;
    web_img: string;
    web_st: number | null;
    web_usu_create: string | null;
    web_fecha_create: Date | null;
    web_usu_update: string | null;
    web_fecha_update: Date | null;
    web_galeria: {
        gal_id: number;
        gal_img: string;
        gal_st: number | null;
        gal_usu_create: string | null;
        gal_fecha_create: Date | null;
        gal_usu_update: string | null;
        gal_fecha_update: Date | null;
    }[]
}

interface formWeb {
    web_categoria: number;
    web_titulo: string;
    web_mini_desc: string;
    web_desc: string;
    web_img: string;
    web_st: number | null;
    web_galeria: [
        {
            gal_id?: number;
            gal_img: string;
        }
    ]
}

interface webConnection {
    edges: { node: web; cursor: string }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

interface webPageFilter {
    first?: number;
    after?: string | null;
    filter?: string | null;
}

const resolvers = {
    Date: DateResolver,
    DateTime: DateTimeResolver,
    Query: {
        getAll_web: async (
            _parent: unknown,
            { first = 10, after = null, filter = "" }: webPageFilter,
            context: Context
        ): Promise<webConnection> => {
            const take = Math.min(first, 100);
            // Límite máximo de registros
            const decodedCursor = after ? parseInt(Buffer.from(after, 'base64').toString('ascii')) : null;

            try {
                const webs = await context.prisma.web.findMany({
                    where: filter ? {
                        web_titulo: {
                            contains: filter
                        }
                    } : {},
                    orderBy: { web_id: 'desc' },
                    cursor: decodedCursor ? { web_id: decodedCursor } : undefined,
                    skip: decodedCursor ? 1 : 0,
                    take: take + 1 // Obtener un registro extra para determinar `hasNextPage`
                });
                // Determinar si hay más páginas
                const hasNextPage = webs.length > take;
                if (hasNextPage) webs.pop(); // Quitar el registro extra

                // Crear edges con nodos y cursores
                const edges = webs.map((web: any) => ({
                    node: web,
                    cursor: Buffer.from(web.web_id.toString()).toString('base64'),
                }));

                // Obtener el cursor final
                const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

                return {
                    edges,
                    pageInfo: {
                        hasNextPage,
                        endCursor,
                    },
                } as webConnection;
            } catch (error) {
                console.error('Error al obtener webs:', error);
                throw new Error('Error al obtener webs');
            }
        },
        getOne_web: async (_parent: unknown, _args: { web_id: number }, context: Context) => {
            if (!_args.web_id) throw new Error('ID de web no proporcionado')
            if (isNaN(_args.web_id)) throw new Error('ID de web debe ser un número válido')

            try {
                const resp = await context.prisma.web.findUnique({
                    where: {
                        web_id: _args.web_id
                    }
                })
                return resp
            } catch (error) {
                throw new Error(`Registro no encontrado ${error}`)
            }
        }
    },
    Mutation: {
        create_web: async (_parent: unknown, { web }: { web: formWeb }, context: Context): Promise<web> => {
            try {
                if (web.web_titulo.length > 100) {
                    throw new Error('El título no puede exceder los 100 caracteres');
                }
                if (web.web_mini_desc.length > 100) {
                    throw new Error('La mini descripción no puede exceder los 100 caracteres');
                }
                if (web.web_desc.length > 500) {
                    throw new Error('La descripción no puede exceder los 500 caracteres');
                }
                if (!web.web_img) {
                    throw new Error('La imagen no puede estar vacía');
                }

                const webData: any = {
                    web_categoria: web.web_categoria,
                    web_titulo: web.web_titulo,
                    web_mini_desc: web.web_mini_desc,
                    web_desc: web.web_desc,
                    web_img: web.web_img,
                    web_st: web.web_st,
                    web_fecha_create: new Date(),
                    web_usu_create: 'admin',
                };

                if (web.web_galeria && web.web_galeria.length > 0) {
                    webData.web_galeria = {
                        createMany: {
                            data: web.web_galeria.map(galeria => ({
                                gal_img: galeria.gal_img,
                                gal_fecha_create: new Date(),
                                gal_usu_create: 'admin'
                            }))
                        }
                    };
                }

                const newWeb = await context.prisma.web.create({
                    data: webData,
                    include: {
                        web_galeria: true
                    }
                });

                return newWeb;
            } catch (error) {
                console.error('Error al crear web:', error);
                throw new Error('Error al crear web');
            }
        },
        update_web: async (_parent: unknown, { web_id, fieldName, value }: { web_id: number, fieldName: string, value: string }, context: Context): Promise<web> => {
            // Lista de campos y su tipo de datos esperado
            const fieldTypes: { [key: string]: string } = {
                web_categoria: "number",
                web_titulo: "string",
                web_mini_desc: "string",
                web_desc: "string",
                web_img: "string",
                web_st: "number",
            };

            // Verificar si el campo existe en la lista de campos válidos
            if (!(fieldName in fieldTypes)) {
                throw new Error(`El campo ${fieldName} no es válido para actualización.`);
            }

            // Validación y conversión del valor dependiendo del tipo de campo
            let formattedValue: number | string | Date = value;
            switch (fieldTypes[fieldName]) {
                case 'number':
                    formattedValue = +value;
                    if (isNaN(formattedValue)) throw new Error(`El valor de ${fieldName} debe ser un número válido.`);
                    break;
                case 'Date':
                    const dateValue: Date = new Date(value);
                    formattedValue = dateValue;
                    if (isNaN(dateValue.getTime())) throw new Error(`El valor de ${fieldName} debe ser una fecha válida.`);
                    break;
                case 'string':
                    if (typeof value !== 'string') throw new Error(`El valor de ${fieldName} debe ser un string.`);
                    break;
                default:
                    throw new Error(`Tipo de dato desconocido para el campo ${fieldName}.`);
            }

            try {
                const updatedWeb = await context.prisma.web.update({
                    where: { web_id },
                    data: {
                        [fieldName]: formattedValue,
                        web_fecha_update: new Date(),
                        web_usu_update: "admin"
                    },
                    include: {
                        web_galeria: true
                    }
                });

                return updatedWeb;
            } catch (error) {
                console.error('Error al actualizar web:', error);
                throw new Error('Error al actualizar web');
            }
        }
    },
    web: {
        tabweb_categoria: async (
            parent: web,
            _args: unknown,
            context: Context
        ) => {
            return await context.prisma.web_categoria.findUnique({
                where: {
                    cat_id: parent.web_categoria
                }
            });
        },
        web_galeria: async (
            parent: web,
            _args: unknown,
            context: Context
        ) => {
            return await context.prisma.web_galeria.findMany({
                where: {
                    gal_web: parent.web_id
                }
            });
        }
    }
}

export { typeDefs as webTypeDefs, resolvers as webResolvers }