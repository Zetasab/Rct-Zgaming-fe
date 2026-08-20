"use client";

import { MouseEvent, useEffect, useMemo, useState } from "react";
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { GameCard, GameCardSkeleton } from "@/components/game-carousel/GameCarousel";
import Footer from "@/shared/footer/Footer";
import { gameService } from "@/services/GameService";
import { Game } from "@/models/Game";
import { getWishlist, WISHLIST_CHANGE_EVENT } from "@/services/wishlist";

type SelectOption = { label: string; value: string };

const ORDERING_OPTIONS: Array<{ label: string; value: string }> = [
    { label: "Nombre (A-Z)", value: "name" },
    { label: "Nombre (Z-A)", value: "-name" },
    { label: "Lanzamiento (asc)", value: "released" },
    { label: "Lanzamiento (desc)", value: "-released" },
    { label: "Rating (asc)", value: "rating" },
    { label: "Rating (desc)", value: "-rating" },
];

export default function Wishlist() {
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [selectedStores, setSelectedStores] = useState<string[]>([]);
    const [ordering, setOrdering] = useState("");
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    useEffect(() => {
        let isMounted = true;

        const loadWishlistGames = async () => {
            setLoading(true);
            const items = getWishlist();

            const results = await Promise.allSettled(
                items.map((item) => gameService.getGameById(item.id))
            );

            if (!isMounted) {
                return;
            }

            const loadedGames = results
                .filter((result): result is PromiseFulfilledResult<Game> => result.status === "fulfilled")
                .map((result) => result.value);

            setGames(loadedGames);
            setLoading(false);
        };

        void loadWishlistGames();

        const handleWishlistChange = () => {
            void loadWishlistGames();
        };

        window.addEventListener(WISHLIST_CHANGE_EVENT, handleWishlistChange);
        return () => {
            isMounted = false;
            window.removeEventListener(WISHLIST_CHANGE_EVENT, handleWishlistChange);
        };
    }, []);

    const genreOptions = useMemo<SelectOption[]>(() => {
        const map = new Map<string, string>();
        games.forEach((game) => game.genres?.forEach((genre) => map.set(genre.slug, genre.name)));
        return Array.from(map.entries()).map(([value, label]) => ({ label, value }));
    }, [games]);

    const platformOptions = useMemo<SelectOption[]>(() => {
        const map = new Map<string, string>();
        games.forEach((game) => game.platforms?.forEach((p) => map.set(p.platform.slug, p.platform.name)));
        return Array.from(map.entries()).map(([value, label]) => ({ label, value }));
    }, [games]);

    const storeOptions = useMemo<SelectOption[]>(() => {
        const map = new Map<string, string>();
        games.forEach((game) => game.stores?.forEach((s) => map.set(s.store.slug, s.store.name)));
        return Array.from(map.entries()).map(([value, label]) => ({ label, value }));
    }, [games]);

    const filteredGames = useMemo(() => {
        let result = games;

        const normalizedQuery = query.trim().toLowerCase();
        if (normalizedQuery) {
            result = result.filter((game) => game.name.toLowerCase().includes(normalizedQuery));
        }

        if (selectedGenres.length > 0) {
            result = result.filter((game) =>
                game.genres?.some((genre) => selectedGenres.includes(genre.slug))
            );
        }

        if (selectedPlatforms.length > 0) {
            result = result.filter((game) =>
                game.platforms?.some((p) => selectedPlatforms.includes(p.platform.slug))
            );
        }

        if (selectedStores.length > 0) {
            result = result.filter((game) =>
                game.stores?.some((s) => selectedStores.includes(s.store.slug))
            );
        }

        if (ordering) {
            const field = ordering.startsWith("-") ? ordering.slice(1) : ordering;
            const descending = ordering.startsWith("-");
            result = [...result].sort((a, b) => {
                let comparison = 0;
                if (field === "name") {
                    comparison = a.name.localeCompare(b.name);
                } else if (field === "released") {
                    comparison = (a.released || "").localeCompare(b.released || "");
                } else if (field === "rating") {
                    comparison = a.rating - b.rating;
                }
                return descending ? -comparison : comparison;
            });
        }

        return result;
    }, [games, query, selectedGenres, selectedPlatforms, selectedStores, ordering]);

    const handleClearFilters = () => {
        setQuery("");
        setSelectedGenres([]);
        setSelectedPlatforms([]);
        setSelectedStores([]);
        setOrdering("");
    };

    const toggleMenu = (event: MouseEvent, gameId: number) => {
        event.stopPropagation();
        event.preventDefault();
        setOpenMenuId((current) => (current === gameId ? null : gameId));
    };

    return (
        <div className="min-h-screen bg-[#151515] text-white pt-28">
            <main className="px-4 md:px-8 lg:px-12 pb-12">
                <section className="mb-6 p-4 md:p-5">
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">Mi wishlist</h1>
                    <p className="text-sm text-gray-400 mb-4">
                        Juegos guardados en este navegador (máximo 20).
                    </p>

                    {!loading && games.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 items-start justify-items-stretch">
                            <div className="md:col-span-3 p-1">
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Buscar por nombre..."
                                    className="w-full bg-transparent border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#ff4200]"
                                />
                            </div>

                            <div className="md:col-span-2 p-1">
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

                            <div className="md:col-span-2 p-1">
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

                            <div className="md:col-span-2 p-1">
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
                                <Dropdown
                                    value={ordering}
                                    onChange={(event) => setOrdering((event.value as string) ?? "")}
                                    options={[{ label: "Orden por defecto", value: "" }, ...ORDERING_OPTIONS]}
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Ordenar"
                                    className="w-full text-xs"
                                    panelClassName="bg-[#151515] text-white"
                                />
                            </div>
                        </div>
                    )}

                    {!loading && games.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-2 px-1">
                            <Button type="button" label="Limpiar filtros" onClick={handleClearFilters} outlined />
                            <span className="text-xs text-gray-400">{filteredGames.length} de {games.length} guardados</span>
                        </div>
                    )}
                </section>

                <section>
                    {loading && (
                        <div className="grid grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(500px,500px))] gap-4 justify-center justify-items-center py-2">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <GameCardSkeleton
                                    key={`wishlist-skeleton-${index}`}
                                    className="w-full max-w-70 lg:w-125 lg:max-w-125"
                                />
                            ))}
                        </div>
                    )}

                    {!loading && games.length === 0 && (
                        <div className="rounded-lg border border-gray-700 bg-black/20 p-4 text-gray-300 text-sm">
                            Todavía no has guardado ningún juego. Usa el ícono de corazón en las cards para añadirlos aquí.
                        </div>
                    )}

                    {!loading && games.length > 0 && filteredGames.length === 0 && (
                        <div className="rounded-lg border border-gray-700 bg-black/20 p-4 text-gray-300 text-sm">
                            Ningún juego guardado coincide con esos filtros.
                        </div>
                    )}

                    {!loading && filteredGames.length > 0 && (
                        <div className="grid grid-cols-2 lg:[grid-template-columns:repeat(auto-fit,minmax(500px,500px))] gap-4 justify-center justify-items-center">
                            {filteredGames.map((game) => (
                                <GameCard
                                    key={game.id}
                                    game={game}
                                    openMenuId={openMenuId}
                                    toggleMenu={toggleMenu}
                                    className="w-full max-w-[280px] lg:w-[500px] lg:max-w-[500px]"
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
}
