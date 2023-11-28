import * as _ from 'lodash'

import { clearEmptyFields } from '../getNestedStruct'

describe('generic prisma struct', () => {
  describe('helper functions', () => {
    it('should remove all empty properties', () => {
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
  })
})
