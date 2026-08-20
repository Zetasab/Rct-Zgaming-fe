'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar } from 'primereact/sidebar';
import Image from 'next/image';
import { gameService } from '@/services/GameService';
import { Game } from '@/models/Game';
import { getGameDetailHref } from '@/services/game-detail-route';
import { getWishlist, WISHLIST_CHANGE_EVENT, WishlistItem } from '@/services/wishlist';

type MegaMenuKey = 'games' | 'genres' | 'platforms' | 'stores' | 'wishlist';

const SEARCH_NAV_LINKS: Array<{ href: string; label: string; icon: string; menuKey: MegaMenuKey }> = [
    { href: '/search', label: 'Juegos', icon: 'pi-search', menuKey: 'games' },
    { href: '/searchGenres', label: 'Generos', icon: 'pi-tags', menuKey: 'genres' },
    { href: '/searchPlatforms', label: 'Plataformas', icon: 'pi-desktop', menuKey: 'platforms' },
    { href: '/searchStores', label: 'Stores', icon: 'pi-shopping-bag', menuKey: 'stores' },
];

const WISHLIST_NAV_LINK = { href: '/wishlist', label: 'My Wishlist', icon: 'pi-heart', menuKey: 'wishlist' as const };

const MEGA_MENU_CARD_LIMIT = 6;

