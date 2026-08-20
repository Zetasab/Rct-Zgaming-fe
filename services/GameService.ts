import { Game } from '../models/Game';

export interface RawgPaginatedResponse<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
}

export interface SearchGamesParams {
    search?: string;
    searchPrecise?: boolean;
    searchExact?: boolean;
    genres?: string;
    platforms?: string;
    stores?: string;
    ordering?: string;
    dates?: string;
    page?: number;
    pageSize?: number;
}

export interface GenrePreviewGame {
    id: number;
    slug: string;
    name: string;
    added: number;
}

export interface GenreListItem {
    id: number;
    name: string;
    slug: string;
    games_count: number;
    image_background: string;
    games: GenrePreviewGame[];
}

export interface StoreListItem {
    id: number;
    name: string;
    domain: string;
    slug: string;
    games_count: number;
    image_background: string;
    games: GenrePreviewGame[];
}

export interface PlatformListItem {
    id: number;
    name: string;
    slug: string;
    games_count: number;
    image_background: string;
    image: string | null;
    year_start: number | null;
    year_end: number | null;
    games: GenrePreviewGame[];
}

type QueryParams = Record<string, string | number | boolean | undefined>;

class GamesApiService {
    private readonly basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    async get<T>(path: string, query?: QueryParams): Promise<T> {
        const url = this.buildUrl(path, query);
        const response = await fetch(url);
        const contentType = response.headers.get('content-type');
        const payload = contentType && contentType.includes('application/json')
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            const message = typeof (payload as { message?: unknown })?.message === 'string'
                ? (payload as { message: string }).message
                : 'Error al consultar la API de juegos.';
            const error = new Error(message) as Error & { status?: number };
            error.status = response.status;
            throw error;
        }

        return payload as T;
    }

    private buildUrl(path: string, query?: QueryParams): string {
        const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
        const searchParams = new URLSearchParams();
        if (normalizedPath) {
            searchParams.set('path', normalizedPath);
        }

        if (query) {
            for (const [key, value] of Object.entries(query)) {
                if (value !== undefined && value !== null && value !== '') {
                    searchParams.set(key, String(value));
                }
            }
        }

        const queryString = searchParams.toString();
        return queryString ? `${this.basePath}?${queryString}` : this.basePath;
    }
}

const gamesApiService = new GamesApiService('/api/games');

class GameService {
    private formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    async getGames(): Promise<{ results: Game[] }> {
        return gamesApiService.get<{ results: Game[] }>('');
    }

    async getTopRatedGames(pageSize: number = 20): Promise<{ results: Game[] }> {
        return gamesApiService.get<{ results: Game[] }>('', { ordering: '-rating', page_size: pageSize });
    }

    async getRecentlyReleasedGames(pageSize: number = 20): Promise<{ results: Game[] }> {
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);

        const dates = `${this.formatDate(sixMonthsAgo)},${this.formatDate(today)}`;
        return gamesApiService.get<{ results: Game[] }>('', { dates, ordering: '-released', page_size: pageSize });
    }

    async getUpcomingGames(pageSize: number = 20): Promise<{ results: Game[] }> {
        const today = new Date();
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(today.getMonth() + 6);

        const dates = `${this.formatDate(today)},${this.formatDate(sixMonthsFromNow)}`;
        return gamesApiService.get<{ results: Game[] }>('', { dates, ordering: 'released', page_size: pageSize });
    }

    async getMostAnticipatedUpcomingGames(pageSize: number = 20): Promise<{ results: Game[] }> {
        const today = new Date();
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(today.getFullYear() + 1);

        const dates = `${this.formatDate(today)},${this.formatDate(oneYearFromNow)}`;
        return gamesApiService.get<{ results: Game[] }>('', { dates, ordering: '-added', page_size: pageSize });
    }

    async getGamesByGenre(genre: string, pageSize: number = 20): Promise<{ results: Game[] }> {
        return gamesApiService.get<{ results: Game[] }>('', { genres: genre, ordering: '-added', page_size: pageSize });
    }

    async getGenres(): Promise<GenreListItem[]> {
        return gamesApiService.get<GenreListItem[]>('genres');
    }

    async getStores(): Promise<StoreListItem[]> {
        return gamesApiService.get<StoreListItem[]>('stores');
    }

    async getPlatforms(): Promise<PlatformListItem[]> {
        return gamesApiService.get<PlatformListItem[]>('platforms');
    }

    async getTrendingGames(pageSize: number = 20): Promise<{ results: Game[] }> {
        const today = new Date();
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        const dates = `${this.formatDate(oneYearAgo)},${this.formatDate(today)}`;

        return gamesApiService.get<{ results: Game[] }>('', { dates, ordering: '-added', page_size: pageSize });
    }

    async searchGames(params: SearchGamesParams = {}): Promise<RawgPaginatedResponse<Game>> {
        const query: QueryParams = {
            page_size: params.pageSize ?? 20,
            page: params.page ?? 1,
        };

        if (params.search?.trim()) {
            query.search = params.search.trim();
        }

        if (typeof params.searchPrecise === 'boolean') {
            query.search_precise = params.searchPrecise;
        }

        if (typeof params.searchExact === 'boolean') {
            query.search_exact = params.searchExact;
        }

        if (params.genres?.trim()) {
            query.genres = params.genres.trim();
        }

        if (params.platforms?.trim()) {
            query.platforms = params.platforms.trim();
        }

        if (params.stores?.trim()) {
            query.stores = params.stores.trim();
        }

        if (params.ordering?.trim()) {
            query.ordering = params.ordering.trim();
        }

        if (params.dates?.trim()) {
            query.dates = params.dates.trim();
        }

        return gamesApiService.get<RawgPaginatedResponse<Game>>('search', query);
    }

    async getGameById(id: string | number): Promise<Game> {
        return gamesApiService.get<Game>(`${id}`);
    }

    async getGameBySlug(slug: string): Promise<Game> {
        return gamesApiService.get<Game>(`slug/${encodeURIComponent(slug)}`);
    }

    // NOTE: the following sub-resource endpoints have no matching backend controller route today.
    // They are left as-is (dead/unused code) per explicit instruction; do not call them expecting real data.
    async getGameMovies(id: string | number): Promise<{ results: import('../models/Game').Movie[] }> {
        return gamesApiService.get<{ results: import('../models/Game').Movie[] }>(`${id}/movies`);
    }

    async getGameScreenshots(id: string | number): Promise<{ results: import('../models/Game').Screenshot[] }> {
        return gamesApiService.get<{ results: import('../models/Game').Screenshot[] }>(`${id}/screenshots`);
    }

    async getGameSeries(id: string | number): Promise<{ results: Game[] }> {
        return gamesApiService.get<{ results: Game[] }>(`${id}/game-series`);
    }

    async getGameSuggested(id: string | number): Promise<{ results: Game[] }> {
        return gamesApiService.get<{ results: Game[] }>(`${id}/suggested`);
    }
}

export const gameService = new GameService();
