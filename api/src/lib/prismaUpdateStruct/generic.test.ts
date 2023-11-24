import * as _ from 'lodash'

import { clearEmptyFields, updateNestedData } from './getNestedStruct'

describe('generic prisma struct', () => {
  describe('helper functions', () => {
    it('should remove all empty properties', () => {
      const data = {
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

      clearEmptyFields(data)
      expect(data).toEqual({
        id: 1,
        name: 'test',
      })
    })
  })
  describe('give the object and take the prisma struct or null', () => {
    const data = {
      name: 'Ali',
      email: 'email@email.com',
      id: 4,
    }
    it('check null', () => {
      const prismaStruct = updateNestedData({
        incomingData: data,
        currentData: _.cloneDeep(data),
      })

      expect(prismaStruct).toEqual(null)
    })
    it('check update basic', () => {
      const copyData = _.cloneDeep(data)
      copyData.name = 'update'
      const prismaStruct = updateNestedData({
        incomingData: copyData,
        currentData: _.cloneDeep(data),
      })

      const genericResult = {
        name: 'update',
        email: 'email@email.com',
        id: 4,
      }
      expect(prismaStruct.data).toEqual(genericResult)
    })
    it('check create, update first nested', () => {
      const copyData = _.cloneDeep(data) as any
      copyData.posts = [
        {
          id: 1,
          title: 'update',
        },
      ]
      const prismaStruct = updateNestedData({
        incomingData: copyData,
        currentData: _.cloneDeep(data),
      })

      const genericResult = {
        id: 4,
        posts: {
          upsert: [
            {
              update: {
                id: 1,
                title: 'update',
              },
              create: {
                id: 1,
                title: 'update',
              },
              where: {
                id: 1,
              },
            },
          ],
        },
      }
      console.log(prismaStruct.data)

      expect(prismaStruct.data).toEqual(genericResult)
    })
    it('check create, update second nested', () => {
      const copyData = _.cloneDeep(data) as any
      copyData.posts = [
        {
          id: 1,
          title: 'update',
          comment: [
            {
              id: 1,
              content: 'create',
            },
          ],
        },
      ]
      const prismaStruct = updateNestedData({
        incomingData: copyData,
        currentData: _.cloneDeep(data),
      })

      const genericResult = {
        id: 4,
        posts: {
          upsert: [
            {
              update: {
                id: 1,
                title: 'update',
                comment: {
                  upsert: [
                    {
                      update: { id: 1, content: 'create' },
                      create: { id: 1, content: 'create' },
                      where: { id: 1 },
                    },
                  ],
                },
              },
              create: {
                id: 1,
                title: 'update',
                comment: { create: [{ id: 1, content: 'create' }] },
              },
              where: { id: 1 },
            },
          ],
        },
      }
      console.log(prismaStruct.data)

      expect(prismaStruct.data).toEqual(genericResult)
    })
    it('check create, update third nested', () => {
      const copyData = _.cloneDeep(data) as any
      copyData.posts = [
        {
          id: 1,
          title: 'update',
          comment: [
            {
              id: 1,
              content: 'create',
              commentLike: [
                {
                  id: 1,
                  like: true,
                },
              ],
            },
          ],
        },
      ]
      const prismaStruct = updateNestedData({
        incomingData: copyData,
        currentData: _.cloneDeep(data),
      })

      const genericResult = {
        id: 4,
        posts: {
          upsert: [
            {
              update: {
                id: 1,
                title: 'update',
                comment: {
                  upsert: [
                    {
                      update: {
                        id: 1,
                        content: 'create',
                        commentLike: {
                          upsert: [
                            {
                              update: { id: 1, like: true },
                              create: { id: 1, like: true },
                              where: { id: 1 },
                            },
                          ],
                        },
                      },
                      create: {
                        id: 1,
                        content: 'create',
                        commentLike: { create: [{ id: 1, like: true }] },
                      },
                      where: { id: 1 },
                    },
                  ],
                },
              },
              create: {
                id: 1,
                title: 'update',
                comment: {
                  create: [
                    {
                      id: 1,
                      content: 'create',
                      commentLike: { create: [{ id: 1, like: true }] },
                    },
                  ],
                },
              },
              where: { id: 1 },
            },
          ],
        },
      }
      console.log(prismaStruct.data)

      expect(prismaStruct.data).toEqual(genericResult)
    })
  })
})
