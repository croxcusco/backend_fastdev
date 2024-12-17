import { PrismaClient as PrismaClient1 } from '@prisma/client1'
import { PrismaClient as PrismaClient2 } from '@prisma/client2'
import { col_st, conceptoData, per_st, periodosData } from './array'
import { limpiarTexto, validateDate } from '../src/utils'

const prisma01 = new PrismaClient1()
const prisma02 = new PrismaClient2()

async function main() {
    // const deletePeriodos = await prisma01.periodos.deleteMany()
    // console.log('Periodos eliminados: ', deletePeriodos)
    // const deleteConcepto = await prisma01.concepto.deleteMany()
    // console.log('Concepto eliminados: ', deleteConcepto)

    const deleteAportaciones = await prisma01.aportaciones.deleteMany();
    console.log('Aportaciones eliminadas: ', deleteAportaciones);
    const deletePagoOtros = await prisma01.pago_otros.deleteMany();
    console.log("Registros eliminados de pago_otros: ", deletePagoOtros);
    const deletePago = await prisma01.pago.deleteMany()
    console.log('Pago eliminados: ', deletePago)


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

    // exportar pagos
    await migratePagos().then(() => {
        console.log('Migración de pagos completada')
    }).catch((error) => {
        console.error('Error al migrar pagos:', error)
    })

    await migrateAportaciones().then(() => {
        console.log('Migración de aportaciones completada')
    }).catch((error) => {
        console.error('Error al migrar aportaciones:', error)
    })


    await migratePagoOtros().then(() => {
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
    const BATCH_SIZE = 1000; // Número de registros por lote
    let lastMigratedId = 0; // Último ID migrado
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
    const BATCH_SIZE = 1000; // Número de registros por lote
    let lastMigratedId = 1; // Último ID migrado
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

async function migratePagoOtros() {
    const BATCH_SIZE = 1000; // Número de registros por lote
    let lastMigratedId = 0; // Último ID migrado
    let hasMore = true; // Control del ciclo

    const deletePagoOtros = await prisma01.pago_otros.deleteMany();
    console.log("Registros eliminados de pago_otros: ", deletePagoOtros);

    while (hasMore) {
        // Obtener un lote de datos de la tabla origen
        const pagosItemsCli2 = await prisma02.pagositems.findMany({
            where: { idDetalle: { gt: lastMigratedId } },
            take: BATCH_SIZE,
            orderBy: { idDetalle: "asc" },
        });

        hasMore = pagosItemsCli2.length > 0;

        if (pagosItemsCli2.length === 0) break;

        // Validar la existencia de IDs relacionados en las tablas destino
        const idsPagosLote = pagosItemsCli2.map((item) => item.idPago);

        const pagosValidos = new Set(
            (await prisma01.pago.findMany({
                where: { pago_id: { in: idsPagosLote } },
                select: { pago_id: true },
            })).map((pago) => pago.pago_id)
        );

        // Preparar los datos filtrados y mapeados para la migración
        const pagoOtrosData = pagosItemsCli2
            .filter((item) => pagosValidos.has(item.idPago))
            .map((item) => ({
                pago_o_pago: item.idPago,
                pago_o_concepto: item.idConcepto,
                pago_o_desc: item.descripcion || null,
                pago_o_importe: item.importe,
                pago_o_usu_create: "admin",
                pago_o_fecha_create: item.creado_el,
            }));

        // Insertar datos en la tabla destino
        await prisma01.pago_otros.createMany({
            data: pagoOtrosData,
        });

        // Actualizar el último ID migrado
        lastMigratedId = pagosItemsCli2[pagosItemsCli2.length - 1].idDetalle;

        console.log(
            `Migrados ${pagoOtrosData.length} registros, último ID procesado: ${lastMigratedId}`
        );
    }
    console.log("Migración de pago_otros completa.");
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





