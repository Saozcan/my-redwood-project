import type { Prisma, SgmKalem } from '@prisma/client'
import type { ScenarioData } from '@redwoodjs/testing/api'

export const standard = defineScenario<Prisma.SgmKalemCreateArgs>({
  sgmKalem: {
    one: { data: { kalem_kodu: 'String' } },
    two: { data: { kalem_kodu: 'String' } },
  },
})

export type StandardScenario = ScenarioData<SgmKalem, 'sgmKalem'>
