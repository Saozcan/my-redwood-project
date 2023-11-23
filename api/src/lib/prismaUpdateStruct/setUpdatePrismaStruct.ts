import * as _ from 'lodash'

const prismaStruct = {
  updateMany: [],
  createMany: [],
  delete: [],
}

function partOfUpdatePrismaStruct({
  incomingData,
  updateData,
  createData,
  deleteData,
}) {
  const prismaStructObject = {} as any
  if (_.isObject(incomingData)) {
    for (const key in incomingData) {
      if (_.isArray(incomingData[key]) || _.isObject(incomingData[key])) {
        prismaStructObject[key] = setUpdatePrismaStructRecursion({
          incomingData: incomingData[key],
          updateData: updateData?.[key] ?? null,
          createData: createData?.[key] ?? null,
          deleteData: deleteData?.[key] ?? null,
        })
      }
      prismaStructObject[key] = prismaStructObject[key] ?? updateData[key]
    }
  }

  return prismaStructObject
}

function partOfCreatePrismaStruct({
  incomingData,
  updateData,
  createData,
  deleteData,
}) {
  const prismaStructObject = {} as any
  if (_.isObject(incomingData)) {
    console.log('incomingData: ', incomingData)
    console.log('updateData: ', updateData)
    console.log('createData: ', createData)
    console.log('deleteData: ', deleteData)

    for (const key in incomingData) {
      if (_.isArray(incomingData[key]) || _.isObject(incomingData[key])) {
        prismaStructObject[key] = setUpdatePrismaStructRecursion({
          incomingData: incomingData[key],
          updateData: updateData?.[key] ?? null,
          createData: createData?.[key] ?? null,
          deleteData: deleteData?.[key] ?? null,
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
          createData: createData?.find((j) => j.id === item.id) ?? null,
          deleteData: deleteData?.find((j) => j.id === item.id) ?? null,
        }),
        where: { id: item.id },
      }))
    }
    if (createData) {
      updatePrismaStruct.createMany = createData.map((item) => ({
        data: partOfCreatePrismaStruct({
          incomingData: incomingData.find((j) => j.id === item.id),
          updateData: updateData?.find((j) => j.id === item.id) ?? null,
          createData: createData.find((j) => j.id === item.id) ?? null,
          deleteData: deleteData?.find((j) => j.id === item.id) ?? null,
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
          createData: createData ?? null,
          deleteData: deleteData ?? null,
        }),
        where: { id: updateData.id },
      }
    }
    if (createData) {
      prismaStructObject.create = {
        data: partOfCreatePrismaStruct({
          incomingData: incomingData,
          updateData: updateData ?? null,
          createData: createData ?? null,
          deleteData: deleteData ?? null,
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
