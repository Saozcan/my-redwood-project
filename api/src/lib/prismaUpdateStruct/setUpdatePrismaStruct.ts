import * as _ from 'lodash'

import {
  addMissingPropertiesToSecondObject,
  deepCleanEmpty,
  isThereAnyProperty,
} from './getNestedStruct'

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

/**
 * Only works with arrays...
 */
export function setUpdatePrismaStructRecursion({
  incomingData,
  updateData,
  createData,
  deleteData,
  _options,
}: {
  incomingData: any
  updateData?: any
  createData?: any
  deleteData?: any
  _options?: any
}) {
  const updatePrismaStruct = new Map()
  updatePrismaStruct.set('create', [])
  updatePrismaStruct.set('update', [])
  updatePrismaStruct.set('upsert', [])
  updatePrismaStruct.set('delete', [])

  if (_.isArray(incomingData)) {
    if (incomingData && !createData && updateData) {
      updatePrismaStruct.set(
        'upsert',
        incomingData.map((item) => ({
          update: partOfUpdatePrismaStruct({
            incomingData: incomingData.find((j) => j.id === item.id),
            updateData: incomingData?.find((j) => j.id === item.id) ?? null,
            deleteData: deleteData?.find((j) => j.id === item.id) ?? null,
          }),
          create: partOfCreatePrismaStruct({
            incomingData: incomingData.find((j) => j.id === item.id),
            createData: incomingData?.find((j) => j.id === item.id) ?? null,
          }),
          where: incomingData?.find((j) => j.id === item.id)
            ? { id: item.id }
            : {},
        }))
      )
      updatePrismaStruct.get('upsert').forEach((value, key) => {
        value = deepCleanEmpty(value)
        if (_.isEmpty(value) || !value) {
          updatePrismaStruct.get('upsert').splice(key, 1)
        }
      })
    }
    if (createData && !updateData) {
      updatePrismaStruct.set(
        'create',
        createData.map((item) => ({
          ...partOfCreatePrismaStruct({
            incomingData: incomingData.find((j) => j.id === item.id),
            createData:
              { ...incomingData?.find((j) => j.id === item.id) } ?? null,
          }),
        }))
      )
    }
    if (deleteData && updateData) {
      updatePrismaStruct.set(
        'delete',
        _.compact(
          deleteData?.map((item) => {
            if (isThereAnyProperty(item) && !_.has(item, '_isDeleted')) {
              item._isDeleted = true
              return {
                id: item.id,
              }
            }
          })
        )
      )
    }
    if (deleteData && !updateData) {
      const data = incomingData.map((item) => {
        let data = partOfDeletePrismaStruct({
          incomingData: incomingData.find((j) => j.id === item.id),
          updateData: updateData?.find((j) => j.id === item.id) ?? null,
          deleteData: deleteData?.find((j) => j.id === item.id) ?? null,
        })
        if (_.isObject(data)) {
          for (const key in data) {
            if (!data[key]) {
              delete data[key]
            }
          }
        }
        data = deepCleanEmpty(data)
        if (_.isEmpty(data) || !data) {
          return
        }
        return {
          data: data,
          where: deleteData?.find((j) => j.id === item.id)?.id
            ? {
                id: item.id,
              }
            : {},
        }
      })
      const compactData = _.compact(data)
      updatePrismaStruct.set('update', compactData ?? [])

      updatePrismaStruct.get('update').forEach((value) => {
        if (_.has(value, 'data') && _.isEmpty(value.data)) {
          delete value.data
          delete value.where
        }
      })
      updatePrismaStruct.set(
        'delete',
        deleteData?.map((item) => {
          if (isThereAnyProperty(item) && !_.has(item, '_isDeleted')) {
            return {
              id: item.id,
            }
          }
        })
      )
    }
    updatePrismaStruct.forEach((value, key) => {
      value = _.compact(value)
      value = deepCleanEmpty(value)
      if (_.isEmpty(value) || !value) {
        updatePrismaStruct.delete(key)
      }
    })

    const object = Object.fromEntries(updatePrismaStruct)
    return object
  }

  /**
   * Only works with arrays...
   */

  // const prismaStructObject = new Map()
  // prismaStructObject.set('create', {})
  // prismaStructObject.set('update', {})
  // prismaStructObject.set('upsert', {})
  // prismaStructObject.set('delete', {})
  // if (_.isObject(incomingData as any)) {
  //   if (incomingData && !createData && updateData) {
  //     prismaStructObject.set('upsert', {
  //       update: partOfUpdatePrismaStruct({
  //         incomingData: incomingData,
  //         updateData: updateData ?? null,
  //         deleteData: deleteData ?? null,
  //       }),
  //       create: partOfCreatePrismaStruct({
  //         incomingData: incomingData,
  //         createData: incomingData ?? null,
  //       }),
  //       where: { id: incomingData.id },
  //     })
  //   }
  //   if (createData && !updateData) {
  //     prismaStructObject.set('create', {
  //       data: partOfCreatePrismaStruct({
  //         incomingData: incomingData,
  //         createData: incomingData ?? null,
  //       }),
  //     })
  //   }
  //   if (deleteData && updateData) {
  //     prismaStructObject.set('delete', {
  //       where: { id: deleteData.id },
  //     })
  //   }
  //   if (deleteData && !updateData) {
  //     prismaStructObject.set('update', {
  //       data: partOfDeletePrismaStruct({
  //         incomingData: incomingData,
  //         updateData: updateData ?? null,
  //         deleteData: deleteData ?? null,
  //       }),
  //       where: { id: incomingData.id },
  //     })
  //     prismaStructObject.set('delete', {
  //       where: { id: deleteData.id },
  //     })
  //   }
  //   prismaStructObject.forEach((value, key) => {
  //     console.log(key, value)

  //     if (_.isEmpty(value) || !value) {
  //       prismaStructObject.delete(key)
  //     }
  //   })
  //   const object = Object.fromEntries(updatePrismaStruct)
  //   return object
  // }
}

