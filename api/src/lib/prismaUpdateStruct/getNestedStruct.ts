import * as _ from 'lodash'

import { setUpdatePrismaStruct } from './setUpdatePrismaStruct'

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

// tekrar gozden gecirilecek, objeler icin tam id kontrolu saglandi mi bakilacak
function deepCleaningExceptIds(data) {
  if (_.isObject(data)) {
    for (const key in data) {
      if (_.isObject(data[key]) || _.isArray(data[key])) {
        if (_.isObject(data[key]) && _.has(data[key], 'id')) {
          deepCleaningExceptIds(data[key])
        }
        deepCleaningExceptIds(data[key])
      } else if (key !== 'id') {
        delete data[key]
      }
    }
  } else if (_.isArray(data)) {
    data.forEach((item) => {
      deepCleaningExceptIds(item)
    })
  }
}

function getCreateData(incoming, current) {
  return getCreateDeleteData(incoming, current)
}
function getDeleteData(incoming, current) {
  return getCreateDeleteData(current, incoming)
}
/**
 * if you change the current and incoming it gives the delete data
 * @param incoming
 * @param current
 */
function getCreateDeleteData(incoming, current) {
  const incomingWithoutIds = _.cloneDeep(incoming)
  deepCleaningExceptIds(incomingWithoutIds)
  const currentWithoutIds = _.cloneDeep(current)
  deepCleaningExceptIds(currentWithoutIds)

  if (_.isEqualWith(incomingWithoutIds, currentWithoutIds, customComparator)) {
    return null
  }

  setCreateDeletData(incomingWithoutIds, currentWithoutIds, incoming)
  return incomingWithoutIds
}

function setCreateDeletData(incomingWithoutIds, currentWithoutIds, incoming) {
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
            setCreateDeletData(
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
        setCreateDeletData(
          incomingWithoutIds[key],
          currentWithoutIds[key],
          incoming[key]
        )
      }
    }
  }
}

/**
 * UPDATE DATA
 * Senaryomuz su sekilde
 * Burda bu sefer her bir alan icin isequal islemi yapilacak eger
 * incoming alani uzerinde degisiklik varsa birinci katmanda updateData ya eklenecek
 * eger yoksa ikinci katman bakilacak recursive bir sekilde olacak
 */
function getUpdateData(incomingData, currentData) {
  const updateData = _.cloneDeep(incomingData)
  const currentDataClone = _.cloneDeep(currentData)

  if (_.isEqualWith(updateData, currentDataClone, customComparator)) {
    return null
  }

  deepCleaningExceptIds(updateData)
  setUpdateData(updateData, currentDataClone, incomingData)
  return updateData
}

// onjeyi gez, array e dnek gelirsen gez,
// objeye denk gelirsen
function setUpdateData(updateData, currentData, incomingData) {
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
            setUpdateData(
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
        setUpdateData(updateData[key], currentData[key], incomingData[key])
      }
    }
  }
}

