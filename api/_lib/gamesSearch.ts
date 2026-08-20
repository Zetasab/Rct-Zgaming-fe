import { Document, Filter, Sort } from 'mongodb'

export interface GameSearchParams {
  page?: string
  page_size?: string
  search?: string
  search_precise?: string
  search_exact?: string
  parent_platforms?: string
  platforms?: string
  stores?: string
  developers?: string
  publishers?: string
  genres?: string
  tags?: string
  dates?: string
  updated?: string
  platforms_count?: string
  metacritic?: string
  exclude_additions?: string
  exclude_parents?: string
  exclude_game_series?: string
  exclude_stores?: string
  ordering?: string
}

function parseBool(value: string | undefined): boolean {
  if (!value) return false
  return value.toLowerCase() === 'true' || value === '1'
}

function parseInts(value: string): number[] {
  const result: number[] = []
  for (const token of value.split(',')) {
    const trimmed = token.trim()
    if (trimmed === '') continue
    const n = Number(trimmed)
    if (Number.isInteger(n)) result.push(n)
  }
  return result
}

function parseIdsAndSlugs(value: string): { ids: number[]; slugs: string[] } {
  const ids: number[] = []
  const slugs: string[] = []
  for (const token of value.split(',')) {
    const trimmed = token.trim()
    if (trimmed === '') continue
    const n = Number(trimmed)
    if (Number.isInteger(n) && String(n) === trimmed) ids.push(n)
    else slugs.push(trimmed)
  }
  return { ids, slugs }
}

function idsOrSlugsFilter(idField: string, slugField: string, value: string): Filter<Document> | null {
  const { ids, slugs } = parseIdsAndSlugs(value)
  const parts: Filter<Document>[] = []
  if (ids.length > 0) parts.push({ [idField]: { $in: ids } })
  if (slugs.length > 0) parts.push({ [slugField]: { $in: slugs } })
  if (parts.length === 0) return null
  return parts.length === 1 ? parts[0] : { $or: parts }
}

export interface BuiltSearch {
  filter: Filter<Document>
  sort: Sort | null
  page: number
  pageSize: number
  searchExactRequested: boolean
  searchRegexFallback: { field: string; value: string; caseSensitive: boolean } | null
}

const ORDERING_FIELD_MAP: Record<string, string> = {
  name: 'name',
  released: 'released',
  added: 'added',
  created: 'created',
  updated: 'updated',
  rating: 'rating',
  metacritic: 'metacritic'
}

export function buildGameSearch(query: GameSearchParams): BuiltSearch {
  const andParts: Filter<Document>[] = []

  let searchRegexFallback: BuiltSearch['searchRegexFallback'] = null
  const search = query.search?.trim()
  const searchExact = parseBool(query.search_exact)
  const searchPrecise = parseBool(query.search_precise)

  if (search) {
    if (searchExact) {
      andParts.push({ name: search })
    } else {
      andParts.push({ $text: { $search: search, $caseSensitive: searchPrecise } })
      searchRegexFallback = { field: 'name', value: search, caseSensitive: searchPrecise }
    }
  }

  if (query.parent_platforms?.trim()) {
    const ids = parseInts(query.parent_platforms)
    if (ids.length > 0) andParts.push({ 'parent_platforms.platform.id': { $in: ids } })
  }

  if (query.platforms?.trim()) {
    const f = idsOrSlugsFilter('platforms.platform.id', 'platforms.platform.slug', query.platforms)
    if (f) andParts.push(f)
  }

  if (query.stores?.trim()) {
    const f = idsOrSlugsFilter('stores.store.id', 'stores.store.slug', query.stores)
    if (f) andParts.push(f)
  }

  if (query.developers?.trim()) {
    const f = idsOrSlugsFilter('developers.id', 'developers.slug', query.developers)
    if (f) andParts.push(f)
  }

  if (query.publishers?.trim()) {
    const f = idsOrSlugsFilter('publishers.id', 'publishers.slug', query.publishers)
    if (f) andParts.push(f)
  }

  if (query.genres?.trim()) {
    const f = idsOrSlugsFilter('genres.id', 'genres.slug', query.genres)
    if (f) andParts.push(f)
  }

  if (query.tags?.trim()) {
    const f = idsOrSlugsFilter('tags.id', 'tags.slug', query.tags)
    if (f) andParts.push(f)
  }

  if (query.dates?.trim()) {
    const rangeFilters: Filter<Document>[] = []
    for (const range of query.dates.split('.')) {
      if (range.trim() === '') continue
      const parts = range.split(',')
      if (parts.length === 2) {
        rangeFilters.push({ released: { $gte: parts[0].trim(), $lte: parts[1].trim() } })
      }
    }
    if (rangeFilters.length > 0) {
      andParts.push(rangeFilters.length === 1 ? rangeFilters[0] : { $or: rangeFilters })
    }
  }

  if (query.updated?.trim()) {
    const parts = query.updated.split(',')
    if (parts.length === 2) {
      const start = new Date(parts[0].trim())
      const end = new Date(parts[1].trim())
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        andParts.push({ updated: { $gte: start, $lte: end } })
      }
    }
  }

  if (query.platforms_count?.trim()) {
    const n = Number(query.platforms_count.trim())
    if (Number.isInteger(n)) andParts.push({ platforms: { $size: n } })
  }

  if (query.metacritic?.trim()) {
    const parts = query.metacritic.split(',')
    if (parts.length === 2) {
      const min = Number(parts[0].trim())
      const max = Number(parts[1].trim())
      if (Number.isFinite(min) && Number.isFinite(max)) {
        andParts.push({ metacritic: { $gte: min, $lte: max } })
      }
    }
  }

  if (parseBool(query.exclude_additions)) andParts.push({ parents_count: 0 })
  if (parseBool(query.exclude_parents)) andParts.push({ additions_count: 0 })
  if (parseBool(query.exclude_game_series)) andParts.push({ game_series_count: 0 })

  if (query.exclude_stores?.trim()) {
    const { ids, slugs } = parseIdsAndSlugs(query.exclude_stores)
    if (ids.length > 0) andParts.push({ 'stores.store.id': { $nin: ids } })
    if (slugs.length > 0) andParts.push({ 'stores.store.slug': { $nin: slugs } })
  }

  const filter: Filter<Document> = andParts.length > 0 ? { $and: andParts } : {}

  let sort: Sort | null = null
  const ordering = query.ordering?.trim()
  if (ordering) {
    const descending = ordering.startsWith('-')
    const fieldKey = descending ? ordering.slice(1) : ordering
    const mapped = ORDERING_FIELD_MAP[fieldKey]
    if (mapped) {
      sort = { [mapped]: descending ? -1 : 1 }
    }
  }

  const page = Math.max(1, Number.parseInt(query.page ?? '1', 10) || 1)
  let pageSize = Number.parseInt(query.page_size ?? '20', 10) || 20
  pageSize = Math.min(100, Math.max(1, pageSize))

  return { filter, sort, page, pageSize, searchExactRequested: searchExact, searchRegexFallback }
}
