import { createClient } from '@sanity/client'
import { createClient as createNextSanityClient } from 'next-sanity'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'smbwui03'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'
const apiVersion = '2024-01-01'

/**
 * Read-only Sanity client — bypasses CDN to ensure published content
 * appears immediately. Next.js handles caching at the framework level
 * and the /api/revalidate webhook triggers on-demand revalidation.
 */
export const sanityRead = createNextSanityClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
})

/**
 * Write-capable Sanity client — bypasses CDN, includes write token.
 * Use for any mutations (create, patch, delete) or reads that need
 * fresh data immediately after a write.
 */
export const sanityWrite = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})
