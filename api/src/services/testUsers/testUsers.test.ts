import type { TestUser } from '@prisma/client'

import {
  testUsers,
  testUser,
  createTestUser,
  updateTestUser,
  deleteTestUser,
} from './testUsers'
import type { StandardScenario } from './testUsers.scenarios'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('testUsers', () => {
  scenario('returns all testUsers', async (scenario: StandardScenario) => {
    const result = await testUsers()

    expect(result.length).toEqual(Object.keys(scenario.testUser).length)
  })

  scenario('returns a single testUser', async (scenario: StandardScenario) => {
    const result = await testUser({ id: scenario.testUser.one.id })

    expect(result).toEqual(scenario.testUser.one)
  })

  scenario('creates a testUser', async () => {
    const result = await createTestUser({
      input: { name: 'String' },
    })

    expect(result.name).toEqual('String')
  })

  scenario('updates a testUser', async (scenario: StandardScenario) => {
    const original = (await testUser({
      id: scenario.testUser.one.id,
    })) as TestUser
    const result = await updateTestUser({
      id: original.id,
      input: { name: 'String2' },
    })

    expect(result.name).toEqual('String2')
  })

  scenario('deletes a testUser', async (scenario: StandardScenario) => {
    const original = (await deleteTestUser({
      id: scenario.testUser.one.id,
    })) as TestUser
    const result = await testUser({ id: original.id })

    expect(result).toEqual(null)
  })
})
