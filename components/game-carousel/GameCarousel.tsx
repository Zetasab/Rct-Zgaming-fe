"use client";

import { useRef, useState, useEffect, MouseEvent, PointerEvent, DragEvent, memo, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Game } from '@/models/Game';
import { Skeleton } from 'primereact/skeleton';
import { getGameDetailHref } from '@/services/game-detail-route';
import { isGameWishlisted, toggleWishlist, WISHLIST_CHANGE_EVENT, WISHLIST_MAX_ITEMS } from '@/services/wishlist';
import { showToast } from '@/components/ToastProvider';

interface GameCarouselProps {
    title: string;
    games: Game[];
    showTitle?: boolean;
    loading?: boolean;
    skeletonCount?: number;
    cardClassName?: string;
    cardMediaClassName?: string;
}

export function GameCardSkeleton({
    className,
    mediaClassName,
}: {
    className?: string;
    mediaClassName?: string;
}) {
    return (
        <div className={`flex-none ${className || 'w-70 md:w-112.5'} bg-[#272727] rounded-xl overflow-hidden border border-gray-800 shadow-lg`}>
            <div className={`relative ${mediaClassName || 'h-40 md:h-62.5'} w-full bg-gray-900`}>
                <Skeleton width="100%" height="100%" borderRadius="0" className="bg-gray-800/80!" />
            </div>
            <div className="p-3 space-y-2">
                <Skeleton width="35%" height="0.9rem" className="bg-gray-700/80!" />
                <Skeleton width="85%" height="1.1rem" className="bg-gray-700/80!" />
            </div>
        </div>
    );
}

