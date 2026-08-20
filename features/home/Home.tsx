"use client";

import HeroHeader from "@/components/hero-header/HeroHeader";
import GameCarousel from "@/components/game-carousel/GameCarousel";
import { GameCard } from "@/components/game-carousel/GameCarousel";
import { Game } from "@/models/Game";
import { gameService } from "@/services/GameService";
import Footer from "@/shared/footer/Footer";
import Link from "next/link";
import { MouseEvent, useEffect, useMemo, useState } from "react";
import { Skeleton } from "primereact/skeleton";
import { getGameDetailHref } from "@/services/game-detail-route";
import type {
    GenreCatalogItem,
    PlatformCatalogItem,
    DetailedStoreCatalogItem,
    TagCatalogItem,
} from "@/app/static/catalog-data";

type SectionKey = "trending" | "topRated" | "newReleases" | "upcomingAnticipated" | "indie";
type ViewMode = "carousel" | "grid";

const NEW_RELEASES_DATE_RANGE = { from: "2025-08-20", to: "2026-08-20" };

type HubMission = {
    id: number;
    title: string;
    description: string;
    tag: string;
    cta: string;
};

type CatalogTabKey = "genres" | "stores" | "platforms" | "tags";

const SECTION_VIEW_STORAGE_KEY = "homeSectionViewModes";

const DEFAULT_VIEW_MODES: Record<SectionKey, ViewMode> = {
    trending: "carousel",
    topRated: "carousel",
    newReleases: "grid",
    upcomingAnticipated: "carousel",
    indie: "carousel",
};

const getInitialSectionViewModes = (): Record<SectionKey, ViewMode> => {
    if (typeof window === "undefined") return DEFAULT_VIEW_MODES;

    const saved = localStorage.getItem(SECTION_VIEW_STORAGE_KEY);
    if (!saved) return DEFAULT_VIEW_MODES;

    try {
        const parsed = JSON.parse(saved) as Partial<Record<SectionKey, ViewMode>>;
        return {
            ...DEFAULT_VIEW_MODES,
            ...parsed,
            newReleases: "grid",
        };
    } catch (error) {
        console.error("Error reading home view modes:", error);
        return DEFAULT_VIEW_MODES;
    }
};

const QUICK_EVENTS: string[] = [
    "Evento Relámpago: XP x2 durante 2 horas",
    "Racha diaria activa: gana 3 partidas",
    "Ranking semanal actualizado",
    "Drop especial desbloqueado en modo cooperativo",
];

const HUB_MISSIONS: HubMission[] = [
    {
        id: 1,
        title: "Misión legendaria",
        description: "Supera 5 encuentros seguidos en dificultad extrema.",
        tag: "PVE",
        cta: "Activar",
    },
    {
        id: 2,
        title: "Build del día",
        description: "Carga optimizada para shooters tácticos y alta precisión.",
        tag: "META",
        cta: "Usar build",
    },
    {
        id: 3,
        title: "Ruta express",
        description: "Selección de partidas rápidas para sesiones de 20 minutos.",
        tag: "CASUAL",
        cta: "Comenzar",
    },
];

function SectionDivider({ label }: { label: string }) {
    return (
        <div className="px-4 md:px-8 lg:px-12 py-5">
            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
                <span className="inline-flex items-center gap-2 text-xs md:text-sm uppercase tracking-[0.16em] font-semibold text-gray-300">
                    <i className="pi pi-bolt text-[#ff4200] text-[10px]" />
                    {label}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            </div>
        </div>
    );
}

