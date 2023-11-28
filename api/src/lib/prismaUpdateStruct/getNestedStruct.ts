import * as _ from 'lodash'

import { setUpdatePrismaStruct } from './setUpdatePrismaStruct'

/**
 * This function is used by isEqualsWith to compare two objects. Specific situations.
 */
function customComparator(objValue, othValue, key, object, other, stack) {
  // Initialize stack if it's the first call
  if (!stack) {
    stack = new Set()
  }
  // If either value is an object, do a deep comparison
  if (_.isObject(objValue) && _.isObject(othValue)) {
    // Handle circular references
    if (stack.has(objValue) || stack.has(othValue)) {
      return false
    }
    stack.add(objValue)
    stack.add(othValue)
    // Iterate over keys in the first object for deep comparison
    for (const k in objValue) {
      if (_.has(objValue, k)) {
        if (
          !customComparator(
            objValue[k],
            othValue[k],
            k,
            objValue,
            othValue,
            stack
          )
        ) {
          return false
        }
      }
    }
    // Remove the current objects from the stack
    stack.delete(objValue)
    stack.delete(othValue)
    // Objects are considered equal if all their corresponding keys matched
    return true
  }
  // Direct comparison for non-object values
  return _.isEqual(objValue, othValue)
}

export function deepCleaningExceptIds<T>(data: Readonly<T>) {
  function deepCleaningExceptIdsRecursive(data) {
    if (_.isObject(data)) {
      for (const key in data) {
        if (_.isObject(data[key]) || _.isArray(data[key])) {
          if (_.isObject(data[key]) && _.has(data[key], 'id')) {
            deepCleaningExceptIdsRecursive(data[key])
          }
          deepCleaningExceptIdsRecursive(data[key])
        } else if (key !== 'id') {
          delete data[key]
        }
      }
    } else if (_.isArray(data)) {
      data.forEach((item) => {
        deepCleaningExceptIdsRecursive(item)
      })
    }
  }
  const clone = _.cloneDeep(data)
  deepCleaningExceptIdsRecursive(clone)
  return clone
}

function getCreateData(incoming, current) {
  return getCreateDeleteData(incoming, current)
}

function getDeleteData(incoming, current) {
  return getCreateDeleteData(current, incoming)
}
/**
 ** Get create, delete data.
 */
export function getCreateDeleteData(incoming, current) {
  let incomingWithoutIds = _.cloneDeep(incoming)
  incomingWithoutIds = deepCleaningExceptIds(incomingWithoutIds)
  let currentWithoutIds = _.cloneDeep(current)
  currentWithoutIds = deepCleaningExceptIds(currentWithoutIds)

  if (_.isEqualWith(incomingWithoutIds, currentWithoutIds, customComparator)) {
    return null
  }

  return setCreateDeleteData(incomingWithoutIds, currentWithoutIds, incoming)
}

function setCreateDeleteData(incomingWithoutIds, currentWithoutIds, incoming) {
  function setCreateDeleteDataRecursive(
    incomingWithoutIds,
    currentWithoutIds,
    incoming
  ) {
    if (!_.isObject(incomingWithoutIds)) return

    for (const key in incomingWithoutIds) {
      if (!currentWithoutIds[key]) {
        incomingWithoutIds[key] = incoming[key]
        continue
      }
      if (_.isArray(incomingWithoutIds[key])) {
        incomingWithoutIds[key].forEach((item, index) => {
          if (_.isObject(item)) {
            if (
              _.has(item, 'id') &&
              !currentWithoutIds[key].find((i: any) => {
                const itemAny = item as any
                return i.id === itemAny.id
              })
            ) {
              incomingWithoutIds[key][index] = incoming[key][index]
            } else {
              setCreateDeleteDataRecursive(
                item,
                currentWithoutIds[key].find((i: any) => {
                  const itemAny = item as any
                  return i.id === itemAny.id
                }),
                incoming[key][index]
              )
            }
          }
        })
      } else if (_.isObject(incomingWithoutIds[key])) {
        if (
          _.has(incomingWithoutIds[key], 'id') &&
          !_.has(currentWithoutIds[key], 'id')
        ) {
          incomingWithoutIds[key] = incoming[key]
        } else {
          setCreateDeleteDataRecursive(
            incomingWithoutIds[key],
            currentWithoutIds[key],
            incoming[key]
          )
        }
      }
    }
  }
  const clone = _.cloneDeep(incomingWithoutIds)
  setCreateDeleteDataRecursive(clone, currentWithoutIds, incoming)
  return clone
}

