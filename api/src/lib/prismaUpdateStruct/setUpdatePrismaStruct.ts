import * as _ from 'lodash'

const prismaStruct = {
  updateMany: [],
  createMany: [],
  delete: [],
}

function partOfUpdatePrismaStruct({ incomingData, updateData }) {
  const prismaStructObject = {} as any
  if (_.isObject(updateData)) {
    for (const key in updateData) {
      if (_.isArray(updateData[key]) || _.isObject(updateData[key])) {
        prismaStructObject[key] = setUpdatePrismaStructRecursion({
          incomingData: incomingData[key],
          updateData: updateData?.[key] ?? null,
        })
      }
      prismaStructObject[key] = prismaStructObject[key] ?? updateData[key]
    }
  }

  return prismaStructObject
}

function partOfCreatePrismaStruct({ incomingData, createData }) {
  const prismaStructObject = {} as any
  if (_.isObject(createData)) {
    for (const key in createData) {
      if (_.isArray(createData[key]) || _.isObject(createData[key])) {
        prismaStructObject[key] = setUpdatePrismaStructRecursion({
          incomingData: incomingData[key],
          createData: createData?.[key] ?? null,
        })
      }
      prismaStructObject[key] = prismaStructObject[key] ?? createData[key]
    }
  }
  return prismaStructObject
}

export function setUpdatePrismaStructRecursion({
  incomingData,
  updateData,
  createData,
  deleteData,
}: {
  incomingData: any
  updateData?: any
  createData?: any
  deleteData?: any
}) {
  if (!updateData && !createData && !deleteData) {
    return null
  }
  const updatePrismaStruct = _.cloneDeep(prismaStruct)

  if (_.isArray(incomingData)) {
    if (updateData) {
      updatePrismaStruct.updateMany = updateData.map((item) => ({
        data: partOfUpdatePrismaStruct({
          incomingData: incomingData.find((j) => j.id === item.id),
          updateData: updateData.find((j) => j.id === item.id) ?? null,
        }),
        where: { id: item.id },
      }))
    }
    if (createData) {
      updatePrismaStruct.createMany = createData.map((item) => ({
        data: partOfCreatePrismaStruct({
          incomingData: incomingData.find((j) => j.id === item.id),
          createData: createData.find((j) => j.id === item.id) ?? null,
        }),
      }))
    }
    if (deleteData) {
      updatePrismaStruct.delete = deleteData.map((item) => ({
        where: { id: item.id },
      }))
    }
    return updatePrismaStruct
  }

  const prismaStructObject = {} as any
  if (_.isObject(incomingData as any)) {
    if (updateData) {
      prismaStructObject.update = {
        data: partOfUpdatePrismaStruct({
          incomingData: incomingData,
          updateData: updateData ?? null,
        }),
        where: { id: updateData.id },
      }
    }
    if (createData) {
      prismaStructObject.create = {
        data: partOfCreatePrismaStruct({
          incomingData: incomingData,
          createData: createData ?? null,
        }),
      }
    }
    if (deleteData) {
      prismaStructObject.delete = {
        where: { id: deleteData.id },
      }
    }
    return prismaStructObject
  }
}

export function setUpdatePrismaStruct({
  incomingData,
  updateData,
  createData,
  deleteData,
}) {
  const updatePrismaStruct = {}
  for (const key in incomingData) {
    if (_.isArray(incomingData[key]) || _.isObject(incomingData[key])) {
      updatePrismaStruct[key] = setUpdatePrismaStructRecursion({
        incomingData: incomingData[key],
        updateData: updateData[key] ?? null,
        createData: createData?.[key] ?? null,
        deleteData: deleteData?.[key] ?? null,
      })
    } else {
      updateData[key] && (updatePrismaStruct[key] = updateData[key])
    }
  }
  return { data: updatePrismaStruct, where: { id: incomingData.id } }
}

// data: setUpdatePrismaStruct({... seklinde calissin
