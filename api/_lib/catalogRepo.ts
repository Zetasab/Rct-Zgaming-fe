import { Document } from 'mongodb'
import { getDb } from './mongo.js'

const PROJECTION = { _id: 0 } as const

export type CatalogKind = 'genres' | 'platforms' | 'parentplatforms' | 'stores'

const COLLECTION_BY_KIND: Record<CatalogKind, string> = {
  genres: 'genres',
  platforms: 'platforms',
  parentplatforms: 'parent-platoforms',
  stores: 'stores'
}

export async function getAllCatalog(kind: CatalogKind): Promise<Document[]> {
  const db = await getDb()
  const col = db.collection(COLLECTION_BY_KIND[kind])
  return col.find({}, { projection: PROJECTION }).toArray()
}

export async function getCatalogById(kind: CatalogKind, id: number): Promise<Document | null> {
  const db = await getDb()
  const col = db.collection(COLLECTION_BY_KIND[kind])
  return col.findOne({ id }, { projection: PROJECTION })
}

export async function getCatalogBySlug(kind: CatalogKind, slug: string): Promise<Document | null> {
  const db = await getDb()
  const col = db.collection(COLLECTION_BY_KIND[kind])
  return col.findOne({ slug }, { projection: PROJECTION })
}