/**
 ** If there is no change between incoming and current data => null
 ** If there is change between incoming and current data => updateData
 */
export function getUpdateData(incomingData, currentData) {
  let updateData = _.cloneDeep(incomingData)
  const currentDataClone = _.cloneDeep(currentData)

  if (_.isEqualWith(updateData, currentDataClone, customComparator)) {
    return null
  }

  updateData = deepCleaningExceptIds(updateData)
  return setUpdateData(updateData, currentDataClone, incomingData)
}

function setUpdateData(updateData, currentData, incomingData) {
  function setUpdateDataRecursive(updateData, currentData, incomingData) {
    if (!_.isObject(incomingData) || !_.isObject(currentData)) return

    if (!_.isEqualWith(incomingData, currentData, firstLevelComparator)) {
      for (const key in incomingData) {
        if (!_.isArray(incomingData[key]) && !_.isObject(incomingData[key])) {
          updateData[key] = incomingData[key]
        } else if (_.isObject(incomingData[key])) {
          if (
            !_.has(incomingData[key], 'id') &&
            !_.isEqualWith(
              incomingData[key],
              currentData[key],
              firstLevelComparator
            )
          ) {
            updateData[key] = incomingData[key]
          }
        }
      }
    }

    for (const key in incomingData) {
      if (_.isArray(incomingData[key])) {
        incomingData[key].forEach((item, index) => {
          if (_.isObject(item)) {
            if (currentData[key]) {
              setUpdateDataRecursive(
                updateData[key][index],
                currentData[key].find((i: any) => {
                  const itemAny = item as any
                  return i.id === itemAny.id
                }),
                incomingData[key][index]
              )
            }
          }
        })
      } else if (_.isObject(incomingData[key])) {
        if (currentData[key]) {
          setUpdateDataRecursive(
            updateData[key],
            currentData[key],
            incomingData[key]
          )
        }
      }
    }
  }
  const clone = _.cloneDeep(updateData)
  setUpdateDataRecursive(clone, currentData, incomingData)
  return clone
}

/**
 ** Only compare first level for objects
 */
export function firstLevelComparator(objValue, othValue) {
  if (_.isEqual(objValue, othValue)) {
    return true
  }
  if (!_.isObject(objValue) || !_.isObject(othValue)) {
    return true
  }

  for (const key in objValue) {
    if (!_.isArray(objValue[key]) && !_.isObject(objValue[key])) {
      if (objValue[key] !== othValue[key]) {
        return false
      }
    } else if (_.isObject(objValue[key]) && !_.has(objValue[key], 'id')) {
      return firstLevelComparator(objValue[key], othValue[key])
    }
  }
  return true
}

/**
 ** If incomingData exists but currentData => Only create struct
 ** If currentData exists but incomingData => Only delete struct
 ** ---------------------------------------------------------------
 ** Not need to use create object, cause we are using upsert
 ** Upsert use update and create together, if update didn't work then create
 ** Compare create and update data onto updateData
 *! If the table to be deleted has only ID and related tables, this will not work!!!!!!!
 *! Only works with arrays
 */
