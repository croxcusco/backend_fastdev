import { PrismaClient as PrismaClient1 } from '@prisma/client1'
import { PrismaClient as PrismaClient2 } from '@prisma/client2'
import { col_st, conceptoData, per_st, periodosData } from './array'
import { limpiarTexto, validateDate } from '../src/utils'

const prisma01 = new PrismaClient1()
const prisma02 = new PrismaClient2()


// model aportaciones {
//     aport_id           Int        @id @default(autoincrement())
//     aport_colegiado    Int
//     aport_pago         Int
//     aport_periodo      Int
//     aport_mes          Int
//     aport_monto        Decimal    @db.Decimal(10, 2)
//     aport_fecha        DateTime   @db.DateTime(0)
//     aport_usu_create   String?    @db.VarChar(45)
//     aport_fecha_create DateTime?  @db.DateTime(0)
//     aport_usu_update   String?    @db.VarChar(45)
//     aport_fecha_update DateTime?  @db.DateTime(0)
//     colegiados         colegiados @relation(fields: [aport_colegiado], references: [col_id], onUpdate: Restrict, map: "fk_aport_colegiado")
//     pago               pago       @relation(fields: [aport_pago], references: [pago_id], onUpdate: Restrict, map: "fk_aport_pago")
//     periodos           periodos   @relation(fields: [aport_periodo], references: [period_id], onUpdate: Restrict, map: "fk_aport_periodo")

//     @@index([aport_colegiado], map: "fk_aport_colegiado_idx")
//     @@index([aport_pago], map: "fk_aport_pago_idx")
//     @@index([aport_periodo], map: "fk_aport_periodo_idx")
//   }


// model aportaciones {
//     idAportacion   Int      @id @default(autoincrement())
//     idColegiado    Int
//     idPago         Int
//     idPeriodo      Int
//     mes            String   @db.VarChar(30)
//     monto          Decimal  @db.Decimal(10, 2)
//     fecha_aporte   DateTime @db.Date
//     creado_por     Int
//     creado_el      DateTime @default(now()) @db.Timestamp(0)
//     actualizado_el DateTime @default(now()) @db.Timestamp(0)
//   }

async function main() {
    // const deletePeriodos = await prisma01.periodos.deleteMany()
    // console.log('Periodos eliminados: ', deletePeriodos)
    // const deleteConcepto = await prisma01.concepto.deleteMany()
    // console.log('Concepto eliminados: ', deleteConcepto)


    // const periodos = await prisma01.periodos.createMany({
    //     data: periodosData
    // })
    // console.log('Periodos creados: ', periodos)

    // const concepto = await prisma01.concepto.createMany({
    //     data: conceptoData
    // })
    // console.log('Concepto creado: ', concepto)

    // //exportar colegiados
    // create_colegiado()

    // // exportar pagos
    // migratePagos().then(() => {
    //     console.log('Migración de pagos completada')
    // }).catch((error) => {
    //     console.error('Error al migrar pagos:', error)
    // })

    migrateAportaciones().then(() => {
        console.log('Migración de aportaciones completada')
    }).catch((error) => {
        console.error('Error al migrar aportaciones:', error)
    })




}
main()
    .then(async () => {
        await prisma01.$disconnect()
        await prisma02.$disconnect()
    })
    .catch(async (e) => {
        await prisma01.$disconnect()
        await prisma02.$disconnect()
        throw e
    })
    .finally(async () => {
        await prisma01.$disconnect()
        await prisma02.$disconnect()
    })

async function migratePagos() {
    const BATCH_SIZE = 100; // Número de registros por lote
    let lastMigratedId = 9600; // Último ID migrado
    let hasMore = true; // Control del ciclo

    const deletePago = await prisma01.pago.deleteMany()
    console.log('Pago eliminados: ', deletePago)

    while (hasMore) {
        // Obtener un lote de pagos de la base de datos origen
        const pagosCli2 = await prisma02.pagos.findMany({
            where: { idPago: { gt: lastMigratedId } }, // Filtrar por el último ID migrado
            take: BATCH_SIZE, // Tomar solo el tamaño del lote
            orderBy: { idPago: 'asc' } // Orden ascendente para procesar en secuencia
        });

        hasMore = pagosCli2.length > 0; // Determinar si hay más registros

        if (pagosCli2.length === 0) break; // Salir del ciclo si no hay registros

        // Obtener IDs de colegiados del lote actual
        const idsColegiadosLote = pagosCli2.map(pago => pago.idColegiado);

        // Consultar si estos IDs existen en la tabla de colegiados
        const colegiadosValidos = new Set(
            (await prisma01.colegiados.findMany({
                where: { col_id: { in: idsColegiadosLote } },
                select: { col_id: true },
            })).map(colegiado => colegiado.col_id)
        );

        const pagosData = pagosCli2
            .filter(pago => colegiadosValidos.has(pago.idColegiado))
            .map((pago) => ({
                pago_id: pago.idPago,
                pago_colegiado: pago.idColegiado,
                pago_fecha: validateDate(pago.fecha_pago),
                pago_monto_total: pago.monto_total,
                pago_nro_boletaventa: pago.nro_boletaventa,
                pago_recibo: pago.nro_recibo,
                pago_notas: limpiarTexto(pago.notas),
                pago_aporte: pago.total_aportes,
                pago_otros: pago.total_otros,
                pago_usu_create: 'admin',
                pago_fecha_create: new Date(),
            }));
        // Insertar el lote en la base de datos destino
        await prisma01.pago.createMany({
            data: pagosData,
            // skipDuplicates: true, // Opcional: omitir duplicados si ya existen
        });

        // Actualizar el último ID migrado al ID del último registro procesado
        lastMigratedId = pagosCli2[pagosCli2.length - 1].idPago;

        console.log(`Migrados ${pagosData.length} registros, último ID procesado: ${lastMigratedId}`);
    }
    console.log('Migración completa.');
}