export const GameCard = memo(({
    game,
    openMenuId,
    toggleMenu,
    onGameLinkClick,
    className,
    isPriority = false,
    onLongPress,
    mediaClassName,
    mobileExtraActions,
    desktopHoverActions,
    hoverTitleMeta,
}: {
    game: Game;
    openMenuId: number | null;
    toggleMenu: (e: MouseEvent, id: number) => void;
    onGameLinkClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
    className?: string;
    isPriority?: boolean;
    onLongPress?: (game: Game) => void;
    mediaClassName?: string;
    mobileExtraActions?: ReactNode;
    desktopHoverActions?: ReactNode;
    hoverTitleMeta?: ReactNode;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [slideshowActive, setSlideshowActive] = useState(false);
    const [currentShotIndex, setCurrentShotIndex] = useState(0);
    const [fadeOp, setFadeOp] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const longPressTriggeredRef = useRef(false);

    useEffect(() => {
        return () => {
            if (longPressTimeoutRef.current) {
                clearTimeout(longPressTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        setIsWishlisted(isGameWishlisted(game.id));

        const handleWishlistChange = () => {
            setIsWishlisted(isGameWishlisted(game.id));
        };

        window.addEventListener(WISHLIST_CHANGE_EVENT, handleWishlistChange);
        return () => {
            window.removeEventListener(WISHLIST_CHANGE_EVENT, handleWishlistChange);
        };
    }, [game.id]);

    const handleWishlistClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();

        const result = toggleWishlist({
            id: game.id,
            slug: game.slug,
            name: game.name,
            background_image: game.background_image,
        });

        if (result === 'limit-reached') {
            showToast({
                severity: 'error',
                summary: 'Wishlist llena',
                detail: `El máximo de juegos guardados es ${WISHLIST_MAX_ITEMS}.`,
            });
        }
    };

    const clearLongPressTimer = () => {
        if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
            longPressTimeoutRef.current = null;
        }
    };

    const startLongPress = (event: PointerEvent<HTMLDivElement>) => {
        if (!onLongPress) {
            return;
        }

        const target = event.target as HTMLElement;
        if (target.closest('button')) {
            return;
        }

        clearLongPressTimer();
        longPressTriggeredRef.current = false;
        longPressTimeoutRef.current = setTimeout(() => {
            longPressTriggeredRef.current = true;
            onLongPress(game);
        }, 650);
    };

    const stopLongPress = () => {
        clearLongPressTimer();
    };

    const handleLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (longPressTriggeredRef.current) {
            event.preventDefault();
            event.stopPropagation();
            longPressTriggeredRef.current = false;
            return;
        }

        onGameLinkClick?.(event);
    };

    const handleLinkDragStart = (event: DragEvent<HTMLAnchorElement>) => {
        event.preventDefault();
    };

    const handleLinkContextMenu = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
    };

    // Initial 1s delay before starting slideshow
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isHovered) {
            timer = setTimeout(() => {
                setSlideshowActive(true);
                // Immediately advance to next slide so we don't show the same static image
                setCurrentShotIndex(prev => (prev + 1) % (game.short_screenshots?.length || 1));
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [isHovered, game.short_screenshots]);

    // Cycling through screenshots
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (slideshowActive && game.short_screenshots && game.short_screenshots.length > 0) {
            interval = setInterval(() => {
                setFadeOp(0); // Fade out
                setTimeout(() => {
                    setCurrentShotIndex((prev) => (prev + 1) % game.short_screenshots!.length);
                    setFadeOp(1); // Fade in
                }, 200); // Wait for fade out
            }, 1000); // New image every 1 second
        }
        return () => clearInterval(interval);
    }, [slideshowActive, game.short_screenshots]);

    const activeImage = slideshowActive && game.short_screenshots?.length
        ? game.short_screenshots[currentShotIndex].image
        : (game.background_image || '/placeholder.jpg');
    const gameHref = getGameDetailHref(game);
    const hasMobileMenu = Boolean(mobileExtraActions);

    return (
        <div
            className={`flex-none ${className || 'w-[280px] md:w-[450px]'} bg-[#272727] rounded-xl overflow-visible md:overflow-hidden group transition-colors duration-300 shadow-lg relative md:hover:z-30 ${isPriority ? 'border-2 border-yellow-400' : 'border border-transparent hover:border-gray-700'} cursor-pointer`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setSlideshowActive(false);
                setCurrentShotIndex(0);
                setFadeOp(1);
            }}
            onPointerDown={startLongPress}
            onPointerUp={stopLongPress}
            onPointerLeave={stopLongPress}
            onPointerCancel={stopLongPress}
        >
        <Link
            href={gameHref}
            className="absolute inset-0 z-[25]"
            aria-label={`Ver ${game.name}`}
            onClick={handleLinkClick}
            onDragStart={handleLinkDragStart}
            onContextMenu={handleLinkContextMenu}
            draggable={false}
            style={{
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none',
            }}
        />
        <div className={`relative ${mediaClassName || 'h-[160px] md:h-[250px]'} w-full bg-gray-900`}>
            {/* Base Image (Static) - Always visible underneath to prevent flashing */}
            <Image
                src={game.background_image || '/placeholder.jpg'}
                alt={game.name}
                fill
                className="object-cover z-0 transition-[opacity,transform] duration-300 ease-in-out group-hover:scale-[1.05]"
                style={{ opacity: slideshowActive ? 0 : 1, transition: '0.2s ease-in-out' }}
                draggable={false}
                sizes="(max-width: 768px) 280px, 450px"
                quality={70}
            />

            {/* Slideshow Image (Overlay) - Only visible when active */}
            {slideshowActive && (
                <Image
                    src={activeImage}
                    alt={`${game.name} screenshot`}
                    fill
                    className="object-cover z-10 transition-[opacity,transform] duration-300 ease-in-out group-hover:scale-[1.05]"
                    draggable={false}
                    style={{ opacity: fadeOp }}
                    sizes="(max-width: 768px) 280px, 450px"
                    quality={65}
                />
            )}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500 ease-out z-10"></div>

            {/* Top Right Actions */}
            <div className="absolute top-2 right-2 z-30 flex items-center gap-2">
                {/* Desktop Actions (Hover) */}
                {desktopHoverActions && (
                    <div className="hidden md:flex items-center gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                        {desktopHoverActions}
                    </div>
                )}

                {/* Mobile Actions (Menu) */}
                {hasMobileMenu && (
                    <div className="md:hidden relative z-[60]">
                    <button
                        className="relative z-[61] w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:scale-105 active:bg-neutral-700 cursor-pointer"
                        onClick={(e) => toggleMenu(e, game.id)}
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <i className="pi pi-ellipsis-v text-xs"></i>
                    </button>

                    {openMenuId === game.id && (
                        <div
                            className="absolute right-0 max-w-[150px] top-full mt-2 bg-[#1a1a1a] border-gray-700 shadow-xl rounded-lg overflow-hidden flex flex-col min-w-[140px] z-[80] animate-in fade-in zoom-in-95 duration-200 "
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {mobileExtraActions}
                        </div>
                    )}
                    </div>
                )}

                {/* Wishlist */}
                <button
                    type="button"
                    className="relative z-[61] w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-sm transition-all hover:scale-105 active:bg-neutral-700 cursor-pointer"
                    onClick={handleWishlistClick}
                    onMouseDown={(e) => e.stopPropagation()}
                    aria-label={isWishlisted ? 'Quitar de la wishlist' : 'Añadir a la wishlist'}
                    aria-pressed={isWishlisted}
                >
                    <i className={`pi ${isWishlisted ? 'pi-heart-fill text-red-500' : 'pi-heart'} text-xs`}></i>
                </button>
            </div>

            {/* Rating Badge */}
            <div className="absolute top-3 left-0 bg-[#333]/80 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-r shadow-md z-20 flex items-center gap-1">
                <i className="pi pi-star-fill text-yellow-500 text-[10px]"></i>
                {game.rating}
            </div>

            {/* Content at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-3 z-30 pointer-events-none">
                <div className="flex justify-between items-end mb-1">
                    <div className="text-[10px] text-gray-400 font-mono bg-black/30 px-1 rounded">
                        {game.released ? new Date(game.released).toLocaleDateString() : 'N/A'}
                    </div>
                </div>
                {hoverTitleMeta ? (
                    <div className="hidden md:flex pointer-events-auto items-center mb-1 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        {hoverTitleMeta}
                    </div>
                ) : null}
                <h3 className="text-sm md:text-lg font-bold text-white leading-tight truncate shadow-black drop-shadow-md" title={game.name}>
                    {game.name}
                </h3>
            </div>
        </div>
    </div>
    );
});

GameCard.displayName = 'GameCard';

export default function GameCarousel({
    title,
    games,
    showTitle = true,
    loading = false,
    skeletonCount = 6,
    cardClassName,
    cardMediaClassName,
}: GameCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const hasDragged = useRef(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);

    const toggleMenu = (e: MouseEvent, gameId: number) => {
        e.stopPropagation();
        e.preventDefault(); // Prevent drag start
        setOpenMenuId(openMenuId === gameId ? null : gameId);
    };

    const handleGameLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (hasDragged.current) {
            event.preventDefault();
        }
    };

    const handleMouseDown = (e: MouseEvent) => {
        if (!scrollContainerRef.current) return;
        // Don't start drag if clicking a button/interactive element
        if ((e.target as HTMLElement).closest('button')) return;

        hasDragged.current = false;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();

        hasDragged.current = true;

        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    return (
        <div className="py-8 select-none">
            {showTitle && (
                <h2 className="text-2xl font-bold mb-4 px-4 md:px-8 text-white flex items-center gap-3">
                    <span className="w-1 h-8 bg-[#ff4200] rounded-full"></span>
                    {title}
                </h2>
            )}
            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-4 px-4 md:px-12 py-8 cursor-grab active:cursor-grabbing hide-scrollbar"
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                {loading
                    ? Array.from({ length: skeletonCount }).map((_, index) => (
                        <GameCardSkeleton key={`game-card-skeleton-${title}-${index}`} />
                    ))
                    : games.map((game) => {
                    return (
                        <GameCard
                            key={game.id}
                            game={game}
                            openMenuId={openMenuId}
                            toggleMenu={toggleMenu}
                            onGameLinkClick={handleGameLinkClick}
                            className={cardClassName}
                            mediaClassName={cardMediaClassName}
                        />
                    );
                })}
            </div>

            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
