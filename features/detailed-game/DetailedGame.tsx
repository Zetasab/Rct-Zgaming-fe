"use client";
import { useEffect, useRef, useState, MouseEvent } from 'react';
import { Game, Movie } from '@/models/Game';
import { gameService } from '@/services/GameService';
import Image from 'next/image';
import 'primeicons/primeicons.css';
import { useRouter } from 'next/navigation';
import GameCarousel, { GameCard, GameCardSkeleton } from '@/components/game-carousel/GameCarousel';
import { Skeleton } from 'primereact/skeleton';

const getRatingColor = (title: string) => {
    switch (title.toLowerCase()) {
        case 'exceptional': return 'bg-green-500';
        case 'recommended': return 'bg-blue-500';
        case 'meh': return 'bg-orange-500';
        case 'skip': return 'bg-red-500';
        default: return 'bg-gray-500';
    }
};

interface Props {
    gameSlug: string;
}

export default function DetailedGame({ gameSlug }: Props) {
    const [game, setGame] = useState<Game | null>(null);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [seriesGames, setSeriesGames] = useState<Game[]>([]);
    const [suggestedGames, setSuggestedGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [scrollY, setScrollY] = useState(0);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const galleryScreenshots = game?.short_screenshots || [];
    const router = useRouter();

    const handleGameClick = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        const href = (event.currentTarget as HTMLAnchorElement).getAttribute('href');
        if (href) {
            router.push(href);
        }
    };

    const toggleMenu = (e: MouseEvent, id: number) => {
        e.stopPropagation();
        e.preventDefault();
        setOpenMenuId(openMenuId === id ? null : id);
    };

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (ticking) return;
            ticking = true;

            requestAnimationFrame(() => {
                setScrollY(window.scrollY);
                ticking = false;
            });
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const loadGame = async () => {
            try {
                // Critical data
                const gameData = await gameService.getGameBySlug(gameSlug);
                setGame(gameData);

                // Secondary data (optional)
                const [moviesData, seriesData, suggestedData] = await Promise.all([
                    gameService.getGameMovies(gameData.id).catch(() => ({ results: [] })),
                    gameService.getGameSeries(gameData.id).catch(() => ({ results: [] })),
                    gameService.getGameSuggested(gameData.id).catch(() => ({ results: [] }))
                ]);
                
                setMovies(moviesData?.results || []);
                setSeriesGames(seriesData?.results || []);
                setSuggestedGames(suggestedData?.results || []);
            } catch (error) {
                console.error("Error loading game data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadGame();
    }, [gameSlug]);

    if (loading) return (
        <div className="min-h-screen bg-[#151515] text-white pt-10">
            <div className="relative h-[60vh] w-full overflow-hidden border-b border-gray-800">
                <Skeleton width="100%" height="100%" borderRadius="0" className="bg-gray-800/70!" />
            </div>

            <div className="container mx-auto px-4 md:px-16 py-8 grid md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-4">
                    <Skeleton width="40%" height="2rem" className="bg-gray-700/80!" />
                    <Skeleton width="100%" height="1rem" className="bg-gray-700/80!" />
                    <Skeleton width="95%" height="1rem" className="bg-gray-700/80!" />
                    <Skeleton width="88%" height="1rem" className="bg-gray-700/80!" />
                    <Skeleton width="100%" height="260px" className="bg-gray-800/70!" />
                </div>
                <div className="space-y-3">
                    <Skeleton width="70%" height="1.4rem" className="bg-gray-700/80!" />
                    <Skeleton width="100%" height="220px" className="bg-gray-800/70!" />
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-16 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={`detailed-series-skeleton-${index}`} className="flex justify-center">
                            <GameCardSkeleton className="w-full" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-4 mb-16">
                <GameCarousel title="Juegos Recomendados" games={[]} loading skeletonCount={6} />
            </div>
        </div>
    );
    if (!game) return <div className="flex justify-center items-center h-screen text-white bg-[#151515]">Game not found</div>;

    return (
        <div className="min-h-screen bg-[#151515] text-white">
            {/* Header / Hero Section */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <div 
                    className="absolute inset-0 w-full h-full"
                    style={{ transform: `translateY(${scrollY * 0.5}px)` }}
                >
                    {game.background_image && (
                         <Image
                            src={game.background_image}
                            alt={game.name}
                            fill
                            className="object-cover opacity-40"
                            priority
                                     sizes="100vw"
                                     quality={70}
                        />
                    )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/50 to-transparent" />
                
                <div className="ml-10 absolute bottom-0 left-0 p-8 md:p-16 container mx-auto z-10">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                    >
                        <i className="pi pi-arrow-left"></i> Back
                    </button>
                    <h1 className="text-4xl md:text-7xl font-bold mb-4 drop-shadow-xl">{game.name}</h1>
                    <div className="mb-6">
                        <div className="flex flex-wrap gap-4 items-center">
                            <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded text-sm uppercase tracking-wide">
                                {game.released}
                            </span>
                            <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded text-sm uppercase tracking-wide flex items-center gap-1">
                                <i className="pi pi-star-fill text-yellow-500"></i> {game.rating}
                            </span>
                            {game.metacritic && (
                                <span className="bg-green-900/30 border border-green-500 text-green-500 px-3 py-1 rounded text-sm font-bold">
                                    {game.metacritic}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 md:px-16 py-8 grid md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-[#ff4200]">About</h2>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-line text-lg">
                            {(() => {
                                const description = game.description_raw || game.description?.replace(/<[^>]*>?/gm, '') || "No description available.";
                                const shouldTruncate = description.length > 500;
                                
                                return (
                                    <>
                                        <p>
                                            {shouldTruncate && !isDescriptionExpanded 
                                                ? `${description.slice(0, 500)}...` 
                                                : description}
                                        </p>
                                        {shouldTruncate && (
                                            <button 
                                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                                className="mt-2 text-[#ff4200] hover:text-[#ff6a33] font-semibold text-sm flex items-center gap-2 transition-colors uppercase tracking-wide"
                                            >
                                                {isDescriptionExpanded ? 'Show Less' : 'Read More'}
                                                <i className={`pi ${isDescriptionExpanded ? 'pi-chevron-up' : 'pi-chevron-down'}`}></i>
                                            </button>
                                        )}
                                    </>
                                );
                            })()}
                        
                        </div>
                    </section>

                    {/* Trailer Section */}
                    {movies && movies.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4 text-[#ff4200]">Trailer</h2>
                            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden shadow-lg border border-gray-800">
                                <video 
                                    src={movies[0].data.max} 
                                    poster={movies[0].preview} 
                                    controls 
                                    className="w-full h-full object-cover"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </section>
                    )}

                    {/* Screenshot Gallery */}
                    {galleryScreenshots.length > 0 && (
                         <section>
                            <h2 className="text-2xl font-bold mb-4 text-[#ff4200]">Gallery</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {galleryScreenshots.map((s, index) => (
                                    <div 
                                        key={s.id} 
                                        className="relative aspect-video cursor-pointer rounded-lg overflow-hidden group border border-transparent hover:border-[#ff4200]"
                                        onClick={() => setSelectedImageIndex(index)}
                                    >
                                        <Image
                                            src={s.image}
                                            alt={`Screenshot ${index + 1}`}
                                            fill
                                            className="object-cover transition-[transform,filter] duration-300 ease-in-out group-hover:scale-[1.02] group-hover:brightness-110"
                                            sizes="(max-width: 768px) 50vw, 33vw"
                                            quality={65}
                                        />
                                    </div>
                                ))}
                            </div>
                         </section>
                    )}

                    {game.platforms && game.platforms.length > 0 && (
                        <section>
                            <h3 className="text-xl font-bold mb-4">Platforms</h3>
                            <div className="flex flex-wrap gap-3">
                                {game.platforms.map(p => (
                                    <span key={p.platform.id} className="text-sm text-gray-300 bg-[#272727] px-4 py-2 rounded-full border border-gray-700">
                                        {p.platform.name}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                    
                    {game.tags && game.tags.length > 0 && (
                        <section>
                            <h3 className="text-xl font-bold mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {game.tags.slice(0, 10).map(t => (
                                    <span key={t.id} className="text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-default">
                                        #{t.name}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="bg-[#202020] p-6 rounded-xl border border-gray-800 sticky top-4">
                        <h3 className="text-gray-500 text-sm uppercase mb-4 tracking-wider font-semibold">Game Info</h3>
                        <div className="space-y-6">
                            <div>
                                <span className="block text-gray-500 text-xs uppercase mb-1">Genres</span>
                                <div className="flex flex-wrap gap-2">
                                    {game.genres?.map(g => (
                                        <span key={g.id} className="text-white hover:text-[#ff4200] transition-colors cursor-pointer text-sm underline underline-offset-4">
                                            {g.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            
                            <div>
                                <span className="block text-gray-500 text-xs uppercase mb-1">Release Date</span>
                                <div className="text-white text-sm">{game.released}</div>
                            </div>

                            {game.website && (
                                <a 
                                    href={game.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full text-center bg-[#ff4200] hover:bg-[#e65100] text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02]"
                                >
                                    Visit Website <i className="pi pi-external-link text-xs"></i>
                                </a>
                            )}
                        </div>
                    </div>

                    {game.ratings && game.ratings.length > 0 && (
                        <div className="bg-[#202020] p-6 rounded-xl border border-gray-800">
                             <h3 className="text-gray-500 text-sm uppercase mb-4 tracking-wider font-semibold">Ratings</h3>
                             <div className="space-y-4">
                                {game.ratings.map(r => (
                                    <div key={r.id}>
                                        <div className="flex justify-between text-xs uppercase font-bold mb-1">
                                            <span className="text-gray-300">{r.title}</span>
                                            <span className="text-gray-500">{r.count}</span>
                                        </div>
                                        <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${getRatingColor(r.title)}`}
                                                style={{ width: `${r.percent}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Separator Section */}
            <div className="relative w-full h-[400px] mt-24 overflow-hidden">
                <div className="absolute inset-0 w-full h-full">
                    {game.background_image && (
                        <Image
                            src={game.background_image}
                            alt="Section Separator"
                            fill
                            className="object-cover blur-[2px] opacity-20"
                            sizes="100vw"
                            quality={60}
                        />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#151515] via-transparent to-[#151515]"></div>
                </div>
            </div>
            {/* Games in Series */}
            {seriesGames && seriesGames.length > 0 && (
                <div className="container mx-auto px-4 md:px-16 py-12">
                    <h2 className="text-3xl font-bold mb-8">Juegos de la saga</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {seriesGames.map(game => (
                            <div key={game.id} className="flex justify-center">
                                <GameCard 
                                    game={game} 
                                    openMenuId={openMenuId}
                                    toggleMenu={toggleMenu}
                                    onGameLinkClick={handleGameClick}
                                    className="w-full"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Related Games (Horizontal Scroll) */}
            {suggestedGames && suggestedGames.length > 0 && (
                 <div className="mt-8 mb-16">
                    <GameCarousel title="Juegos Recomendados" games={suggestedGames} />
                 </div>
            )}
            
            {/* Game Specific Footer */}
            <footer className="border-t border-gray-800 bg-[#1a1a1a] py-12">
                <div className="container mx-auto px-4 md:px-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        {/* Column 1: Rating & Playtime */}
                        <div>
                            <h4 className="text-white font-bold text-lg mb-4 border-b border-[#ff4200] w-fit pb-1">Datos Principales</h4>
                            <ul className="space-y-3 text-sm text-gray-400">
                                {game.esrb_rating && (
                                    <li className="flex justify-between items-center">
                                        <span>Clasificación ESRB:</span>
                                        <span className="text-white font-medium">{game.esrb_rating.name}</span>
                                    </li>
                                )}
                                {game.playtime > 0 && (
                                    <li className="flex justify-between items-center">
                                        <span>Tiempo de juego:</span>
                                        <span className="text-white font-medium">{game.playtime} horas</span>
                                    </li>
                                )}
                                <li className="flex justify-between items-center">
                                    <span>Lanzamiento:</span>
                                    <span className="text-white font-medium">{game.released}</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span>Actualizado:</span>
                                    <span className="text-white font-medium">{new Date(game.updated).toLocaleDateString()}</span>
                                </li>
                            </ul>
                        </div>

                        {/* Column 2: Where to Buy */}
                        {game.stores && game.stores.length > 0 && (
                            <div>
                                <h4 className="text-white font-bold text-lg mb-4 border-b border-[#ff4200] w-fit pb-1">Tiendas</h4>
                                <ul className="space-y-2">
                                    {game.stores.map(store => (
                                        <li key={store.id}>
                                            <a 
                                                href={`https://${store.store.domain}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-gray-400 hover:text-[#ff4200] transition-colors text-sm flex items-center gap-2 group"
                                            >
                                                <i className="pi pi-shopping-cart group-hover:translate-x-1 transition-transform"></i>
                                                {store.store.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Column 3: Stats */}
                        <div>
                            <h4 className="text-white font-bold text-lg mb-4 border-b border-[#ff4200] w-fit pb-1">Comunidad</h4>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li className="flex justify-between items-center">
                                    <span>Valoraciones:</span>
                                    <span className="text-white font-medium">{game.ratings_count}</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span>Reseñas:</span>
                                    <span className="text-white font-medium">{game.reviews_count}</span>
                                </li>
                                <li className="flex justify-between items-center">
                                    <span>Sugerencias:</span>
                                    <span className="text-white font-medium">{game.suggestions_count}</span>
                                </li>
                            </ul>
                        </div>

                         {/* Column 4: Links */}
                         <div>
                            <h4 className="text-white font-bold text-lg mb-4 border-b border-[#ff4200] w-fit pb-1">Enlaces</h4>
                            <ul className="space-y-2">
                                {game.website && (
                                    <li>
                                        <a 
                                            href={game.website} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-[#ff4200] transition-colors text-sm flex items-center gap-2"
                                        >
                                            <i className="pi pi-globe"></i> Sitio Oficial
                                        </a>
                                    </li>
                                )}
                                {game.metacritic && (
                                    <li>
                                        <a 
                                            href={`https://www.metacritic.com/game/${game.slug}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-gray-400 hover:text-[#ff4200] transition-colors text-sm flex items-center gap-2"
                                        >
                                            <span className="bg-[#ff4200] text-white text-[10px] px-1 rounded font-bold">M</span> Metacritic
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                     <div className="text-center text-gray-600 text-xs pt-8 border-t border-gray-800">
                        <p>{game.name} © {new Date(game.released).getFullYear()}. All rights reserved.</p>
                        <p className="mt-1">Data provided by RAWG Video Games Database</p>
                    </div>
                </div>
            </footer>

            {/* Lightbox Modal */}
            {selectedImageIndex !== null && (
                <div 
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10"
                    onClick={() => setSelectedImageIndex(null)}
                >
                    <button 
                        className="absolute top-4 right-4 text-white hover:text-[#ff4200] text-4xl z-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex(null);
                        }}
                    >
                        &times;
                    </button>
                    
                    <button
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-4 text-white hover:text-[#ff4200] text-4xl bg-black/50 hover:bg-black/80 rounded-full transition-colors z-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : galleryScreenshots.length - 1));
                        }}
                    >
                         <i className="pi pi-chevron-left"></i>
                    </button>

                    <div className="relative w-full h-full max-w-7xl max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={galleryScreenshots[selectedImageIndex].image}
                            alt="Full screen screenshot"
                            fill
                            className="object-contain"
                            priority
                            sizes="90vw"
                            quality={80}
                        />
                         <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm bg-black/50 py-2 rounded-full w-fit mx-auto px-6">
                            {selectedImageIndex + 1} / {galleryScreenshots.length}
                        </div>
                    </div>

                    <button
                         className="absolute right-4 top-1/2 -translate-y-1/2 p-4 text-white hover:text-[#ff4200] text-4xl bg-black/50 hover:bg-black/80 rounded-full transition-colors z-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIndex((prev) => (prev !== null && prev < galleryScreenshots.length - 1 ? prev + 1 : 0));
                        }}
                    >
                        <i className="pi pi-chevron-right"></i>
                    </button>
                </div>
            )}
        </div>
    );
}
