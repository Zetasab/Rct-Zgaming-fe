import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getGameById, getGameBySlug, searchGames } from '../_lib/gamesRepo.js'
import { getAllCatalog, getCatalogById, getCatalogBySlug, CatalogKind } from '../_lib/catalogRepo.js'
import { GameSearchParams } from '../_lib/gamesSearch.js'

const CATALOG_RESOURCES: CatalogKind[] = ['genres', 'platforms', 'parentplatforms', 'stores']
const EXCLUDED_RESOURCES = ['playedgames', 'wishlistgames']
const NOT_FOUND_MESSAGE = { message: 'Juego no encontrado.' }

function pathSegments(req: VercelRequest): string[] {
  const raw = req.query.path
  if (Array.isArray(raw)) {
    return raw
  }

  return typeof raw === 'string' && raw.length > 0 ? raw.split('/') : []
}

function forwardedQuery(req: VercelRequest): GameSearchParams {
  const query: Record<string, string> = {}
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path') {
      continue
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        query[key] = value[0]
      }
      continue
    }

    if (typeof value === 'string') {
      query[key] = value
    }
  }

  return query as GameSearchParams
}

async function withErrorHandling(res: VercelResponse, handler: () => Promise<void>): Promise<void> {
  try {
    await handler()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado al consultar la API de juegos.'
    res.status(400).json({ message })
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  await withErrorHandling(res, async () => {
    const segments = pathSegments(req)
    const query = forwardedQuery(req)
    const [first, second, third] = segments

    if (segments.length > 0 && EXCLUDED_RESOURCES.includes(first.toLowerCase())) {
      res.status(404).json({ message: 'Ruta no encontrada.' })
      return
    }

    // GET api/games (list) - runs through the same filter/sort/paginate logic as search,
    // but responds with { results } (no pagination metadata), matching GameService.get('', ...).
    if (segments.length === 0) {
      const result = await searchGames(query)
      res.status(200).json({ results: result.items })
      return
    }

    // GET api/games/search
    if (segments.length === 1 && first === 'search') {
      const result = await searchGames(query)
      res.status(200).json(result)
      return
    }

    // GET api/games/slug/{slug}
    if (segments.length === 2 && first === 'slug') {
      const game = await getGameBySlug(second)
      if (!game) {
        res.status(404).json(NOT_FOUND_MESSAGE)
        return
      }
      res.status(200).json(game)
      return
    }

    // GET api/games/{id:int}
    if (segments.length === 1 && /^\d+$/.test(first)) {
      const game = await getGameById(Number.parseInt(first, 10))
      if (!game) {
        res.status(404).json(NOT_FOUND_MESSAGE)
        return
      }
      res.status(200).json(game)
      return
    }

    // Catalog sub-resources: genres, platforms, parentplatforms, stores
    if (CATALOG_RESOURCES.includes(first as CatalogKind)) {
      const kind = first as CatalogKind

      if (segments.length === 1) {
        const items = await getAllCatalog(kind)
        res.status(200).json(items)
        return
      }

      if (segments.length === 2 && /^\d+$/.test(second)) {
        const item = await getCatalogById(kind, Number.parseInt(second, 10))
        if (!item) {
          res.status(404).json(NOT_FOUND_MESSAGE)
          return
        }
        res.status(200).json(item)
        return
      }

      if (segments.length === 3 && second === 'slug') {
        const item = await getCatalogBySlug(kind, third)
        if (!item) {
          res.status(404).json(NOT_FOUND_MESSAGE)
          return
        }
        res.status(200).json(item)
        return
      }
    }

    res.status(404).json({ message: 'Ruta no encontrada.' })
  })
}