export function getNestedPrismaStruct<T>({
  incomingData,
  currentData,
  _options,
}: {
  incomingData?: Readonly<T>
  currentData?: Readonly<T>
  _options?: object
}) {
  const { updateData, createData, deleteData } = getCreateDeleteUpdateData({
    incomingData,
    currentData,
    _options,
  })

  if (!updateData && !deleteData && !createData) {
    return null
  }

  return setUpdatePrismaStruct({
    incomingData,
    updateData,
    createData,
    deleteData,
  })
}

/**
 ** Is there any change between incoming and current data except ids => create updateData
 ** First clean all data except ids and objects which has id
 ** Is there any change between incoming and current data => create CreateData and DeleteData
 ** If deleteData has only id so don't delete it, if there are more properties then delete it.
 *
 *! If the table to be deleted has only ID and related tables, this will not work!!!!!!!
 */
export function getCreateDeleteUpdateData<T>({
  incomingData,
  currentData,
  _options,
}: {
  incomingData?: Readonly<T>
  currentData?: Readonly<T>
  _options?: object
}) {
  if (!incomingData && currentData) {
    return {
      updateData: null,
      createData: null,
      deleteData: _.has(_options, 'cascadeList')
        ? cascadeUpdate(currentData, _options)
        : currentData,
    }
  }

  if (!currentData && incomingData) {
    return {
      updateData: null,
      createData: incomingData,
      deleteData: null,
    }
  }

  let updateData = getUpdateData(incomingData, currentData)
  let createData = getCreateData(incomingData, currentData)
  let deleteData = getDeleteData(incomingData, currentData)
  updateData = clearEmptyFields(updateData)
  createData = clearEmptyFields(createData)
  deleteData = clearEmptyFields(deleteData)

  if (
    deleteData &&
    _.keys(deleteData).length === 1 &&
    _.has(deleteData, 'id') &&
    incomingData['id'] === deleteData['id']
  ) {
    deleteData = null
  }

  if (deleteData && _.has(_options, 'cascadeList')) {
    deleteData = cascadeUpdate(deleteData, _options)
  }

  updateData = _.merge(createData, updateData)
  updateData = addOnlyOwnPropertiesToSecondObject(incomingData, updateData)
  updateData = _.isEmpty(updateData) ? null : updateData
  return {
    updateData,
    createData,
    deleteData,
  }
}

/**
 ** If only id exists in the object, it will be deleted
 */
export function clearEmptyFields(data, options?: { keys: string[] }) {
  function clearEmptyFieldsRecursive(data, options?: { keys: string[] }) {
    if (_.isArray(data)) {
      // Iterate backwards through the array to avoid issues with splicing
      for (let i = data.length - 1; i >= 0; i--) {
        if (
          _.isObject(data[i]) &&
          clearEmptyFieldsRecursive(data[i], options)
        ) {
          data.splice(i, 1)
        }
      }
      // Remove the array itself if it's empty after processing
      return data.length === 0
    } else if (_.isObject(data)) {
      const keys = Object.keys(data)
      // Check if the object only has 'id' as a property
      if (keys.length === 1 && keys[0] === 'id') {
        return true
      }
      // Recursively process each property of the object
      keys.forEach((key) => {
        if (
          _.isObject(data[key]) &&
          clearEmptyFieldsRecursive(data[key], options)
        ) {
          if (!options?.keys?.includes(key)) {
            delete data[key]
          }
        } else if (
          _.isArray(data[key]) &&
          clearEmptyFieldsRecursive(data[key], options)
        ) {
          if (!options?.keys?.includes(key)) {
            delete data[key]
          }
        }
      })
      // Check if the object is empty after processing
      return _.isEmpty(data)
    }
    // Return false for non-object, non-array data
    return false
  }

  const clone = _.cloneDeep(data)
  clearEmptyFieldsRecursive(clone, options)
  return clone
}