function firstLevelComparator(objValue, othValue) {
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

export function updateNestedData<T>({
  incomingData,
  currentData,
  _options,
}: {
  incomingData: T
  currentData: T
  _options?: object
}) {
  // script olusturmada sorun yok fakat getUpdateData tam calismiyor, bir yerde farklilik oldugunda hepsini donuyor.
  // ikinci asama create yoksa sadece update dongusu olustur.
  const updateData = getUpdateData(incomingData, currentData)
  const createData = getCreateData(incomingData, currentData)
  const deleteData = getDeleteData(incomingData, currentData)
  clearEmptyFields(updateData)
  clearEmptyFields(createData)
  clearEmptyFields(deleteData)
  addMissingPropertiesToSecondObject(createData, updateData)
  deepCleaningExceptIds(deleteData)

  // const merged = deepMergeObjectsForDelete(
  //   _.cloneDeep(incomingData),
  //   _.cloneDeep(deleteData)
  // )

  if (
    !updateData &&
    !createData &&
    (!deleteData ||
      _.isEmpty(deleteData) ||
      Object.keys(deleteData).length == 1)
  ) {
    return null
  }

  return setUpdatePrismaStruct({
    incomingData,
    updateData,
    deleteData,
  })
}

// updateNestedData({ incomingData, currentData })

export function clearEmptyFields(data, options?: { keys: string[] }) {
  if (_.isArray(data)) {
    // Iterate backwards through the array to avoid issues with splicing
    for (let i = data.length - 1; i >= 0; i--) {
      if (_.isObject(data[i]) && clearEmptyFields(data[i], options)) {
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
      if (_.isObject(data[key]) && clearEmptyFields(data[key], options)) {
        if (!options?.keys?.includes(key)) {
          delete data[key]
        }
      } else if (_.isArray(data[key]) && clearEmptyFields(data[key], options)) {
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

export function addMissingPropertiesToSecondObject(obj1, obj2) {
  function mergeRecursive(source, target) {
    if (_.isArray(source)) {
      console.log('source: ', source)

      source.forEach((value, index) => {
        if (_.isObject(value)) {
          mergeRecursive(value, target[index])
        }
      })
    }

    if (_.isObject(source)) {
      _.forEach(source, (value, key) => {
        if (!_.has(target, key)) {
          target[key] = _.cloneDeep(value)
        } else if (_.isObject(value) && _.isObject(target[key])) {
          mergeRecursive(value, target[key])
        }
      })
    }
  }

  mergeRecursive(obj1, obj2)
}

export function deepCleanEmpty(objOrArray) {
  // Function to determine if an object or array is empty
  function isEmpty(value) {
    return (
      (Array.isArray(value) && value.length === 0) ||
      (Object.prototype.toString.call(value) === '[object Object]' &&
        Object.keys(value).length === 0)
    )
  }

  // If it's an array, filter out empty objects/arrays and apply recursively
  if (Array.isArray(objOrArray)) {
    console.log('objOrArray: ', objOrArray)

    objOrArray.forEach((item, index) => {
      if (_.isEmpty(item)) {
        objOrArray.splice(index, 1) // Remove empty objects/arrays
      }
    })
    return objOrArray
      .map((item) => deepCleanEmpty(item))
      .filter((item) => !isEmpty(item))
  }
  // If it's an object, apply recursively to its properties
  else if (typeof objOrArray === 'object' && objOrArray !== null) {
    Object.keys(objOrArray).forEach((key) => {
      const value = objOrArray[key]
      if (isEmpty(value)) {
        delete objOrArray[key] // Remove empty objects/arrays
      } else {
        objOrArray[key] = deepCleanEmpty(value) // Apply recursively
      }
    })
    return objOrArray
  }

  // Return the value if it's neither an object nor an array
  return objOrArray
}

// export function deepMergeObjectsForDelete(obj1, obj2) {
//   function mergeIdRecursive(target, source) {
//     if (_.isArray(target) && _.isArray(source)) {
//       // Iterate over each element in the array
//       target.forEach((item, index) => {
//         if (source[index]) {
//           mergeIdRecursive(item, source[index])
//         }
//       })
//     } else if (_.isObject(target) && _.isObject(source)) {
//       // Iterate over each key in the object
//       _.forEach(source, (value, key) => {
//         if (key === 'id') {
//           target[key] = value // Merge 'id' key
//         } else if (_.isObject(value) && _.isObject(target[key])) {
//           mergeIdRecursive(target[key], value) // Recurse for nested objects
//         }
//       })
//     }
//   }

//   // Create a deep copy of the first object to avoid mutating it
//   const mergedObj = _.cloneDeep(obj1)

//   // Start the recursive merging process
//   mergeIdRecursive(mergedObj, obj2)

//   return mergedObj
// }

// export function deepMergedForDelete(obj1: object, obj2: object) {
//   if (_.isEqual(obj1, obj2)) return obj1
//   if (_.isEmpty(obj2) || !obj2) return obj1

//   function mergeRecursive(source, target) {
//     if (_.isObject(target)) {
//       if (!_.isObject(source)) {
//         Object.assign(source, target)
//       }
//       for (const key in target) {
//         if (_.isObject(target[key]) || _.isArray(target[key])) {
//           source[key] = mergeRecursive(source[key], target[key])
//         } else if (key === 'id' && !source[key]) {
//           source[key] = target[key]
//         }
//       }
//     } else if (_.isArray(target)) {
//       if (!source) source = target
//     } else {
//       source.forEach((i) =>
//         mergeRecursive(
//           source.find((j) => (i.id = j.id)),
//           i
//         )
//       )
//     }
//   }

//   return mergeRecursive(_.cloneDeep(obj1), obj2)
// }