/**
 ** It works only first levet of first level object...
 */
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
        updateData: updateData?.[key] ?? null,
        createData: !updateData?.[key] ? createData?.[key] : null,
        deleteData: deleteData?.[key] ?? null,
      })
      if (_.isEmpty(updatePrismaStruct[key]) || !updatePrismaStruct[key]) {
        delete updatePrismaStruct[key]
      }
    } else {
      updateData?.[key] !== undefined &&
        (updatePrismaStruct[key] = updateData[key])
    }
  }

  /**
   ** If only create
   */
  if (!updateData && !deleteData && createData) {
    return { ...incomingData, ...updatePrismaStruct }
  }

  /**
   * If update and create done and delete not done.
   * When upsert write if delete some table it write _isDeleted: true
   */
  for (const key in deleteData) {
    if (_.isArray(deleteData[key]) || _.isObject(deleteData[key])) {
      if (!updatePrismaStruct[key]) {
        updatePrismaStruct[key] = {}
      }
      updatePrismaStruct[key] = addMissingPropertiesToSecondObject(
        setUpdatePrismaStructRecursion({
          incomingData: deleteData[key],
          updateData: null,
          createData: null,
          deleteData: deleteData[key] ?? null,
          _options: updatePrismaStruct[key],
        }),
        updatePrismaStruct[key]
      )
      if (_.isEmpty(updatePrismaStruct[key]) || !updatePrismaStruct[key]) {
        delete updatePrismaStruct[key]
      }
    }
  }

  /**
   * Prisma exec a query sorted by alphabet and object made it sorted.
   * We have to use map to disable sort.
   */
  for (const key in updatePrismaStruct) {
    if (
      (_.has(updatePrismaStruct[key], 'update') &&
        _.has(updatePrismaStruct[key], 'delete')) ||
      (_.has(updatePrismaStruct[key], 'upsert') &&
        _.has(updatePrismaStruct[key], 'update'))
    ) {
      updatePrismaStruct[key] = disableSortForObjectFirstLevel(
        updatePrismaStruct[key]
      )
    }
  }
  return { ...updatePrismaStruct }
}

export function disableSortForObjectFirstLevel(object) {
  const mapObj = new Map()
  for (const key in object) {
    if (key === 'update') {
      mapObj.set(key, _.cloneDeep(object[key]))
      delete object[key]
    }
  }
  for (const key in object) {
    if (key === 'upsert') {
      mapObj.set(key, _.cloneDeep(object[key]))
      delete object[key]
    }
  }
  for (const key in object) {
    if (key === 'delete') {
      mapObj.set(key, _.cloneDeep(object[key]))
      delete object[key]
    }
  }

  const object2 = Object.fromEntries(mapObj)
  return (object = addMissingPropertiesToSecondObject(object2, object))
}