async function migrateAportaciones() {
    const BATCH_SIZE = 300; // Número de registros por lote
    let lastMigratedId = 59189; // Último ID migrado
    let hasMore = true; // Control del ciclo

    // const deleteAportaciones = await prisma01.aportaciones.deleteMany();
    // console.log('Aportaciones eliminadas: ', deleteAportaciones);

    while (hasMore) {
        // Obtener un lote de aportaciones de la base de datos origen
        const aportacionesCli2 = await prisma02.aportaciones.findMany({
            where: { idAportacion: { gt: lastMigratedId } }, // Filtrar por el último ID migrado
            take: BATCH_SIZE, // Tomar solo el tamaño del lote
            orderBy: { idAportacion: 'asc' } // Orden ascendente para procesar en secuencia
        });

        hasMore = aportacionesCli2.length > 0; // Determinar si hay más registros

        if (aportacionesCli2.length === 0) break; // Salir del ciclo si no hay registros

        // Obtener IDs de colegiados, pagos y periodos del lote actual
        const idsColegiadosLote = aportacionesCli2.map(aport => aport.idColegiado);
        const idsPagosLote = aportacionesCli2.map(aport => aport.idPago);

        // Consultar si estos IDs existen en la base de datos destino
        const colegiadosValidos = new Set(
            (await prisma01.colegiados.findMany({
                where: { col_id: { in: idsColegiadosLote } },
                select: { col_id: true },
            })).map(colegiado => colegiado.col_id)
        );

        const pagosValidos = new Set(
            (await prisma01.pago.findMany({
                where: { pago_id: { in: idsPagosLote } },
                select: { pago_id: true },
            })).map(pago => pago.pago_id)
        );

        const aportacionesData = aportacionesCli2
            .filter(aport =>
                colegiadosValidos.has(aport.idColegiado) && pagosValidos.has(aport.idPago)
            )
            .map((aport) => ({
                aport_id: aport.idAportacion,
                aport_colegiado: aport.idColegiado,
                aport_pago: aport.idPago,
                aport_periodo: aport.idPeriodo,
                aport_mes: +aport.mes,
                aport_monto: aport.monto,
                aport_fecha: validateDate(aport.fecha_aporte),
                aport_usu_create: 'admin',
                aport_fecha_create: new Date(),
            }));

        // Insertar el lote en la base de datos destino
        await prisma01.aportaciones.createMany({
            data: aportacionesData,
        });

        // Actualizar el último ID migrado al ID del último registro procesado
        lastMigratedId = aportacionesCli2[aportacionesCli2.length - 1].idAportacion;

        console.log(`Migrados ${aportacionesData.length} registros, último ID procesado: ${lastMigratedId}`);
    }
    console.log('Migración completa.');
}


async function create_colegiado() {

    const deleteColegiado = await prisma01.colegiados.deleteMany()
    console.log('Colegiado eliminados: ', deleteColegiado)
    const deletePersona = await prisma01.persona.deleteMany()
    console.log('Persona eliminados: ', deletePersona)

    console.log("INICIANDO CARGA DE COLEGIADOS")
    const BATCH_SIZE = 50 // Número de registros por lote
    let hasMore = true
    let lastMigratedId = 0
    // 1. Obtén los datos de la base de datos origen
    while (hasMore) {
        const colegiadosCli2 = await prisma02.colegiados.findMany({
            where: { idColegiado: { gt: lastMigratedId } },
            take: BATCH_SIZE,
            orderBy: {
                idColegiado: 'asc'
            }
        })

        hasMore = colegiadosCli2.length > 0

        for (const colegiado of colegiadosCli2) {

            // cambiar datos de colegiado
            colegiado.apellidos = colegiado.apellidos?.toUpperCase()
            colegiado.nombres = colegiado.nombres?.toUpperCase()
            colegiado.direccion = colegiado.direccion?.toUpperCase()
            colegiado.centro_trabajo = colegiado.centro_trabajo?.toUpperCase()

            const fech_nac = colegiado.fecha_nacimiento ? new Date(colegiado.fecha_nacimiento).toISOString().split('T')[0] : null
            const estado = await per_st.find(item => item.value === colegiado.estado)?.label
            const condicion = await col_st.find(item => item.value === +colegiado.condicion)?.label
            const limpioDesc = await limpiarTexto(colegiado.observaciones)
            console.log(colegiado.idColegiado)
            await prisma01.persona.create({
                data: {
                    per_tdoc: 1,
                    per_nro_doc: colegiado.dni,
                    per_nombre: colegiado.nombres,
                    per_appat: colegiado.apellidos,
                    per_correo: colegiado.email,
                    per_direccion1: colegiado.direccion,
                    per_celular2: colegiado.celular,
                    per_fech_nac: fech_nac,
                    per_st: estado,
                    per_usu_create: "admin",
                    per_fech_create: new Date(),
                    colegiados: {
                        create: {
                            col_id: colegiado.idColegiado,
                            col_nro_cop: colegiado.nro_cop,
                            col_fecha_colegiatura: colegiado.fecha_colegiatura,
                            col_centro_trabajo: colegiado.centro_trabajo,
                            col_st: condicion,
                            col_obs: limpioDesc,
                            col_foto: colegiado.fotografia,
                            col_usu_create: "admin",
                            col_fech_create: new Date(),
                        }
                    }
                }
            })
            lastMigratedId = colegiado.idColegiado
        }
        console.log(`Migrated ${lastMigratedId} users so far.`);


    }

}





