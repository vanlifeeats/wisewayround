// Data-integrity test: every destination array exported from the barrel must
// point at a href whose corresponding `page.tsx` actually exists on disk.

import { describe, it, expect } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

import { TOP_LEVEL_DESTINATIONS, ITALY_REGIONS, USA_CITIES, TURKEY_CITIES } from './index'

const ALL_DESTINATION_LISTS: Record<string, { label: string; href: string }[]> = {
  TOP_LEVEL_DESTINATIONS,
  ITALY_REGIONS,
  USA_CITIES,
  TURKEY_CITIES,
}

describe('travel guide route inventory', () => {
  for (const [listName, destinations] of Object.entries(ALL_DESTINATION_LISTS)) {
    describe(listName, () => {
      for (const destination of destinations) {
        it(`has a page.tsx for ${destination.label} (${destination.href})`, () => {
          const pagePath = path.join(process.cwd(), 'app', destination.href.slice(1), 'page.tsx')
          expect(fs.existsSync(pagePath)).toBe(true)
        })
      }
    })
  }
})