interface MegaMenuCard {
    id: number | string;
    name: string;
    image: string;
    meta?: string;
    href: string;
}

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeMegaMenu, setActiveMegaMenu] = useState<MegaMenuKey | null>(null);
    const [trendingGames, setTrendingGames] = useState<Game[]>([]);
    const [genresPreview, setGenresPreview] = useState<MegaMenuCard[]>([]);
    const [platformsPreview, setPlatformsPreview] = useState<MegaMenuCard[]>([]);
    const [storesPreview, setStoresPreview] = useState<MegaMenuCard[]>([]);
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

    const isRouteActive = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }

        if (href === '/search') {
            return pathname === '/search' || pathname.startsWith('/search/');
        }

        return pathname === href || pathname.startsWith(`${href}/`);
    };

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 20;
            setScrolled((prev) => (prev === isScrolled ? prev : isScrolled));
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        let mounted = true;

        const loadMegaMenuData = async () => {
            try {
                const [gamesResult, catalogModule] = await Promise.all([
                    gameService.searchGames({ ordering: '-added', pageSize: MEGA_MENU_CARD_LIMIT }),
                    import('@/app/static/catalog-data'),
                ]);

                if (!mounted) return;

                setTrendingGames(Array.isArray(gamesResult?.items) ? gamesResult.items : []);

                setGenresPreview(
                    catalogModule.genresCatalog.slice(0, MEGA_MENU_CARD_LIMIT).map((genre) => ({
                        id: genre.id,
                        name: genre.name,
                        image: genre.image_background,
                        meta: `${genre.games_count.toLocaleString()} juegos`,
                        href: `/search?genres=${encodeURIComponent(genre.slug)}`,
                    }))
                );

                setPlatformsPreview(
                    catalogModule.platformsCatalog.slice(0, MEGA_MENU_CARD_LIMIT).map((platform) => ({
                        id: platform.id,
                        name: platform.name,
                        image: platform.image_background,
                        meta: `${platform.games_count.toLocaleString()} juegos`,
                        href: `/search?platforms=${encodeURIComponent(platform.slug)}`,
                    }))
                );

                setStoresPreview(
                    catalogModule.storesCatalog.slice(0, MEGA_MENU_CARD_LIMIT).map((store) => ({
                        id: store.id,
                        name: store.name,
                        image: store.image_background,
                        meta: `${store.games_count.toLocaleString()} juegos`,
                        href: `/search?stores=${encodeURIComponent(store.slug)}`,
                    }))
                );
            } catch {
                if (mounted) {
                    setTrendingGames([]);
                }
            }
        };

        void loadMegaMenuData();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        const refreshWishlist = () => setWishlistItems(getWishlist());
        refreshWishlist();

        window.addEventListener(WISHLIST_CHANGE_EVENT, refreshWishlist);
        return () => window.removeEventListener(WISHLIST_CHANGE_EVENT, refreshWishlist);
    }, []);

    const megaMenuCards = useMemo<Record<MegaMenuKey, MegaMenuCard[]>>(() => ({
        games: trendingGames.slice(0, MEGA_MENU_CARD_LIMIT).map((game) => ({
            id: game.id,
            name: game.name,
            image: game.background_image,
            meta: `⭐ ${game.rating}`,
            href: getGameDetailHref(game),
        })),
        genres: genresPreview,
        platforms: platformsPreview,
        stores: storesPreview,
        wishlist: wishlistItems.slice(0, MEGA_MENU_CARD_LIMIT).map((item) => ({
            id: item.id,
            name: item.name,
            image: item.background_image,
            href: getGameDetailHref(item),
        })),
    }), [trendingGames, genresPreview, platformsPreview, storesPreview, wishlistItems]);

    const megaMenuLinks = [...SEARCH_NAV_LINKS, WISHLIST_NAV_LINK];
    const activeMegaMenuLink = megaMenuLinks.find((item) => item.menuKey === activeMegaMenu);
    const activeCards = activeMegaMenu ? megaMenuCards[activeMegaMenu] : [];

    return (
        <>
            <nav
                style={{ background: scrolled ? 'rgba(0, 0, 0, 0.6)' : 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, transparent 100%)' }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                        ? 'h-14 md:h-16 shadow-lg backdrop-blur-sm'
                        : 'h-20 md:h-24 bg-transparent backdrop-blur-none'
                    }`}
            >
                <div className="mx-auto h-full flex items-center justify-between px-6">
                    {/* Logo Area */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className={`relative transition-all duration-500 ease-out transform group-hover:scale-110 group-hover:rotate-3 group-hover:drop-shadow-[0_0_15px_rgba(255,66,0,0.5)] ${scrolled ? 'w-12 h-12' : 'w-20 h-20'}`}>
                            {/* Usamos Next Image con unoptimized para asegurar que cargue en todos los entornos si hay problemas de optimización */}
                            <Image
                                src="/Logo.png"
                                alt="Logo"
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className="object-contain"
                                priority
                                unoptimized
                            />
                        </div>
                        <span className="text-primary-500 text-xl tracking-tight transition-colors duration-300" style={{ fontFamily: 'var(--font-press-start-2p)', textShadow: '2px 2px 0px #8B2500' }}>
                            Zgaming
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div
                        className="hidden md:flex items-center gap-1 relative"
                        onMouseLeave={() => setActiveMegaMenu(null)}
                    >
                        <Link
                            key="Inicio"
                            href="/"
                            style={{ fontFamily: 'var(--font-press-start-2p)' }}
                            onMouseEnter={() => setActiveMegaMenu(null)}
                            className={`relative transition-colors font-bold text-[10px] uppercase tracking-wider group py-2 px-3 rounded-md border flex items-center gap-2 ${isRouteActive('/') ? 'text-white bg-primary-500/25 border-primary-500/60 shadow-[0_0_14px_rgba(255,66,0,0.45)]' : 'text-gray-300 hover:text-white border-transparent hover:bg-white/5'}`}
                        >
                            <i className={`pi pi-home text-white text-lg transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] ${isRouteActive('/') ? 'scale-125 text-primary-400 drop-shadow-[0_0_12px_rgba(255,66,0,0.9)]' : ''}`}></i>
                            <span>Inicio</span>
                            <span className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(255,66,0,0.6)] ${isRouteActive('/') ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}`}></span>
                        </Link>
                        {megaMenuLinks.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                style={{ fontFamily: 'var(--font-press-start-2p)' }}
                                onMouseEnter={() => setActiveMegaMenu(item.menuKey)}
                                className={`relative transition-colors font-bold text-[10px] uppercase tracking-wider group py-2 px-3 rounded-md border flex items-center gap-2 ${isRouteActive(item.href) ? 'text-white bg-primary-500/25 border-primary-500/60 shadow-[0_0_14px_rgba(255,66,0,0.45)]' : 'text-gray-300 hover:text-white border-transparent hover:bg-white/5'}`}
                            >
                                <i className={`pi ${item.icon} text-white text-lg transition-all duration-300 group-hover:scale-125 group-hover:rotate-12 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] ${isRouteActive(item.href) ? 'scale-125 text-primary-400 drop-shadow-[0_0_12px_rgba(255,66,0,0.9)]' : ''}`}></i>
                                <span>{item.label}</span>
                                <span className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(255,66,0,0.6)] ${isRouteActive(item.href) ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-100'}`}></span>
                            </Link>
                        ))}

                        {activeMegaMenu && activeMegaMenuLink && (
                            <div className="absolute left-0 right-0 top-full pt-3 z-[70] animate-in fade-in slide-in-from-top-8 duration-300 ease-out">
                                <div className="rounded-xl border border-white/10 bg-black/95 backdrop-blur-md p-7 min-h-[280px] shadow-[0_20px_45px_rgba(0,0,0,0.55)]">
                                    {activeCards.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-4">
                                            {activeCards.map((card) => (
                                                <Link
                                                    key={card.id}
                                                    href={card.href}
                                                    className="group/card relative overflow-hidden rounded-lg border border-gray-800 hover:border-primary-500/60 transition-colors h-44"
                                                >
                                                    <div
                                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover/card:scale-105"
                                                        style={{ backgroundImage: `url(${card.image || '/placeholder.jpg'})` }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                                                    <div className="relative z-10 h-full flex flex-col justify-end p-3">
                                                        <p className="text-sm font-semibold text-white line-clamp-1">{card.name}</p>
                                                        {card.meta && (
                                                            <p className="text-xs text-gray-300 line-clamp-1">{card.meta}</p>
                                                        )}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 py-6 text-center">
                                            {activeMegaMenu === 'wishlist'
                                                ? 'Todavía no has guardado ningún juego.'
                                                : 'Cargando...'}
                                        </p>
                                    )}

                                    <div className="mt-5 flex justify-center">
                                        <Link
                                            href={activeMegaMenuLink.href}
                                            className="w-full max-w-sm text-center bg-[#ff4200] hover:bg-[#ff5a1f] text-white font-bold text-sm uppercase tracking-wider py-3 rounded-lg transition-colors"
                                        >
                                            Ver más
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions & Mobile Toggle */}
                    <div className="flex items-center gap-4">
                        <div className="md:hidden">
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(true)}
                                aria-label="Abrir menu"
                                className="rounded-full h-10 w-10 flex items-center justify-center text-white border border-white/25 bg-black/35 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-white/45 hover:bg-white/10"
                            >
                                <i className="pi pi-bars text-sm" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <Sidebar
                visible={mobileMenuOpen}
                onHide={() => setMobileMenuOpen(false)}
                position="right"
                style={{ background: 'transparent', border: 'none' }}
                className="bg-black/60 backdrop-blur-md text-white border-l  w-full md:w-20rem"
                pt={{
                    closeButton: { className: 'text-white hover:bg-white/10' },
                    content: { className: 'bg-transparent' },
                    root: { className: 'border-none bg-transparent shadow-none' },
                    mask: { className: 'backdrop-blur-sm' }
                }}
            >
                <div className="flex flex-col h-full">
                    <div className="flex flex-col gap-2 mt-8">
                        <Link
                            href="/"
                            onClick={() => setMobileMenuOpen(false)}
                            style={{ fontFamily: 'var(--font-press-start-2p)' }}
                            className={`p-4 text-xs rounded-lg border transition-colors font-bold flex items-center gap-3 group ${isRouteActive('/') ? 'text-white bg-primary-500/35 border-primary-500/60 shadow-[0_0_12px_rgba(255,66,0,0.4)]' : 'text-gray-300 border-transparent hover:text-white hover:bg-white/5'}`}
                        >
                            <i className="pi pi-home text-white transition-all duration-300 group-hover:scale-125 group-hover:text-primary-400"></i>
                            Inicio
                        </Link>
                        {SEARCH_NAV_LINKS.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                style={{ fontFamily: 'var(--font-press-start-2p)' }}
                                className={`p-4 text-xs rounded-lg border transition-colors font-bold flex items-center gap-3 group ${isRouteActive(item.href) ? 'text-white bg-primary-500/35 border-primary-500/60 shadow-[0_0_12px_rgba(255,66,0,0.4)]' : 'text-gray-300 border-transparent hover:text-white hover:bg-white/5'}`}
                            >
                                <i className={`pi ${item.icon} text-white transition-all duration-300 group-hover:scale-125 group-hover:text-primary-400`}></i>
                                {item.label}
                            </Link>
                        ))}
                        <Link
                            href="/wishlist"
                            onClick={() => setMobileMenuOpen(false)}
                            style={{ fontFamily: 'var(--font-press-start-2p)' }}
                            className={`p-4 text-xs rounded-lg border transition-colors font-bold flex items-center gap-3 group ${isRouteActive('/wishlist') ? 'text-white bg-primary-500/35 border-primary-500/60 shadow-[0_0_12px_rgba(255,66,0,0.4)]' : 'text-gray-300 border-transparent hover:text-white hover:bg-white/5'}`}
                        >
                            <i className="pi pi-heart text-white transition-all duration-300 group-hover:scale-125 group-hover:text-primary-400"></i>
                            My Wishlist
                        </Link>
                    </div>
                </div>
            </Sidebar>
        </>
    );
}
