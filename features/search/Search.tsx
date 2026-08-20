"use client";

import { FormEvent, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { GameCard, GameCardSkeleton } from "@/components/game-carousel/GameCarousel";
import Footer from "@/shared/footer/Footer";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { Checkbox } from "primereact/checkbox";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import {
    gameService,
    GenreListItem,
    PlatformListItem,
    RawgPaginatedResponse,
    SearchGamesParams,
    StoreListItem,
} from "@/services/GameService";
import { Game } from "@/models/Game";

type SelectOption = { label: string; value: string };

const PAGE_SIZE = 21;

const ORDERING_OPTIONS: Array<{ label: string; value: string }> = [
    { label: "Nombre (A-Z)", value: "name" },
    { label: "Nombre (Z-A)", value: "-name" },
    { label: "Lanzamiento (asc)", value: "released" },
    { label: "Lanzamiento (desc)", value: "-released" },
    { label: "Añadidos (asc)", value: "added" },
    { label: "Añadidos (desc)", value: "-added" },
    { label: "Creado (asc)", value: "created" },
    { label: "Creado (desc)", value: "-created" },
    { label: "Actualizado (asc)", value: "updated" },
    { label: "Actualizado (desc)", value: "-updated" },
    { label: "Rating (asc)", value: "rating" },
    { label: "Rating (desc)", value: "-rating" },
    { label: "Metacritic (asc)", value: "metacritic" },
    { label: "Metacritic (desc)", value: "-metacritic" },
];

export default function Search() {
    const router = useRouter();
    const pathname = usePathname();
    const hasInitializedAutoSearch = useRef(false);
    const isInitializingFromUrl = useRef(true);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [selectedStores, setSelectedStores] = useState<string[]>([]);
    const [ordering, setOrdering] = useState("");
    const [dateRange, setDateRange] = useState<Date[] | null>(null);
    const [searchPrecise, setSearchPrecise] = useState(false);
    const [searchExact, setSearchExact] = useState(false);
    const [genreOptions, setGenreOptions] = useState<SelectOption[]>([]);
    const [platformOptions, setPlatformOptions] = useState<SelectOption[]>([]);
    const [storeOptions, setStoreOptions] = useState<SelectOption[]>([]);

    const [games, setGames] = useState<Game[]>([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const hasPreviousPage = page > 1;
    const hasNextPage = page * PAGE_SIZE < count;

    const pushSearchParamsToUrl = useCallback((params: SearchGamesParams) => {
        const urlParams = new URLSearchParams();

        if (params.search?.trim()) {
            urlParams.set("q", params.search.trim());
        }

        if (params.searchPrecise) {
            urlParams.set("precise", "1");
        }

        if (params.searchExact) {
            urlParams.set("exact", "1");
        }

        if (params.genres?.trim()) {
            urlParams.set("genres", params.genres.trim());
        }

        if (params.platforms?.trim()) {
            urlParams.set("platforms", params.platforms.trim());
        }

        if (params.stores?.trim()) {
            urlParams.set("stores", params.stores.trim());
        }

        if (params.ordering?.trim()) {
            urlParams.set("ordering", params.ordering.trim());
        }

        if (params.dates?.trim()) {
            urlParams.set("dates", params.dates.trim());
        }

        if ((params.page ?? 1) > 1) {
            urlParams.set("page", String(params.page));
        }

        const queryString = urlParams.toString();
        const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

        router.replace(nextUrl, { scroll: false });
    }, [pathname, router]);

    const datesFilter = useMemo(() => {
        const formatDate = (value: Date) => {
            const year = value.getFullYear();
            const month = String(value.getMonth() + 1).padStart(2, "0");
            const day = String(value.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };

        const from = dateRange?.[0] ?? null;
        const to = dateRange?.[1] ?? null;

        if (!from || !to || from > to) {
            return undefined;
        }

        return `${formatDate(from)},${formatDate(to)}`;
    }, [dateRange]);

    const runSearch = useCallback(async (nextPage: number, overrides?: Partial<SearchGamesParams>) => {
        setLoading(true);
        setError(null);
        setOpenMenuId(null);

        const params: SearchGamesParams = {
            page: nextPage,
            pageSize: PAGE_SIZE,
            search: query.trim() || undefined,
            searchPrecise,
            searchExact,
            genres: selectedGenres.join(",") || undefined,
            platforms: selectedPlatforms.join(",") || undefined,
            stores: selectedStores.join(",") || undefined,
            ordering: ordering || undefined,
            dates: datesFilter,
            ...overrides,
        };

        pushSearchParamsToUrl(params);

        try {
            const response: RawgPaginatedResponse<Game> = await gameService.searchGames(params);
            const safeResults = Array.isArray(response.items) ? response.items : [];

            setPage(Number.isFinite(response.page) ? response.page : nextPage);
            setGames(safeResults);
            setCount(Number.isFinite(response.totalCount) ? response.totalCount : 0);
        } catch {
            setGames([]);
            setCount(0);
            setError("No se pudo realizar la búsqueda con los filtros actuales.");
        } finally {
            setLoading(false);
        }
    }, [datesFilter, ordering, pushSearchParamsToUrl, query, searchExact, searchPrecise, selectedGenres, selectedPlatforms, selectedStores]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void runSearch(1);
    };

    const handleClearFilters = () => {
        setQuery("");
        setSelectedGenres([]);
        setSelectedPlatforms([]);
        setSelectedStores([]);
        setOrdering("");
        setDateRange(null);
        setSearchPrecise(false);
        setSearchExact(false);
    };

    const toggleMenu = (event: MouseEvent, gameId: number) => {
        event.stopPropagation();
        event.preventDefault();
        setOpenMenuId((current) => (current === gameId ? null : gameId));
    };

    useEffect(() => {
        let isMounted = true;

        const loadFilterOptions = async () => {
            const [genresResult, platformsResult, storesResult] = await Promise.allSettled([
                gameService.getGenres(),
                gameService.getPlatforms(),
                gameService.getStores(),
            ]);

            if (!isMounted) {
                return;
            }

            const genres = genresResult.status === "fulfilled" ? genresResult.value : [];
            const platforms = platformsResult.status === "fulfilled" ? platformsResult.value : [];
            const stores = storesResult.status === "fulfilled" ? storesResult.value : [];

            setGenreOptions(
                (Array.isArray(genres) ? genres : []).map((genre: GenreListItem) => ({
                    label: genre.name,
                    value: String(genre.id),
                }))
            );

            setPlatformOptions(
                (Array.isArray(platforms) ? platforms : []).slice(0, 40).map((platform: PlatformListItem) => ({
                    label: platform.name,
                    value: String(platform.id),
                }))
            );

            setStoreOptions(
                (Array.isArray(stores) ? stores : []).map((store: StoreListItem) => ({
                    label: store.name,
                    value: String(store.id),
                }))
            );
        };

        void loadFilterOptions();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (hasInitializedAutoSearch.current) {
            return;
        }

        hasInitializedAutoSearch.current = true;

        const parseBooleanParam = (value: string | null): boolean => {
            if (!value) {
                return false;
            }

            const normalized = value.trim().toLowerCase();
            return normalized === "1" || normalized === "true";
        };

        const parseCsvParam = (value: string | null): string[] => {
            if (!value?.trim()) {
                return [];
            }

            return value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);
        };

        const parseDateRangeParam = (value: string | null): Date[] | null => {
            if (!value?.trim()) {
                return null;
            }

            const [fromRaw, toRaw] = value.split(",").map((item) => item.trim());

            if (!fromRaw || !toRaw) {
                return null;
            }

            const from = new Date(`${fromRaw}T00:00:00`);
            const to = new Date(`${toRaw}T00:00:00`);

            if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
                return null;
            }

            return [from, to];
        };

        const readUrlInitialState = () => {
            if (typeof window === "undefined") {
                return {
                    initialPage: 1,
                    initialOverrides: {},
                };
            }

            const urlParams = new URLSearchParams(window.location.search);

            const initialQuery = urlParams.get("q")?.trim() ?? "";
            const initialGenres = parseCsvParam(urlParams.get("genres"));
            const initialPlatforms = parseCsvParam(urlParams.get("platforms"));
            const initialStores = parseCsvParam(urlParams.get("stores"));
            const initialOrdering = urlParams.get("ordering")?.trim() ?? "";
            const initialDatesParam = urlParams.get("dates")?.trim() ?? "";
            const initialDateRange = parseDateRangeParam(initialDatesParam);
            const initialSearchPrecise = parseBooleanParam(urlParams.get("precise"));
            const initialSearchExact = parseBooleanParam(urlParams.get("exact"));
            const parsedPage = Number(urlParams.get("page"));
            const initialPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

            setQuery(initialQuery);
            setSelectedGenres(initialGenres);
            setSelectedPlatforms(initialPlatforms);
            setSelectedStores(initialStores);
            setOrdering(initialOrdering);
            setDateRange(initialDateRange);
            setSearchPrecise(initialSearchPrecise);
            setSearchExact(initialSearchExact);
            setPage(initialPage);

            return {
                initialPage,
                initialOverrides: {
                    search: initialQuery || undefined,
                    genres: initialGenres.join(",") || undefined,
                    platforms: initialPlatforms.join(",") || undefined,
                    stores: initialStores.join(",") || undefined,
                    ordering: initialOrdering || undefined,
                    dates: initialDatesParam || undefined,
                    searchPrecise: initialSearchPrecise,
                    searchExact: initialSearchExact,
                } satisfies Partial<SearchGamesParams>,
            };
        };

        const { initialPage, initialOverrides } = readUrlInitialState();

        const initialize = async () => {
            try {
                await runSearch(initialPage, initialOverrides);
            } finally {
                isInitializingFromUrl.current = false;
            }
        };

        void initialize();
    }, [runSearch]);

    useEffect(() => {
        if (!hasInitializedAutoSearch.current || isInitializingFromUrl.current) {
            return;
        }

        setLoading(true);

        const timeoutId = window.setTimeout(() => {
            void runSearch(1);
        }, 1000);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [
        query,
        selectedGenres,
        selectedPlatforms,
        selectedStores,
        ordering,
        dateRange,
        searchPrecise,
        searchExact,
        runSearch,
    ]);

    return (
        <div className="min-h-screen bg-[#151515] text-white pt-28">
            <main className="px-4 md:px-8 lg:px-12 pb-12">
                <section className="mb-6  p-4 md:p-5">
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">Buscar juegos</h1>
                    <p className="text-sm text-gray-400 mb-4">
                        Filtros: nombre, precisión, exactitud, plataformas, stores, géneros, fechas y ordenación.
                    </p>

                    <div className="block md:hidden w-full mb-4">
                        <Button
                            type="button"
                            onClick={() => setIsMobileFiltersOpen((current) => !current)}
                            className="w-full"
                            outlined
                            label="Filtros"
                            icon={`pi ${isMobileFiltersOpen ? "pi-chevron-up" : "pi-chevron-down"}`}
                            iconPos="right"
                            aria-expanded={isMobileFiltersOpen}
                            aria-controls="search-filters-form"
                        />
                    </div>

                    <form
                        id="search-filters-form"
                        onSubmit={handleSubmit}
                        className={`w-full space-y-2 ${isMobileFiltersOpen ? "block" : "hidden"} md:block`}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 items-start justify-items-stretch">
                            <div className="md:col-span-3 p-1">
                                <InputText
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Buscar por nombre..."
                                    className="w-full bg-transparent border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#ff4200]"
                                />
                            </div>

                            <div id="genres-filter" className="md:col-span-2 p-1 scroll-mt-28">
                                <MultiSelect
                                    value={selectedGenres}
                                    onChange={(event) => setSelectedGenres((event.value as string[]) ?? [])}
                                    options={genreOptions}
                                    optionLabel="label"
                                    optionValue="value"
                                    display="chip"
                                    filter
                                    placeholder="Géneros"
                                    className="w-full text-xs"
                                    panelClassName="bg-[#151515] text-white"
                                />
                            </div>

                            <div id="platforms-filter" className="md:col-span-2 p-1 scroll-mt-28">
                                <MultiSelect
                                    value={selectedPlatforms}
                                    onChange={(event) => setSelectedPlatforms((event.value as string[]) ?? [])}
                                    options={platformOptions}
                                    optionLabel="label"
                                    optionValue="value"
                                    display="chip"
                                    filter
                                    placeholder="Plataformas"
                                    className="w-full text-xs"
                                    panelClassName="bg-[#151515] text-white"
                                />
                            </div>

                            <div id="stores-filter" className="md:col-span-2 p-1 scroll-mt-28">
                                <MultiSelect
                                    value={selectedStores}
                                    onChange={(event) => setSelectedStores((event.value as string[]) ?? [])}
                                    options={storeOptions}
                                    optionLabel="label"
                                    optionValue="value"
                                    display="chip"
                                    filter
                                    placeholder="Stores"
                                    className="w-full text-xs"
                                    panelClassName="bg-[#151515] text-white"
                                />
                            </div>

                            <div className="md:col-span-3 p-1">
                                <Calendar
                                    value={dateRange}
                                    onChange={(event) => setDateRange((event.value as Date[] | null) ?? null)}
                                    selectionMode="range"
                                    dateFormat="yy-mm-dd"
                                    showIcon
                                    readOnlyInput
                                    placeholder="Desde - Hasta"
                                    className="w-full text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-start gap-2">
                            <div className="flex items-center gap-3 text-xs text-gray-300">
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <Checkbox
                                        inputId="searchPrecise"
                                        checked={searchPrecise}
                                        onChange={(event) => setSearchPrecise(Boolean(event.checked))}
                                    />
                                    <span>Preciso</span>
                                </label>
                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                    <Checkbox
                                        inputId="searchExact"
                                        checked={searchExact}
                                        onChange={(event) => setSearchExact(Boolean(event.checked))}
                                    />
                                    <span>Exacto</span>
                                </label>
                            </div>

                            <Dropdown
                                value={ordering}
                                onChange={(event) => setOrdering((event.value as string) ?? "")}
                                options={[{ label: "Orden por defecto", value: "" }, ...ORDERING_OPTIONS]}
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Ordenar"
                                className="w-full md:w-56 text-xs"
                                panelClassName="bg-[#151515] text-white"
                            />

                            <div className="flex flex-wrap items-center gap-2 justify-start">
                                <Button
                                    type="submit"
                                    label="Buscar"
                                    disabled={loading}
                                />
                                <Button
                                    type="button"
                                    label="Limpiar"
                                    onClick={handleClearFilters}
                                    outlined
                                    disabled={loading}
                                />
                                <span className="text-xs text-gray-400">{count.toLocaleString()} resultados</span>
                            </div>
                        </div>
                    </form>
                </section>

                <section>
                    {loading && (
                        <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(500px,500px))] gap-4 justify-center justify-items-center py-2">
                            {Array.from({ length: 9 }).map((_, index) => (
                                <GameCardSkeleton
                                    key={`search-skeleton-${index}`}
                                    className="w-full max-w-70 lg:w-125 lg:max-w-125"
                                />
                            ))}
                        </div>
                    )}

                    {!loading && error && (
                        <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    {!loading && !error && games.length === 0 && (
                        <div className="rounded-lg border border-gray-700 bg-black/20 p-4 text-gray-300 text-sm">
                            No se encontraron juegos con esos filtros.
                        </div>
                    )}

                    {!loading && games.length > 0 && (
                        <>
                            <div className="grid grid-cols-2 lg:[grid-template-columns:repeat(auto-fit,minmax(500px,500px))] gap-4 justify-center justify-items-center">
                                {games.map((game) => {
                                    return (
                                        <GameCard
                                            key={game.id}
                                            game={game}
                                            openMenuId={openMenuId}
                                            toggleMenu={toggleMenu}
                                            className="w-full max-w-[280px] lg:w-[500px] lg:max-w-[500px]"
                                        />
                                    );
                                })}
                            </div>

                            <div className="mt-8 flex items-center justify-center gap-4">
                                <Button
                                    type="button"
                                    onClick={() => hasPreviousPage && void runSearch(page - 1)}
                                    disabled={!hasPreviousPage || loading}
                                    label="Anterior"
                                    outlined
                                />
                                <span className="text-sm text-gray-300">Página {page}</span>
                                <Button
                                    type="button"
                                    onClick={() => hasNextPage && void runSearch(page + 1)}
                                    disabled={!hasNextPage || loading}
                                    label="Siguiente"
                                    outlined
                                />
                            </div>
                        </>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
}
