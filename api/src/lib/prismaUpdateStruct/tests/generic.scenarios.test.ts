import * as _ from 'lodash'

import { getNestedPrismaStruct } from '../getNestedStruct'

describe('generic prisma struct', () => {
  describe('give the object and take the prisma struct or null', () => {
    const data = {
      name: 'Ali',
      email: 'email@email.com',
      id: 4,
    }

    it('check null', () => {
      const prismaStruct = getNestedPrismaStruct({
        incomingData: data,
        currentData: _.cloneDeep(data),
      })

      expect(prismaStruct).toEqual(null)
    })

    it('check update basic', () => {
      const copyData = _.cloneDeep(data)
      copyData.name = 'update'
      const prismaStruct = getNestedPrismaStruct({
        incomingData: copyData,
        currentData: _.cloneDeep(data),
      })

      const genericResult = {
        name: 'update',
        email: 'email@email.com',
        id: 4,
      }
      expect(prismaStruct).toEqual(genericResult)
    })

    it('check create, update first nested', () => {
      const copyData = _.cloneDeep(data) as any
      copyData.posts = [
        {
          id: 1,
          title: 'update',
        },
      ]
      const prismaStruct = getNestedPrismaStruct({
        incomingData: copyData,
        currentData: _.cloneDeep(data),
      })

      const genericResult = {
        name: 'Ali',
        email: 'email@email.com',
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

      expect(prismaStruct).toEqual(genericResult)
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
      const prismaStruct = getNestedPrismaStruct({
        incomingData: copyData,
        currentData: _.cloneDeep(data),
      })

      const genericResult = {
        id: 4,
        name: 'Ali',
        email: 'email@email.com',
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
      expect(prismaStruct).toEqual(genericResult)
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
      const prismaStruct = getNestedPrismaStruct({
        incomingData: copyData,
        currentData: _.cloneDeep(data),
      })

      const genericResult = {
        id: 4,
        name: 'Ali',
        email: 'email@email.com',
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

      expect(prismaStruct).toEqual(genericResult)
    })

    it('delete last table', () => {
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
      const incomingWithoutLastTable = _.cloneDeep(copyData)
      delete incomingWithoutLastTable.posts[0].comment[0].commentLike

      const prismaStruct = getNestedPrismaStruct({
        incomingData: incomingWithoutLastTable,
        currentData: copyData,
      })

      const genericResult = {
        posts: {
          update: [
            {
              data: {
                comment: {
                  update: [
                    {
                      data: {
                        commentLike: {
                          delete: [{ id: 1 }],
                        },
                      },
                      where: { id: 1 },
                    },
                  ],
                },
              },
              where: { id: 1 },
            },
          ],
        },
      }

      expect(prismaStruct).toEqual(genericResult)
    })

    it('delete second table', () => {
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
      const incomingWithoutLastTable = _.cloneDeep(copyData)
      delete incomingWithoutLastTable.posts[0].comment

      const prismaStruct = getNestedPrismaStruct({
        incomingData: incomingWithoutLastTable,
        currentData: copyData,
      })

      const genericResult = {
        posts: {
          update: [
            {
              data: {
                comment: {
                  update: [
                    {
                      data: {
                        commentLike: {
                          delete: [{ id: 1 }],
                        },
                      },
                      where: { id: 1 },
                    },
                  ],
                  delete: [{ id: 1 }],
                },
              },
              where: { id: 1 },
            },
          ],
        },
      }

      expect(prismaStruct).toEqual(genericResult)
    })

    it('delete first table', () => {
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
      const incomingWithoutLastTable = _.cloneDeep(copyData)
      delete incomingWithoutLastTable.posts

      const prismaStruct = getNestedPrismaStruct({
        incomingData: incomingWithoutLastTable,
        currentData: copyData,
      })

      const genericResult = {
        posts: {
          update: [
            {
              data: {
                comment: {
                  update: [
                    {
                      data: {
                        commentLike: {
                          delete: [{ id: 1 }],
                        },
                      },
                      where: { id: 1 },
                    },
                  ],
                  delete: [{ id: 1 }],
                },
              },
              where: { id: 1 },
            },
          ],
          delete: [{ id: 1 }],
        },
      }

      expect(prismaStruct).toEqual(genericResult)
    })

    it('delete last table and create new', () => {
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
      const incomingWithoutLastTable = _.cloneDeep(copyData)
      delete incomingWithoutLastTable.posts[0].comment[0].commentLike
      incomingWithoutLastTable.posts[0].comment[0].commentLike = [
        {
          id: 2,
          like: true,
        },
      ]

      const prismaStruct = getNestedPrismaStruct({
        incomingData: incomingWithoutLastTable,
        currentData: copyData,
      })

      const genericResult = {
        name: 'Ali',
        email: 'email@email.com',
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
                              update: { id: 2, like: true },
                              create: { id: 2, like: true },
                              where: { id: 2 },
                            },
                          ],
                          delete: [{ id: 1 }],
                        },
                      },
                      create: {
                        id: 1,
                        content: 'create',
                        commentLike: {
                          create: [{ id: 2, like: true }],
                        },
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
                      commentLike: { create: [{ id: 2, like: true }] },
                    },
                  ],
                },
              },
              where: { id: 1 },
            },
          ],
        },
      }

      expect(prismaStruct).toEqual(genericResult)
    })

    it('delete middle table and create new', () => {
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
      const incomingWithoutLastTable = _.cloneDeep(copyData)
      delete incomingWithoutLastTable.posts[0].comment
      incomingWithoutLastTable.posts[0].comment = [
        {
          id: 2,
          content: 'create',
          commentLike: [
            {
              id: 2,
              like: true,
            },
          ],
        },
      ]

      const prismaStruct = getNestedPrismaStruct({
        incomingData: incomingWithoutLastTable,
        currentData: copyData,
      })

      const genericResult = {
        name: 'Ali',
        id: 4,
        email: 'email@email.com',
        posts: {
          update: [
            {
              data: {
                comment: {
                  update: [
                    {
                      data: {
                        commentLike: {
                          delete: [{ id: 1 }],
                        },
                      },
                      where: { id: 1 },
                    },
                  ],
                },
              },
              where: { id: 1 },
            },
          ],
          upsert: [
            {
              update: {
                id: 1,
                title: 'update',
                comment: {
                  upsert: [
                    {
                      update: {
                        id: 2,
                        content: 'create',
                        commentLike: {
                          upsert: [
                            {
                              update: { id: 2, like: true },
                              create: { id: 2, like: true },
                              where: { id: 2 },
                            },
                          ],
                        },
                      },
                      create: {
                        id: 2,
                        content: 'create',
                        commentLike: { create: [{ id: 2, like: true }] },
                      },
                      where: { id: 2 },
                    },
                  ],
                  delete: [{ id: 1 }],
                },
              },
              create: {
                id: 1,
                title: 'update',
                comment: {
                  create: [
                    {
                      id: 2,
                      content: 'create',
                      commentLike: { create: [{ id: 2, like: true }] },
                    },
                  ],
                },
              },
              where: { id: 1 },
            },
          ],
        },
      }

      expect(prismaStruct).toEqual(genericResult)
    })

    it('update first nested ', () => {
      const copyData = _.cloneDeep(data) as any
      copyData.posts = [
        {
          id: 1,
          title: 'update',
        },
      ]
      const incomingWithoutLastTable = _.cloneDeep(copyData)
      incomingWithoutLastTable.posts[0].title = 'update2'

      const prismaStruct = getNestedPrismaStruct({
        incomingData: incomingWithoutLastTable,
        currentData: copyData,
      })

      const genericResult = {
        name: 'Ali',
        id: 4,
        email: 'email@email.com',
        posts: {
          upsert: [
            {
              update: {
                id: 1,
                title: 'update2',
              },
              create: {
                id: 1,
                title: 'update2',
              },
              where: {
                id: 1,
              },
            },
          ],
        },
      }

      expect(prismaStruct).toEqual(genericResult)
    })

    it('update second level', () => {
      const copyData = _.cloneDeep(data) as any
      copyData.posts = [
        {
          id: 1,
          comment: [
            {
              id: 1,
              content: 'update',
            },
          ],
        },
      ]
      const incomingWithoutLastTable = _.cloneDeep(copyData)
      incomingWithoutLastTable.posts[0].comment[0].content = 'update2'

      const prismaStruct = getNestedPrismaStruct({
        incomingData: incomingWithoutLastTable,
        currentData: copyData,
      })

      const genericResult = {
        name: 'Ali',
        id: 4,
        email: 'email@email.com',
        posts: {
          upsert: [
            {
              update: {
                id: 1,
                comment: {
                  upsert: [
                    {
                      update: {
                        id: 1,
                        content: 'update2',
                      },
                      create: {
                        id: 1,
                        content: 'update2',
                      },
                      where: {
                        id: 1,
                      },
                    },
                  ],
                },
              },
              create: {
                id: 1,
                comment: {
                  create: [
                    {
                      id: 1,
                      content: 'update2',
                    },
                  ],
                },
              },
              where: {
                id: 1,
              },
            },
          ],
        },
      }

      expect(prismaStruct).toEqual(genericResult)
    })

    it('only create', () => {
      const copyData = _.cloneDeep(data) as any
      copyData.posts = [
        {
          id: 1,
          title: 'create',
        },
      ]

      const prismaStruct = getNestedPrismaStruct({
        incomingData: copyData,
      })

      const genericResult = {
        name: 'Ali',
        id: 4,
        email: 'email@email.com',
        posts: {
          create: [
            {
              id: 1,
              title: 'create',
            },
          ],
        },
      }
      expect(prismaStruct).toEqual(genericResult)
    })

    it('create nested', () => {
      const copyData = _.cloneDeep(data) as any
      copyData.posts = [
        {
          id: 1,
          title: 'create',
          comment: [
            {
              id: 1,
              content: 'create',
            },
          ],
        },
      ]

      const prismaStruct = getNestedPrismaStruct({
        incomingData: copyData,
      })

      const genericResult = {
        name: 'Ali',
        id: 4,
        email: 'email@email.com',
        posts: {
          create: [
            {
              id: 1,
              title: 'create',
              comment: {
                create: [
                  {
                    id: 1,
                    content: 'create',
                  },
                ],
              },
            },
          ],
        },
      }
      expect(prismaStruct).toEqual(genericResult)
    })

    it('only delete', () => {
      const copyData = _.cloneDeep(data) as any
      copyData.posts = [
        {
          id: 1,
          title: 'create',
        },
      ]

      const prismaStruct = getNestedPrismaStruct({
        incomingData: {},
        currentData: copyData,
      })

      const genericResult = {
        posts: {
          delete: [{ id: 1 }],
        },
      }
      expect(prismaStruct).toEqual(genericResult)
    })

    it('only delete nested', () => {
      const copyData = _.cloneDeep(data) as any
      copyData.posts = [
        {
          id: 1,
          title: 'create',
          comment: [
            {
              id: 1,
              content: 'create',
            },
          ],
        },
      ]

      const prismaStruct = getNestedPrismaStruct({
        incomingData: {},
        currentData: copyData,
      })

      const genericResult = {
        posts: {
          update: [
            {
              data: {
                comment: {
                  delete: [{ id: 1 }],
                },
              },
              where: { id: 1 },
            },
          ],
          delete: [{ id: 1 }],
        },
      }
      expect(prismaStruct).toEqual(genericResult)
    })

    it('only delete nested with cascadeList middle table', () => {
      const data = {
        name: 'Ali',
        email: 'email@email.com',
        id: 4,
      }
      const copyData = _.cloneDeep(data) as any
      copyData.posts = [
        {
          id: 1,
          title: 'create',
          comment: [
            {
              id: 2,
              content: 'create',
              commentLike: [
                {
                  id: 3,
                  commentLike: 123,
                },
              ],
            },
          ],
        },
      ]

      const prismaStruct = getNestedPrismaStruct({
        currentData: copyData,
        _options: { cascadeList: ['comment'] },
      })

      const genericResult = {
        posts: {
          update: [
            {
              data: {
                comment: {
                  delete: [{ id: 2 }],
                },
              },
              where: { id: 1 },
            },
          ],
          delete: [{ id: 1 }],
        },
      }
      expect(prismaStruct).toEqual(genericResult)
    })

    it('update, create, delete at the same time', () => {
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
      const incomingWithoutLastTable = _.cloneDeep(copyData)
      delete incomingWithoutLastTable.posts[0].comment[0].commentLike
      incomingWithoutLastTable.posts[0].comment[0].commentLike = [
        {
          id: 2,
          like: true,
        },
      ]

      const prismaStruct = getNestedPrismaStruct({
        incomingData: incomingWithoutLastTable,
        currentData: copyData,
      })

      const genericResult = {
        name: 'Ali',
        id: 4,
        email: 'email@email.com',
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
                              update: { id: 2, like: true },
                              create: { id: 2, like: true },
                              where: { id: 2 },
                            },
                          ],
                          delete: [{ id: 1 }],
                        },
                      },
                      create: {
                        id: 1,
                        content: 'create',
                        commentLike: {
                          create: [{ id: 2, like: true }],
                        },
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
                      commentLike: { create: [{ id: 2, like: true }] },
                    },
                  ],
                },
              },
              where: { id: 1 },
            },
          ],
        },
      }

      expect(prismaStruct).toEqual(genericResult)
    })
  })
})
