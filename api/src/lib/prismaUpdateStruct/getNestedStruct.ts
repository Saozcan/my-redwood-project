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
  if (_.isEqual(incomingData, currentData)) {
    return null
  }
  const createData = getCreateData(incomingData, currentData)
  console.log('createData: ', createData);

  const updateData = getUpdateData(incomingData, currentData)
  const deleteData = getDeleteData(incomingData, currentData)
  clearEmptyFields(createData)
  clearEmptyFields(updateData)
  clearEmptyFields(deleteData)

  // console.log('create: ', createData)
  // console.log('update: ', updateData)
  // console.log('delete: ', deleteData)

  console.dir(
    setUpdatePrismaStruct({
      incomingData,
      updateData,
      createData,
      deleteData,
    }),
    { depth: 10 }
  )
}

const incomingData = {
  id: 1,
  name: 'ahmet',
  surname: 'mehmet',
  address: {
    id: 1,
    city: 'istanbul',
    country: 'turkey',
  },
  object: {
    id: 1,
    name: 'asdasd',
  },
  phones: [
    {
      id: 1,
      number: '456',
    },
    {
      id: 2,
      number: '4563123123',
    },
    {
      id: 3,
      number: '456',
    },
  ],
  array: [
    {
      id: 1,
      name: 'ahmet',
    },
    {
      id: 2,
      name: 'ahmet',
    },
  ],
}

const currentData = {
  id: 1,
  surname: 'mehmet',
  address: {
    id: 1,
    city: 'istanbul',
    country: 'turkey',
  },
  phones: [
    {
      id: 1,
      number: '123',
    },
    {
      id: 4,
      number: '1231231231123',
    },
  ],
  array: [
    {
      id: 1,
      name: 'ahmet',
    },
    {
      id: 2,
      name: 'mehmet',
    },
  ],
  name: 'ahmetdsasd',
}

const firstLevelObject = {
  id: 1,
  name: 'ahmet',
  surname: 'mehmet',
  address: {
    id: 1,
    city: 'istanbul',
    country: 'turkey',
    phone: {
      id: 1,
      number: '123',
      test: [
        {
          id: 1,
          name: 'ahmet',
        },
        {
          id: 2,
          name: 'ahmet',
          bla: {
            id: 1,
            name: 'ahmet',
          },
        },
      ],
    },
  },
}

const firstLevelObjectCurr = {
  id: 1,
  name: 'ahmet',
  surname: 'mehmet',
  address: {
    id: 1,
    city: 'istanbul',
    country: 'turkey',
    phone: {
      id: 1,
      number: '1234',
    },
  },
}

updateNestedData({
  incomingData: firstLevelObject,
  currentData: firstLevelObjectCurr,
})

// updateNestedData({ incomingData, currentData })

export function clearEmptyFields(data): boolean {
  if (_.isArray(data)) {
    data.forEach((item, index) => {
      if (_.isObject(item)) {
        if (clearEmptyFields(item)) {
          data.splice(index, 1)
        }
      }
    })
  }
  if (_.isObject(data)) {
    for (const key in data) {
      if (_.isArray(data[key])) {
        if (clearEmptyFields(data[key])) {
          data[key] = _.compact(data[key])
          if (_.isEmpty(data[key])) {
            delete data[key]
          }
        }
      } else if (_.isObject(data[key])) {
        if (clearEmptyFields(data[key])) {
          delete data[key]
        } else return false
      } else if (key !== 'id') {
        return false
      }
    }
  }
  return true
}
