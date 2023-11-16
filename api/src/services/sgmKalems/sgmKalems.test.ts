import type { SgmKalem } from '@prisma/client'

import {
  sgmKalems,
  sgmKalem,
  createSgmKalem,
  updateSgmKalem,
  deleteSgmKalem,
} from './sgmKalems'
import type { StandardScenario } from './sgmKalems.scenarios'

// Generated boilerplate tests do not account for all circumstances
// and can fail without adjustments, e.g. Float.
//           Please refer to the RedwoodJS Testing Docs:
//       https://redwoodjs.com/docs/testing#testing-services
// https://redwoodjs.com/docs/testing#jest-expect-type-considerations

describe('sgmKalems', () => {
  scenario('returns all sgmKalems', async (scenario: StandardScenario) => {
    const result = await sgmKalems()

    expect(result.length).toEqual(Object.keys(scenario.sgmKalem).length)
  })

  scenario('returns a single sgmKalem', async (scenario: StandardScenario) => {
    const result = await sgmKalem({ id: scenario.sgmKalem.one.id })

    expect(result).toEqual(scenario.sgmKalem.one)
  })

  scenario('creates a sgmKalem', async () => {
    const result = await createSgmKalem({
      input: { kalem_kodu: 'String' },
    })

    expect(result.kalem_kodu).toEqual('String')
  })

  scenario('updates a sgmKalem', async (scenario: StandardScenario) => {
    const original = (await sgmKalem({
      id: scenario.sgmKalem.one.id,
    })) as SgmKalem
    const result = await updateSgmKalem({
      id: original.id,
      input: { kalem_kodu: 'String2' },
    })

    expect(result.kalem_kodu).toEqual('String2')
  })

  scenario('deletes a sgmKalem', async (scenario: StandardScenario) => {
    const original = (await deleteSgmKalem({
      id: scenario.sgmKalem.one.id,
    })) as SgmKalem
    const result = await sgmKalem({ id: original.id })

    expect(result).toEqual(null)
  })
})
