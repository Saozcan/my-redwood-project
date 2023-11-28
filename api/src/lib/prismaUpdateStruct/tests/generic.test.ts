import * as _ from 'lodash'

import {
  addOnlyOwnPropertiesToSecondObject,
  cascadeUpdate,
  clearEmptyFields,
  deepCleanEmpty,
  deepCleaningExceptIds,
  firstLevelComparator,
  getCreateDeleteData,
  getUpdateData,
  isThereAnyProperty,
} from '../getNestedStruct'

describe('generic prisma struct', () => {
  describe('helper functions', () => {
    it('clearEmptyFields => If only exist id, delete it', () => {
      let data = {
        id: 1,
        name: 'test',
        posts: [
          {
            id: 1,
            postLikes: [
              {
                id: 2,
              },
              {
                id: 1,
              },
              {
                id: 2,
              },
            ],
          },
        ],
        object: {
          id: 123,
        },
      }

      data = clearEmptyFields(data)
      expect(data).toEqual({
        id: 1,
        name: 'test',
      })
    })

    it('deepCleaningExceptIds => should remove all empty properties except ids', () => {
      let data = {
        id: 1,
        name: 'test',
        posts: [
          {
            id: 1,
            postLikes: [
              {
                id: 2,
                likeCount: 55,
              },
            ],
          },
        ],
        object: {
          id: 123,
        },
      }

      data = deepCleaningExceptIds(data)
      expect(data).toEqual({
        id: 1,
        posts: [{ id: 1, postLikes: [{ id: 2 }] }],
        object: { id: 123 },
      })
    })

    it('getCreateDeleteData => should return create or delete data', () => {
      const incomingData = {
        id: 1,
        name: 'test',
        posts: [
          {
            id: 1,
            postLikes: [
              {
                id: 2,
                likeCount: 55,
              },
              {
                id: 10,
                likeCount: 11,
              },
            ],
          },
        ],
      }
      const currentData = {
        id: 1,
        name: 'test',
        posts: [
          {
            id: 1,
            postLikes: [
              {
                id: 2,
                likeCount: 55,
              },
              {
                id: 3,
                likeCount: 55,
              },
            ],
          },
        ],
      }

      const createData = getCreateDeleteData(incomingData, currentData)
      const deleteData = getCreateDeleteData(currentData, incomingData)

      expect(createData).toEqual({
        id: 1,
        posts: [{ id: 1, postLikes: [{ id: 2 }, { id: 10, likeCount: 11 }] }],
      })
      expect(deleteData).toEqual({
        id: 1,
        posts: [{ id: 1, postLikes: [{ id: 2 }, { id: 3, likeCount: 55 }] }],
      })
    })

    it('getUpdateData => should return update data', () => {
      const incomingData = {
        id: 1,
        name: 'test',
        posts: [
          {
            id: 1,
            postLikes: [
              {
                id: 2,
                likeCount: 55,
              },
              {
                id: 10,
                likeCount: 'updated',
              },
            ],
          },
        ],
      }
      const currentData = {
        id: 1,
        name: 'test',
        posts: [
          {
            id: 1,
            postLikes: [
              {
                id: 2,
                likeCount: 55,
              },
              {
                id: 10,
                likeCount: 'before',
              },
            ],
          },
        ],
      }

      const updateData = getUpdateData(incomingData, currentData)

      expect(updateData).toEqual({
        id: 1,
        posts: [
          { id: 1, postLikes: [{ id: 2 }, { id: 10, likeCount: 'updated' }] },
        ],
      })
    })

    it('firstLevelComparator => should compare two objects only first level', () => {
      const incomingData = {
        id: 1,
        name: 'same',
        posts: [
          {
            id: 1,
            postLikes: [
              {
                id: 2,
                likeCount: 55,
              },
              {
                id: 10,
                likeCount: 'before',
              },
            ],
          },
        ],
      }
      const currentData = {
        id: 1,
        name: 'same',
        posts: [
          {
            id: 1,
            content: 'different',
          },
        ],
      }

      const compare = firstLevelComparator(incomingData, currentData)

      expect(compare).toEqual(true)
    })

    it('deepCleanEmpty => Clean any empty objects, arrays', () => {
      const array = [{}, {}, [{}, {}]]
      const cleaned = deepCleanEmpty(array)

      expect(cleaned).toEqual([])
    })

    it('isThereAnyProperty => Check if there is any property in object except nested object or id', () => {
      const obj = {
        id: 1,
        name: 'test',
        posts: [{ id: 2, content: 'test' }],
      }

      const objFalse = {
        id: 1,
        posts: [
          { id: 2, content: 'test', comments: [{ id: 3, content: 'test' }] },
        ],
      }

      const result = isThereAnyProperty(obj)
      const resultFalse = isThereAnyProperty(objFalse)

      expect(result).toEqual(true)
      expect(resultFalse).toEqual(false)
    })

    it('addOnlyOwnPropertiesToSecondObject => Add only own properties to second object', () => {
      const obj1 = {
        id: 1,
        name: 'incoming',
        posts: [
          { id: 2 },
          { id: 3, name: 'Foo', array: [{ id: 1, different: 'test' }] },
        ],
        anotherOwnProperty: 'test',
      }

      const obj2 = {
        id: 1,
        name: 'test',
        posts: [{ id: 2, content: 'test' }],
      }

      const result = addOnlyOwnPropertiesToSecondObject(obj1, obj2 as any)

      expect(result).toEqual({
        id: 1,
        name: 'test',
        posts: [{ id: 2, content: 'test' }],
        anotherOwnProperty: 'test',
      })
    })

    it('cascadeUpdate => remove all tables after cascade table', () => {
      const data = {
        id: 1,
        name: 'test',
        posts: [
          {
            id: 1,
            postLikes: [
              {
                id: 2,
                likeCount: 55,
              },
              {
                id: 10,
                likeCount: 'updated',
              },
            ],
          },
        ],
      }

      const result = cascadeUpdate(data, { cascadeList: ['posts'] })

      expect(result).toEqual({
        id: 1,
        name: 'test',
        posts: [{ id: 1 }],
      })
    })
  })
})
