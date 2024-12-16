import { PrismaClient as PrismaClient1 } from '@prisma/client1'
import { PrismaClient as PrismaClient2 } from '@prisma/client2'
import { col_st, conceptoData, per_st, periodosData } from './array'
import { limpiarTexto } from '../src/utils'

const prisma01 = new PrismaClient1()
const prisma02 = new PrismaClient2()


// model pago {
//     pago_id              Int            @id @default(autoincrement())
//     pago_colegiado       Int
//     pago_fecha           DateTime       @db.DateTime(0)
//     pago_monto_total     Decimal        @db.Decimal(10, 2)
//     pago_nro_boletaventa String?        @db.VarChar(45)
//     pago_recibo          String?        @db.VarChar(45)
//     pago_notas           String?        @db.VarChar(45)
//     pago_aporte          Decimal?       @db.Decimal(10, 2)
//     pago_otros           Decimal?       @db.Decimal(10, 2)
//     pago_usu_create      String?        @db.VarChar(45)
//     pago_fecha_create    DateTime?      @db.DateTime(0)
//     pago_usu_update      String?        @db.VarChar(45)
//     pago_fecha_update    DateTime?      @db.DateTime(0)
//     aportaciones         aportaciones[]
//     colegiados           colegiados     @relation(fields: [pago_colegiado], references: [col_id], onUpdate: Restrict, map: "fk_pago_colegiado")
//     detalle_pago_otros   pago_otros[]

//     @@index([pago_colegiado], map: "fk_pago_colegiado_idx")
//   }


// model pagos {
//     idPago          Int      @id @default(autoincrement())
//     idColegiado     Int
//     fecha_pago      String   @db.VarChar(30)
//     monto_total     Decimal  @db.Decimal(10, 2)
//     nro_boletaventa String   @db.VarChar(30)
//     nro_recibo      String   @db.VarChar(30)
//     notas           String   @db.Text
//     total_aportes   Decimal  @default(0.00) @db.Decimal(10, 2)
//     total_otros     Decimal  @default(0.00) @db.Decimal(10, 2)
//     creado_por      Int
//     creado_el       DateTime @default(now()) @db.Timestamp(0)
//     actualizado_el  DateTime @default(now()) @db.Timestamp(0)
//   }

async function main() {
    const deletePeriodos = await prisma01.periodos.deleteMany()
    console.log('Periodos eliminados: ', deletePeriodos)
    const deleteConcepto = await prisma01.concepto.deleteMany()
    console.log('Concepto eliminados: ', deleteConcepto)
    const deletePago = await prisma01.pago.deleteMany()
    console.log('Pago eliminados: ', deletePago)


    const periodos = await prisma01.periodos.createMany({
        data: periodosData
    })
    console.log('Periodos creados: ', periodos)

    const concepto = await prisma01.concepto.createMany({
        data: conceptoData
    })
    console.log('Concepto creado: ', concepto)

    // //exportar colegiados
    // create_colegiado()

    migratePagos().then(() => {
        console.log('Migración de pagos completada')
    }).catch((error) => {
        console.error('Error al migrar pagos:', error)
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
    const BATCH_SIZE = 1; // Número de registros por lote
    let lastMigratedId = 0; // Último ID migrado
    let hasMore = true; // Control del ciclo

    while (hasMore) {
        // Obtener un lote de pagos de la base de datos origen
        const pagosCli2 = await prisma02.pagos.findMany({
            where: { 
                AND: [
                    {idPago: { gt: lastMigratedId } },
                    {idColegiado: { notIn: [182] } }
                ]
            }, // Filtrar por el último ID migrado
            take: BATCH_SIZE, // Tomar solo el tamaño del lote
            orderBy: { idPago: 'asc' } // Orden ascendente para procesar en secuencia
        });

        hasMore = pagosCli2.length > 0; // Determinar si hay más registros

        if (pagosCli2.length === 0) break; // Salir del ciclo si no hay registros

        // Preparar los datos para la inserción en la base de datos destino
        const pagosData = pagosCli2.map((pago) => ({
            pago_id: pago.idPago,
            pago_colegiado: pago.idColegiado,
            pago_fecha: new Date(pago.fecha_pago),
            pago_monto_total: pago.monto_total,
            pago_nro_boletaventa: pago.nro_boletaventa,
            pago_recibo: pago.nro_recibo,
            pago_notas: limpiarTexto(pago.notas),
            pago_aporte: pago.total_aportes,
            pago_otros: pago.total_otros,
            pago_usu_create: 'admin',
            pago_fecha_create: new Date(),
        }));

        console.log(pagosData)

        // Insertar el lote en la base de datos destino
        await prisma01.pago.createMany({
            data: pagosData,
        });

        // Actualizar el último ID migrado al ID del último registro procesado
        lastMigratedId = pagosCli2[pagosCli2.length - 1].idPago;

        console.log(`Migrados ${pagosData.length} registros, último ID procesado: ${lastMigratedId}`);
    }

    console.log('Migración completa.');
}
async function create_colegiado() {

    const deleteColegiado = await prisma01.colegiados.deleteMany()
    console.log('Colegiado eliminados: ', deleteColegiado)
    // const deletePersona = await prisma01.persona.deleteMany()
    // console.log('Persona eliminados: ', deletePersona)

    console.log("INICIANDO CARGA DE COLEGIADOS")
    const BATCH_SIZE = 50 // Número de registros por lote
    let skip = 0
    let hasMore = true
    let lastMigratedId = 0
    // 1. Obtén los datos de la base de datos origen
    while (hasMore) {
        const colegiadosCli2 = await prisma02.colegiados.findMany({
            where: { idColegiado: { gt: lastMigratedId } },
            skip,
            take: BATCH_SIZE,
            orderBy: {
                idColegiado: 'asc'
            }
        })
        hasMore = colegiadosCli2.length > 0
        skip += BATCH_SIZE


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
            console.log(fech_nac)
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
        console.log(`Migrated ${skip} users so far. user ID ${lastMigratedId}`)


    }

}





