import * as _ from 'lodash'

const prismaStruct = {
  create: [],
  upsert: [],
  update: [],
  delete: [],
}

function partOfUpdatePrismaStruct({ incomingData, updateData, deleteData }) {
  const prismaStructObject = {} as any
  if (_.isObject(updateData)) {
    for (const key in updateData) {
      if (_.isArray(updateData[key]) || _.isObject(updateData[key])) {
        prismaStructObject[key] = setUpdatePrismaStructRecursion({
          incomingData: incomingData[key],
          updateData: updateData?.[key] ?? null,
          deleteData: deleteData?.[key] ?? null,
        })
      }
      prismaStructObject[key] = prismaStructObject[key] ?? updateData[key]
    }
  }

  return prismaStructObject
}

function partOfDeletePrismaStruct({ incomingData, updateData, deleteData }) {
  const prismaStructObject = {} as any
  if (_.isObject(deleteData)) {
    for (const key in deleteData) {
      if (_.isArray(deleteData[key]) || _.isObject(deleteData[key])) {
        prismaStructObject[key] = setUpdatePrismaStructRecursion({
          incomingData: incomingData[key],
          updateData: updateData?.[key] ?? null,
          deleteData: deleteData?.[key] ?? null,
        })
      }
      prismaStructObject[key] = prismaStructObject[key] ?? deleteData[key]
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
  // if (!updateData && !createData && !deleteData) {
  //   return null
  // }
  const updatePrismaStruct = new Map()
  updatePrismaStruct.set('create', [])
  updatePrismaStruct.set('upsert', [])
  updatePrismaStruct.set('update', [])
  updatePrismaStruct.set('delete', [])

  if (_.isArray(incomingData)) {
    if (incomingData && !createData && updateData) {
      updatePrismaStruct.set(
        'update',
        incomingData.map((item) => ({
          update: partOfUpdatePrismaStruct({
            incomingData: incomingData.find((j) => j.id === item.id),
            updateData: updateData?.find((j) => j.id === item.id) ?? null,
            deleteData: deleteData?.find((j) => j.id === item.id) ?? null,
          }),
          create: partOfCreatePrismaStruct({
            incomingData: incomingData.find((j) => j.id === item.id),
            createData: updateData?.find((j) => j.id === item.id) ?? null,
          }),
          where: { id: item.id },
        }))
      )
    }
    if (createData && !updateData) {
      updatePrismaStruct.set(
        'create',
        createData.map((item) => ({
          ...partOfCreatePrismaStruct({
            incomingData: incomingData.find((j) => j.id === item.id),
            createData:
              { ...createData?.find((j) => j.id === item.id) } ?? null,
          }),
        }))
      )
    }
    if (deleteData && updateData) {
      updatePrismaStruct.set(
        'delete',
        deleteData.map((item) => ({
          id: item.id,
        }))
      )
    }
    if (deleteData && !updateData) {
      updatePrismaStruct.set(
        'update',
        incomingData.map((item) => ({
          data: partOfDeletePrismaStruct({
            incomingData: incomingData.find((j) => j.id === item.id),
            updateData: updateData?.find((j) => j.id === item.id) ?? null,
            deleteData: deleteData?.find((j) => j.id === item.id) ?? null,
          }),
          where: { id: item.id },
        }))
      )
      updatePrismaStruct.set(
        'delete',
        deleteData.map((item) => ({
          id: item.id,
        }))
      )
    }
    updatePrismaStruct.forEach((value, key) => {
      if (_.isEmpty(value) || !value) {
        updatePrismaStruct.delete(key)
      }
    })

    const object = Object.fromEntries(updatePrismaStruct)
    return object
  }

  const prismaStructObject = new Map()
  prismaStructObject.set('create', {})
  prismaStructObject.set('upsert', {})
  prismaStructObject.set('update', {})
  prismaStructObject.set('delete', {})
  if (_.isObject(incomingData as any)) {
    if (incomingData && !createData && updateData) {
      prismaStructObject.set('update', {
        data: partOfUpdatePrismaStruct({
          incomingData: incomingData,
          updateData: updateData ?? null,
          deleteData: deleteData ?? null,
        }),
        where: { id: incomingData.id },
      })
    }
    if (createData && !updateData) {
      prismaStructObject.set('create', {
        data: partOfCreatePrismaStruct({
          incomingData: incomingData,
          createData: createData ?? null,
        }),
      })
    }
    if (deleteData && updateData) {
      prismaStructObject.set('delete', {
        where: { id: deleteData.id },
      })
    }
    if (deleteData && !updateData) {
      prismaStructObject.set('update', {
        data: partOfDeletePrismaStruct({
          incomingData: incomingData,
          updateData: updateData ?? null,
          deleteData: deleteData ?? null,
        }),
        where: { id: incomingData.id },
      })
      prismaStructObject.set('delete', {
        where: { id: deleteData.id },
      })
    }
    prismaStructObject.forEach((value, key) => {
      console.log(key, value)

      if (_.isEmpty(value) || !value) {
        prismaStructObject.delete(key)
      }
    })
    return Object.fromEntries(prismaStructObject)
  }
}

export function setUpdatePrismaStruct({
  incomingData,
  updateData,
  deleteData,
}) {
  const updatePrismaStruct = {}
  for (const key in incomingData) {
    if (_.isArray(incomingData[key]) || _.isObject(incomingData[key])) {
      updatePrismaStruct[key] = setUpdatePrismaStructRecursion({
        incomingData: incomingData[key],
        updateData: updateData?.[key] ?? null,
        createData: null,
        deleteData: deleteData?.[key] ?? null,
      })
      if (_.isEmpty(updatePrismaStruct[key]) || !updatePrismaStruct[key]) {
        delete updatePrismaStruct[key]
      }
    } else {
      updateData?.[key] && (updatePrismaStruct[key] = updateData[key])
    }
  }

  //delete
  for (const key in deleteData) {
    if (_.isArray(deleteData[key]) || _.isObject(deleteData[key])) {
      updatePrismaStruct[key] = setUpdatePrismaStructRecursion({
        incomingData: deleteData[key],
        updateData: null,
        createData: null,
        deleteData: deleteData?.[key] ?? null,
      })
      if (_.isEmpty(updatePrismaStruct[key]) || !updatePrismaStruct[key]) {
        delete updatePrismaStruct[key]
      }
    } else {
      updateData?.[key] && (updatePrismaStruct[key] = deleteData[key])
    }
  }
  return { data: updatePrismaStruct, where: { id: incomingData.id } }
}

// data: setUpdatePrismaStruct({... seklinde calissin
