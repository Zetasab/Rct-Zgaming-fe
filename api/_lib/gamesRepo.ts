import { Document, Filter } from 'mongodb'
import { getDb } from './mongo.js'
import { buildGameSearch, GameSearchParams } from './gamesSearch.js'

const COLLECTION = 'database'
const PROJECTION = { _id: 0 } as const

export interface PagedResult<T> {
  items: T[]
  totalCount: number
}

export async function getPagedGames(page: number, pageSize: number): Promise<PagedResult<Document>> {
  const db = await getDb()
  const col = db.collection(COLLECTION)

  const skip = (page - 1) * pageSize

  const [totalCount, items] = await Promise.all([
    col.estimatedDocumentCount(),
    col.find({}, { projection: PROJECTION }).skip(skip).limit(pageSize).toArray()
  ])

  return { items, totalCount }
}

export interface SearchGamesResult {
  items: Document[]
  totalCount: number
  page: number
  pageSize: number
}

export async function searchGames(query: GameSearchParams): Promise<SearchGamesResult> {
  const db = await getDb()
  const col = db.collection(COLLECTION)

  const built = buildGameSearch(query)
  const skip = (built.page - 1) * built.pageSize

  let filter: Filter<Document> = built.filter

  const runQuery = async (f: Filter<Document>) => {
    const findCursor = col.find(f, { projection: PROJECTION })
    if (built.sort) findCursor.sort(built.sort)
    const itemsPromise = findCursor.skip(skip).limit(built.pageSize).toArray()
    const countPromise = col.countDocuments(f)
    return Promise.all([itemsPromise, countPromise])
  }

  try {
    const [items, totalCount] = await runQuery(filter)
    return { items, totalCount, page: built.page, pageSize: built.pageSize }
  } catch (error) {
    // Defensive fallback: if the $text search fails because no text index exists,
    // fall back to a case-insensitive regex match on `name`.
    if (built.searchRegexFallback && isTextIndexError(error)) {
      const { field, value, caseSensitive } = built.searchRegexFallback
      const regexFilter: Filter<Document> = {
        $regex: escapeRegex(value)
      }
      const flags = caseSensitive ? '' : 'i'
      const fallbackCondition: Filter<Document> = { [field]: { $regex: escapeRegex(value), $options: flags } }

      filter = replaceTextClause(built.filter, fallbackCondition)

      const [items, totalCount] = await runQuery(filter)
      return { items, totalCount, page: built.page, pageSize: built.pageSize }
    }
    throw error
  }
}

function isTextIndexError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /text index/i.test(message) || /\$text/i.test(message)
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function replaceTextClause(filter: Filter<Document>, replacement: Filter<Document>): Filter<Document> {
  const andParts = (filter as { $and?: Filter<Document>[] }).$and
  if (!Array.isArray(andParts)) return filter
  const newParts = andParts.map((part) => ('$text' in (part as Document) ? replacement : part))
  return { $and: newParts }
}

export async function getGameById(id: number): Promise<Document | null> {
  const db = await getDb()
  const col = db.collection(COLLECTION)
  return col.findOne({ id }, { projection: PROJECTION })
}

export async function getGameBySlug(slug: string): Promise<Document | null> {
  const db = await getDb()
  const col = db.collection(COLLECTION)
  return col.findOne({ slug }, { projection: PROJECTION })
}