export function deepCleanEmpty<T>(objOrArray: Readonly<T>) {
  function deepCleanEmptyRecursive(objOrArray) {
    function isEmpty(value) {
      return (
        (Array.isArray(value) && value.length === 0) ||
        (Object.prototype.toString.call(value) === '[object Object]' &&
          Object.keys(value).length === 0)
      )
    }
    if (Array.isArray(objOrArray)) {
      objOrArray.forEach((item, index) => {
        if (_.isEmpty(item)) {
          objOrArray.splice(index, 1) // Remove empty objects/arrays
        }
      })
      return objOrArray
        .map((item) => (item = deepCleanEmpty(item)))
        .filter((item) => !isEmpty(item))
    } else if (typeof objOrArray === 'object' && objOrArray !== null) {
      Object.keys(objOrArray).forEach((key) => {
        const value = objOrArray[key]
        if (isEmpty(value)) {
          delete objOrArray[key] // Remove empty objects/arrays
        } else {
          objOrArray[key] = deepCleanEmpty(value)
        }
      })
      return objOrArray
    }
    return objOrArray
  }
  const clone = _.cloneDeep(objOrArray)
  return deepCleanEmptyRecursive(clone)
}

export function isThereAnyProperty(obj): boolean {
  if (!_.has(obj, 'id')) return false
  for (const key in obj) {
    if (_.isArray(obj[key]) && obj[key].length > 0) continue
    else if (typeof obj[key] === 'object' && !_.has(obj[key], 'id')) return true
    else if (!_.isObject(obj[key]) && !_.isArray(obj[key]) && key !== 'id') {
      return true
    }
  }
  return false
}

/**
 ** Merges properties from the first object (obj1) into the second object (obj2) under specific conditions.
 ** This function is designed to add properties from obj1 to obj2 without altering existing properties in obj2.
 */
export function addOnlyOwnPropertiesToSecondObject<T>(
  obj1: Readonly<T>,
  obj2: Readonly<T>
) {
  function mergeRecursive(source, target) {
    if (_.isArray(source)) {
      source.forEach((value) => {
        if (_.isObject(value) && _.has(value, 'id')) {
          mergeRecursive(
            value,
            target.find((i) => i.id === (value as any).id)
          )
        }
      })
    }
    if (_.isObject(source)) {
      _.forEach(source, (value, key) => {
        if (target && _.has(target, 'id') && !_.has(target, key)) {
          target[key] = _.cloneDeep(value)
        } else if (target && _.isObject(value) && _.isObject(target[key])) {
          mergeRecursive(value, target[key])
        }
      })
    }
  }
  const clone = _.cloneDeep(obj2)
  mergeRecursive(obj1, clone)
  return clone
}

/**
 ** If there is cascadeList in options, it will delete the nested tables.
 */
export function cascadeUpdate(deleteData, options) {
  const { cascadeList } = options

  function cascadeUpdateRecursive(deleteData) {
    if (_.isArray(deleteData)) {
      deleteData.forEach((item) => {
        cascadeUpdateRecursive(item)
      })
    } else if (_.isObject(deleteData)) {
      for (const key in deleteData) {
        if (_.isArray(deleteData[key])) {
          if (cascadeList.includes(key)) {
            deleteNestedTables(deleteData[key])
          } else {
            cascadeUpdateRecursive(deleteData[key])
          }
        } else if (_.isObject(deleteData[key])) {
          if (cascadeList.includes(key)) {
            deleteNestedTables(deleteData[key])
          } else {
            cascadeUpdateRecursive(deleteData[key])
          }
        }
      }
    }
  }

  const clone = _.cloneDeep(deleteData)
  cascadeUpdateRecursive(clone)
  return clone
}

export function deleteNestedTables(obj) {
  if (_.isArray(obj)) {
    obj.forEach((item) => {
      deleteNestedTables(item)
    })
    return
  }
  if (_.isObject(obj)) {
    for (const key in obj) {
      if (
        (_.isObject(obj[key]) && _.has(obj[key], 'id')) ||
        _.isArray(obj[key])
      ) {
        delete obj[key]
      }
    }
  }
}