function SpotlightMosaic({ games }: { games: Game[] }) {
    if (!games.length) return null;

    const [mainGame, ...restGames] = games;

    return (
        <section className="px-4 md:px-8 lg:px-12 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <article
                    className="md:col-span-7 relative h-[320px] rounded-2xl overflow-hidden border border-gray-800 group cursor-pointer"
                >
                    <Link href={getGameDetailHref(mainGame)} className="absolute inset-0 z-20" aria-label={`Ver ${mainGame.name}`} />
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-in-out group-hover:scale-105"
                        style={{ backgroundImage: `url(${mainGame.background_image || "/placeholder.jpg"})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
                    <div className="absolute top-3 left-3 bg-[#ff4200] text-black text-[11px] font-bold px-2.5 py-1 rounded-full">
                        Hot pick
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">{mainGame.name}</h3>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-200">
                            <span className="bg-white/10 px-2.5 py-1 rounded-full">⭐ {mainGame.rating}</span>
                            <span className="bg-white/10 px-2.5 py-1 rounded-full">{mainGame.released || "Próximamente"}</span>
                        </div>
                    </div>
                </article>

                <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
                    {restGames.slice(0, 2).map((game, index) => (
                        <article
                            key={game.id}
                            className="relative h-[152px] rounded-2xl overflow-hidden border border-gray-800 group cursor-pointer"
                        >
                            <Link href={getGameDetailHref(game)} className="absolute inset-0 z-20" aria-label={`Ver ${game.name}`} />
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-in-out group-hover:scale-110"
                                style={{ backgroundImage: `url(${game.background_image || "/placeholder.jpg"})` }}
                            />
                            <div className="absolute inset-0 bg-black/55 group-hover:bg-black/45 transition-colors duration-500 ease-out" />
                            <div className="relative z-10 h-full p-4 flex flex-col justify-end">
                                <span className="text-[10px] uppercase tracking-[0.16em] text-[#ff4200] font-semibold mb-1">
                                    {index === 0 ? "Top online" : "Recomendado"}
                                </span>
                                <h4 className="text-sm md:text-base font-bold text-white leading-tight line-clamp-2">{game.name}</h4>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

function GamerHubSection({ games }: { games: Game[] }) {
    return (
        <section className="px-4 md:px-8 lg:px-12 pb-10">
            <div className="rounded-2xl border border-gray-800 bg-black/20 p-4 md:p-6">
                <div className="flex flex-wrap gap-2 mb-5">
                    {QUICK_EVENTS.map((event) => (
                        <span
                            key={event}
                            className="text-[11px] md:text-xs bg-white/5 border border-gray-700 rounded-full px-3 py-1 text-gray-200"
                        >
                            {event}
                        </span>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {HUB_MISSIONS.map((mission, index) => {
                        const gameImage = games[index]?.background_image || "/placeholder.jpg";
                        const gameHref = games[index] ? getGameDetailHref(games[index]) : null;

                        return (
                            <article
                                key={mission.id}
                                className="relative overflow-hidden rounded-xl border border-gray-800 p-4 min-h-[190px] group"
                            >
                                <div
                                    className="absolute inset-0 bg-cover bg-center opacity-25 transition-transform duration-300 ease-in-out group-hover:scale-110"
                                    style={{ backgroundImage: `url(${gameImage})` }}
                                />
                                <div className="absolute inset-0 bg-[#151515]/85" />
                                <div className="relative z-10 h-full flex flex-col justify-between">
                                    <div>
                                        <span className="inline-flex text-[11px] uppercase tracking-[0.14em] text-[#ff4200] font-semibold mb-3">
                                            {mission.tag}
                                        </span>
                                        <h3 className="text-lg font-bold text-white mb-2">{mission.title}</h3>
                                        <p className="text-sm text-gray-300 leading-relaxed">{mission.description}</p>
                                    </div>

                                    {gameHref ? (
                                        <Link
                                            href={gameHref}
                                            className="mt-5 w-fit text-sm font-semibold text-black bg-[#ff4200] px-3 py-1.5 rounded-md hover:brightness-110 transition"
                                        >
                                            {mission.cta}
                                        </Link>
                                    ) : (
                                        <span className="mt-5 w-fit text-sm font-semibold text-black bg-[#ff4200] px-3 py-1.5 rounded-md opacity-70">
                                            {mission.cta}
                                        </span>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function HomeTabsShowcase({
    tabs,
}: {
    tabs: Array<{ key: SectionKey; label: string; games: Game[] }>;
}) {
    const availableTabs = useMemo(() => tabs.filter((tab) => tab.games.length > 0), [tabs]);
    const [activeTabKey, setActiveTabKey] = useState<SectionKey | null>(availableTabs[0]?.key ?? null);
    const [selectedGameId, setSelectedGameId] = useState<number | null>(availableTabs[0]?.games[0]?.id ?? null);

    const normalizedActiveTabKey =
        activeTabKey && availableTabs.some((tab) => tab.key === activeTabKey)
            ? activeTabKey
            : (availableTabs[0]?.key ?? null);

    const activeTab = useMemo(
        () => availableTabs.find((tab) => tab.key === normalizedActiveTabKey) || availableTabs[0] || null,
        [availableTabs, normalizedActiveTabKey]
    );

    const normalizedSelectedGameId =
        selectedGameId && activeTab?.games.some((game) => game.id === selectedGameId)
            ? selectedGameId
            : (activeTab?.games[0]?.id ?? null);

    const selectedGame = useMemo(() => {
        if (!activeTab || !normalizedSelectedGameId) return null;
        return activeTab.games.find((game) => game.id === normalizedSelectedGameId) || activeTab.games[0] || null;
    }, [activeTab, normalizedSelectedGameId]);

    const platformNames = useMemo(() => {
        if (!selectedGame) return [];

        const parentPlatforms = selectedGame.parent_platforms?.map((item) => item.platform.name) || [];
        const platforms = selectedGame.platforms?.map((item) => item.platform.name) || [];
        return [...new Set([...parentPlatforms, ...platforms])].slice(0, 5);
    }, [selectedGame]);

    const tagNames = useMemo(() => {
        if (!selectedGame) return [];
        return selectedGame.tags?.map((tag) => tag.name).slice(0, 6) || [];
    }, [selectedGame]);

    if (!activeTab || !selectedGame) return null;

    return (
        <section className="px-4 md:px-8 lg:px-12 pb-10">
            <div className="flex flex-wrap gap-2 mb-4">
                {availableTabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => {
                            setActiveTabKey(tab.key);
                            setSelectedGameId(tab.games[0]?.id ?? null);
                        }}
                        className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold border transition-colors ${
                            activeTab.key === tab.key
                                ? "bg-[#ff4200] border-[#ff4200] text-black"
                                : "bg-transparent border-gray-700 text-gray-300 hover:text-white hover:border-gray-500"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <article className="relative overflow-hidden rounded-2xl border border-gray-800 min-h-[360px] md:min-h-[420px]">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${selectedGame.background_image || "/placeholder.jpg"})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#151515]/95 via-[#151515]/80 to-black/55" />

                <div className="relative z-10 h-full grid grid-cols-1 md:grid-cols-12">
                    <div className="md:col-span-8 p-5 md:p-7 flex flex-col justify-end">
                        <span className="inline-flex w-fit mb-3 px-2.5 py-1 rounded-full text-[10px] md:text-xs tracking-[0.14em] uppercase bg-[#ff4200]/20 border border-[#ff4200]/40 text-[#ff8a5c]">
                            {activeTab.label}
                        </span>
                        <h3 className="text-2xl md:text-4xl font-bold text-white mb-3">{selectedGame.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-200">
                            <span className="bg-white/10 px-3 py-1 rounded-full">⭐ {selectedGame.rating}</span>
                            <span className="bg-white/10 px-3 py-1 rounded-full">{selectedGame.released || "Próximamente"}</span>
                            {(selectedGame.genres || []).slice(0, 2).map((genre) => (
                                <span key={genre.id} className="bg-white/10 px-3 py-1 rounded-full">
                                    {genre.name}
                                </span>
                            ))}
                        </div>

                        {!!platformNames.length && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {platformNames.map((platformName) => (
                                    <span
                                        key={platformName}
                                        className="text-[11px] md:text-xs bg-white/5 border border-gray-700 rounded-full px-3 py-1 text-gray-200"
                                    >
                                        {platformName}
                                    </span>
                                ))}
                            </div>
                        )}

                        {!!tagNames.length && (
                            <div className="flex flex-wrap gap-2 mb-5">
                                {tagNames.map((tagName) => (
                                    <span key={tagName} className="text-[11px] md:text-xs bg-black/40 rounded-full px-3 py-1 text-gray-300">
                                        #{tagName}
                                    </span>
                                ))}
                            </div>
                        )}

                        <Link
                            href={getGameDetailHref(selectedGame)}
                            className="w-fit p-button font-bold hover:brightness-110"
                        >
                            Ver detalle
                        </Link>
                    </div>

                    <aside className="md:col-span-4 border-t md:border-t-0 md:border-l border-gray-800/70 bg-black/20 backdrop-blur-[2px] p-3 md:p-4">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-gray-300 font-semibold mb-3">Dentro de este tab</p>
                        <div className="grid grid-cols-2 md:grid-cols-1 gap-2.5">
                            {activeTab.games.slice(0, 4).map((game) => (
                                <button
                                    key={game.id}
                                    onClick={() => setSelectedGameId(game.id)}
                                    className={`relative h-24 rounded-xl overflow-hidden border text-left transition-colors ${
                                        selectedGame.id === game.id
                                            ? "border-[#ff4200]"
                                            : "border-gray-700 hover:border-gray-500"
                                    }`}
                                >
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{ backgroundImage: `url(${game.background_image || "/placeholder.jpg"})` }}
                                    />
                                    <div className="absolute inset-0 bg-black/55" />
                                    <div className="relative z-10 h-full p-2.5 flex items-end">
                                        <span className="text-xs font-semibold text-white line-clamp-2">{game.name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </aside>
                </div>
            </article>
        </section>
    );
}

function HomeGamesSection({
    sectionKey,
    title,
    searchHref,
    games,
    viewMode,
    onChangeView,
}: {
    sectionKey: SectionKey;
    title: string;
    searchHref: string;
    games: Game[];
    viewMode: ViewMode;
    onChangeView: (section: SectionKey, mode: ViewMode) => void;
}) {
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const toggleMenu = (e: MouseEvent, gameId: number) => {
        e.stopPropagation();
        e.preventDefault();
        setOpenMenuId(openMenuId === gameId ? null : gameId);
    };

    const gamesForGrid = useMemo(() => games.slice(0, 9), [games]);

    return (
        <section className="pb-2">
            <div className="px-4 md:px-8 lg:px-12 mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <span className="w-1 h-8 bg-[#ff4200] rounded-full"></span>
                        {title}
                    </h2>
                    <Link
                        href={searchHref}
                        className="text-[11px] md:text-xs text-[#ff9b75] hover:text-[#ffb08f] underline underline-offset-2 whitespace-nowrap"
                    >
                        Ver mas
                    </Link>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onChangeView(sectionKey, "carousel")}
                        title="Vista scroll"
                        aria-label="Vista scroll"
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${viewMode === "carousel"
                                ? "bg-[#ff4200] border-[#ff4200] text-black"
                                : "bg-transparent border-gray-700 text-gray-300 hover:text-white hover:border-gray-500"
                            }`}
                    >
                        <i className="pi pi-arrows-h text-sm"></i>
                    </button>
                    <button
                        onClick={() => onChangeView(sectionKey, "grid")}
                        title="Vista cuadrícula 3x3"
                        aria-label="Vista cuadrícula 3x3"
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${viewMode === "grid"
                                ? "bg-[#ff4200] border-[#ff4200] text-black"
                                : "bg-transparent border-gray-700 text-gray-300 hover:text-white hover:border-gray-500"
                            }`}
                    >
                        <i className="pi pi-th-large text-sm"></i>
                    </button>
                </div>
            </div>

            {viewMode === "carousel" ? (
                <GameCarousel
                    title={title}
                    games={games}
                    showTitle={false}
                    cardClassName="w-64 md:w-96"
                    cardMediaClassName="h-36 md:h-56"
                />
            ) : (
                <div className="pb-10">
                    <div className="container mx-auto px-4 md:px-8 lg:px-12">
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {gamesForGrid.map((game, index) => {
                                return (
                                    <div key={game.id} className={index > 3 ? "hidden md:block" : "block"}>
                                        <GameCard
                                            game={game}
                                            openMenuId={openMenuId}
                                            toggleMenu={toggleMenu}
                                            className="w-full"
                                            mediaClassName="h-36 md:h-56"
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

function CatalogTabsSection({
    genres,
    stores,
    platforms,
    tags,
    limit = 15,
}: {
    genres: GenreCatalogItem[];
    stores: DetailedStoreCatalogItem[];
    platforms: PlatformCatalogItem[];
    tags: TagCatalogItem[];
    limit?: number;
}) {
    const [activeTab, setActiveTab] = useState<CatalogTabKey>("genres");

    const tabs = useMemo(
        () => [
            { key: "genres" as const, label: "Genres", items: genres.slice(0, limit) },
            { key: "stores" as const, label: "Stores", items: stores.slice(0, limit) },
            { key: "platforms" as const, label: "Platforms", items: platforms.slice(0, limit) },
            { key: "tags" as const, label: "Tags", items: tags.slice(0, limit) },
        ],
        [genres, stores, platforms, tags, limit]
    );

    const active = tabs.find((tab) => tab.key === activeTab) || tabs[0];

    if (!active) return null;

    return (
        <section className="px-4 md:px-8 lg:px-12 pb-10">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-4">
                <span className="w-1 h-8 bg-[#ff4200] rounded-full"></span>
                Catálogo
            </h2>

            <div className="flex flex-wrap gap-2 mb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold border transition-colors ${
                            activeTab === tab.key
                                ? "bg-[#ff4200] border-[#ff4200] text-black"
                                : "bg-transparent border-gray-700 text-gray-300 hover:text-white hover:border-gray-500"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {active.items.map((item) => {
                    const hasGamesCount = "games_count" in item;
                    const gamesCount = hasGamesCount ? item.games_count : null;
                    const secondary = "domain" in item ? item.domain : "language" in item ? item.language : null;
                    const backgroundImage = "image_background" in item ? item.image_background : null;
                    const searchParamKey =
                        active.key === "genres" || active.key === "platforms" || active.key === "stores"
                            ? active.key
                            : null;

                    const cardContent = (
                        <>
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${backgroundImage || "/placeholder.jpg"})` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/65 to-black/35" />

                            <div className="relative z-10 p-3 md:p-4">
                                <h3 className="text-sm md:text-base font-semibold text-white line-clamp-1">{item.name}</h3>
                                <p className="text-xs text-gray-300 mt-1 line-clamp-1">{item.slug}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {typeof gamesCount === "number" && (
                                        <span className="text-[11px] md:text-xs bg-black/35 border border-gray-600 rounded-full px-2.5 py-1 text-gray-100">
                                            Juegos: {gamesCount.toLocaleString()}
                                        </span>
                                    )}
                                    {!!secondary && (
                                        <span className="text-[11px] md:text-xs bg-black/35 border border-gray-600 rounded-full px-2.5 py-1 text-gray-100">
                                            {secondary}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </>
                    );

                    if (searchParamKey) {
                        return (
                            <Link
                                key={`${active.key}-${item.id}`}
                                href={`/search?${searchParamKey}=${encodeURIComponent(item.slug)}`}
                                className="relative overflow-hidden rounded-xl border border-gray-800 min-h-[150px] block transition-transform hover:scale-[1.02]"
                            >
                                {cardContent}
                            </Link>
                        );
                    }

                    return (
                        <article
                            key={`${active.key}-${item.id}`}
                            className="relative overflow-hidden rounded-xl border border-gray-800 min-h-[150px]"
                        >
                            {cardContent}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

export default function Home() {
    const [trendingGames, setTrendingGames] = useState<Game[]>([]);
    const [topRatedGames, setTopRatedGames] = useState<Game[]>([]);
    const [newReleaseGames, setNewReleaseGames] = useState<Game[]>([]);
    const [upcomingAnticipatedGames, setUpcomingAnticipatedGames] = useState<Game[]>([]);
    const [indieGames, setIndieGames] = useState<Game[]>([]);
    const [catalogData, setCatalogData] = useState<{
        genres: GenreCatalogItem[];
        stores: DetailedStoreCatalogItem[];
        platforms: PlatformCatalogItem[];
        tags: TagCatalogItem[];
    }>({
        genres: [],
        stores: [],
        platforms: [],
        tags: [],
    });
    const [featuredGame, setFeaturedGame] = useState<Game | null>(null);
    const [sectionViewModes, setSectionViewModes] = useState<Record<SectionKey, ViewMode>>(getInitialSectionViewModes);
    const [loading, setLoading] = useState(true);

    const homeTabs = useMemo(
        () => [
            { key: "trending" as const, label: "Trending", games: trendingGames },
            { key: "topRated" as const, label: "Top rated", games: topRatedGames },
            { key: "newReleases" as const, label: "Nuevos", games: newReleaseGames },
            { key: "indie" as const, label: "Indie", games: indieGames },
        ],
        [trendingGames, topRatedGames, newReleaseGames, indieGames]
    );

    const visualShowcaseGames = useMemo(() => {
        const uniqueGames = [
            ...trendingGames,
            ...topRatedGames,
            ...newReleaseGames,
            ...upcomingAnticipatedGames,
            ...indieGames,
        ].filter((game, index, allGames) => allGames.findIndex((item) => item.id === game.id) === index);

        return uniqueGames.slice(0, 3);
    }, [trendingGames, topRatedGames, newReleaseGames, upcomingAnticipatedGames, indieGames]);

    useEffect(() => {
        localStorage.setItem(SECTION_VIEW_STORAGE_KEY, JSON.stringify(sectionViewModes));
    }, [sectionViewModes]);

    const handleChangeSectionView = (section: SectionKey, mode: ViewMode) => {
        setSectionViewModes((previous) => ({
            ...previous,
            [section]: mode,
        }));
    };

    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const sectionSearchHref = useMemo(() => {
        const today = new Date();
        const oneYearAgo = new Date(today);
        oneYearAgo.setFullYear(today.getFullYear() - 1);

        const oneYearFromNow = new Date(today);
        oneYearFromNow.setFullYear(today.getFullYear() + 1);

        return {
            trending: `/search?ordering=-added&dates=${formatDate(oneYearAgo)},${formatDate(today)}`,
            topRated: "/search?ordering=-rating",
            newReleases: `/search?ordering=-released&dates=${NEW_RELEASES_DATE_RANGE.from},${NEW_RELEASES_DATE_RANGE.to}`,
            upcomingAnticipated: `/search?ordering=-added&dates=${formatDate(today)},${formatDate(oneYearFromNow)}`,
            indie: "/search?genres=indie&ordering=-added",
        } satisfies Record<SectionKey, string>;
    }, []);

    useEffect(() => {
        let mounted = true;
        let timeoutId: ReturnType<typeof setTimeout> | undefined;

        const loadCatalogData = async () => {
            const catalogModule = await import("@/app/static/catalog-data");
            if (!mounted) return;

            setCatalogData({
                genres: catalogModule.genresCatalog,
                stores: catalogModule.storesCatalog,
                platforms: catalogModule.platformsCatalog,
                tags: catalogModule.tagsCatalog,
            });
        };

        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
            (window as Window & {
                requestIdleCallback: (callback: () => void) => number;
                cancelIdleCallback: (id: number) => void;
            }).requestIdleCallback(() => {
                void loadCatalogData();
            });
        } else {
            timeoutId = setTimeout(() => {
                void loadCatalogData();
            }, 300);
        }

        return () => {
            mounted = false;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    useEffect(() => {
        const loadHomeData = async () => {
            try {
                const today = new Date();

                const oneYearAgo = new Date(today);
                oneYearAgo.setFullYear(today.getFullYear() - 1);

                const oneYearFromNow = new Date(today);
                oneYearFromNow.setFullYear(today.getFullYear() + 1);

                const [trendingData, topRatedData, newReleaseData, upcomingAnticipatedData, indieData] = await Promise.all([
                    gameService.searchGames({
                        page: 1,
                        pageSize: 20,
                        ordering: "-added",
                        dates: `${formatDate(oneYearAgo)},${formatDate(today)}`,
                    }),
                    gameService.searchGames({
                        page: 1,
                        pageSize: 20,
                        ordering: "-rating",
                    }),
                    gameService.searchGames({
                        page: 1,
                        pageSize: 20,
                        ordering: "-released",
                        dates: `${NEW_RELEASES_DATE_RANGE.from},${NEW_RELEASES_DATE_RANGE.to}`,
                    }),
                    gameService.searchGames({
                        page: 1,
                        pageSize: 20,
                        ordering: "-added",
                        dates: `${formatDate(today)},${formatDate(oneYearFromNow)}`,
                    }),
                    gameService.searchGames({
                        page: 1,
                        pageSize: 20,
                        genres: "indie",
                        ordering: "-added",
                    }),
                ]);

                console.log(trendingData);

                const trending = Array.isArray(trendingData?.items) ? trendingData.items : [];
                const topRated = Array.isArray(topRatedData?.items) ? topRatedData.items : [];
                const newReleases = Array.isArray(newReleaseData?.items) ? newReleaseData.items : [];
                const upcomingAnticipated = Array.isArray(upcomingAnticipatedData?.items) ? upcomingAnticipatedData.items : [];
                const indie = Array.isArray(indieData?.items) ? indieData.items : [];

                setTrendingGames(trending);
                setTopRatedGames(topRated);
                setNewReleaseGames(newReleases);
                setUpcomingAnticipatedGames(upcomingAnticipated);
                setIndieGames(indie);
                setFeaturedGame(trending[0] || topRated[0] || newReleases[0] || null);
            } catch (error) {
                console.error("Error loading home games:", error);
                setTrendingGames([]);
                setTopRatedGames([]);
                setNewReleaseGames([]);
                setUpcomingAnticipatedGames([]);
                setIndieGames([]);
                setFeaturedGame(null);
            } finally {
                setLoading(false);
            }
        };

        loadHomeData();
    }, []);

    if (loading) {
        return (
            <div className="bg-[#151515] min-h-screen text-white pb-10">
                <section className="relative w-full h-[40vh] min-h-75 md:h-[60vh] md:min-h-125 overflow-hidden">
                    <Skeleton width="100%" height="100%" borderRadius="0" className="bg-gray-800/70!" />
                    <div className="absolute inset-0 pointer-events-none bg-linear-to-b from-transparent via-[rgba(21,21,21,0.4)] to-[#151515]" />

                    <div className="absolute inset-0 z-21 flex flex-col justify-end items-start px-8 pb-12 md:px-16 md:pb-24 lg:px-24">
                        <Skeleton width="min(520px,75vw)" height="3rem" className="bg-gray-700/80! mb-3" />
                        <Skeleton width="140px" height="2.7rem" borderRadius="0.5rem" className="bg-[#ff4200]/70!" />
                    </div>
                </section>

                <GameCarousel title="Trending ahora" games={[]} loading skeletonCount={6} />
                <GameCarousel title="Futuros lanzamientos más esperados" games={[]} loading skeletonCount={6} />
                <GameCarousel title="Mejor valorados" games={[]} loading skeletonCount={6} />
            </div>
        );
    }

    return (
        <div className="bg-[#151515] min-h-screen text-white">
            <HeroHeader
                items={(trendingGames.length ? trendingGames : topRatedGames).slice(0, 6).map((game) => ({
                    id: game.id,
                    slug: game.slug,
                    name: game.name,
                    backgroundImage: game.background_image
                }))}
            />

            <div className="mx-auto pt-2">

                <HomeGamesSection
                    sectionKey="trending"
                    title="Trending ahora"
                    searchHref={sectionSearchHref.trending}
                    games={trendingGames}
                    viewMode={sectionViewModes.trending}
                    onChangeView={handleChangeSectionView}
                />
                {/* <SectionDivider label="Radar visual" />
                <SpotlightMosaic games={visualShowcaseGames} onOpenGame={(gameId) => router.push(`/game/${gameId}`)} /> */}

                    {/* section nuevos lanzamientos */}

                <HomeGamesSection
                    sectionKey="newReleases"
                    title="Nuevos lanzamientos"
                    searchHref={sectionSearchHref.newReleases}
                    games={newReleaseGames}
                    viewMode={sectionViewModes.newReleases}
                    onChangeView={handleChangeSectionView}
                />
                  <SectionDivider label="Tabs destacados" />
                <HomeTabsShowcase tabs={homeTabs} />

                <SectionDivider label="Hub gamer" />
                <GamerHubSection games={visualShowcaseGames} />



                {featuredGame && (
                    <section className="relative w-full h-[280px] md:h-[360px] overflow-hidden border-y border-gray-800">
                        <div
                            className="absolute inset-0 bg-cover bg-center bg-fixed"
                            style={{ backgroundImage: `url(${featuredGame.background_image || "/placeholder.jpg"})` }}
                            aria-hidden="true"
                        />
                        <div className="absolute inset-0 bg-black/70" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#151515] via-[#151515]/70 to-transparent" />

                        <div className="relative z-10 h-full px-4 md:px-8 lg:px-12 flex items-center">
                            <div className="max-w-2xl">
                                <p className="text-[#ff4200] uppercase tracking-[0.2em] text-xs md:text-sm mb-3 font-semibold">
                                    Juego destacado
                                </p>
                                <h2 className="text-2xl md:text-4xl font-bold mb-3">{featuredGame.name}</h2>
                                <div className="flex flex-wrap gap-3 text-xs md:text-sm text-gray-200 mb-5">
                                    <span className="bg-white/10 px-3 py-1 rounded-full">⭐ {featuredGame.rating}</span>
                                    <span className="bg-white/10 px-3 py-1 rounded-full">{featuredGame.released || "Fecha sin confirmar"}</span>
                                    <span className="bg-white/10 px-3 py-1 rounded-full">{featuredGame.genres?.[0]?.name || "Gaming"}</span>
                                </div>
                                <Link
                                    href={getGameDetailHref(featuredGame)}
                                    className="p-button font-bold hover:brightness-110"
                                >
                                    Ver juego
                                </Link>
                            </div>
                        </div>
                    </section>
                )}

                <SectionDivider label="Colecciones" />

                <HomeGamesSection
                    sectionKey="topRated"
                    title="Mejor valorados"
                    searchHref={sectionSearchHref.topRated}
                    games={topRatedGames}
                    viewMode={sectionViewModes.topRated}
                    onChangeView={handleChangeSectionView}
                />
                <HomeGamesSection
                    sectionKey="upcomingAnticipated"
                    title="Futuros lanzamientos más esperados"
                    searchHref={sectionSearchHref.upcomingAnticipated}
                    games={upcomingAnticipatedGames}
                    viewMode={sectionViewModes.upcomingAnticipated}
                    onChangeView={handleChangeSectionView}
                />

                <CatalogTabsSection
                    genres={catalogData.genres}
                    stores={catalogData.stores}
                    platforms={catalogData.platforms}
                    tags={catalogData.tags}
                    limit={15}
                />

                <HomeGamesSection
                    sectionKey="indie"
                    title="Indie destacados"
                    searchHref={sectionSearchHref.indie}
                    games={indieGames}
                    viewMode={sectionViewModes.indie}
                    onChangeView={handleChangeSectionView}
                />
            </div>

            <Footer />
        </div>
    );
}
