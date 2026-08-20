"use client";

import Image from "next/image";
import Link from "next/link";
import SocialLinks from "@/shared/social/SocialLinks";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-10 border-t border-gray-800 bg-gradient-to-b from-[#151515] to-black/80">
            <div className="mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col gap-3">
                        <Link href="/" className="inline-flex items-center gap-2 w-fit" aria-label="Ir a Inicio">
                            <div className="relative w-12 h-12">
                                <Image src="/Logo.png" alt="Zgaming" fill sizes="48px" className="object-contain" unoptimized />
                            </div>
                            <span
                                className="text-[#ff4200] text-sm md:text-base"
                                style={{ fontFamily: "var(--font-press-start-2p)" }}
                            >
                                Zgaming
                            </span>
                        </Link>
                        <p className="text-xs md:text-sm text-gray-400 max-w-md">
                            Descubre, compara y encuentra tus próximos juegos favoritos en un solo lugar.
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 text-xs md:text-sm">
                        <span className="text-gray-500 uppercase tracking-[0.12em] text-[10px] mb-1">Navegación</span>
                        <Link href="/" className="text-gray-300 hover:text-white transition-colors w-fit">
                            Inicio
                        </Link>
                        <Link href="/search" className="text-gray-300 hover:text-white transition-colors w-fit">
                            Buscar
                        </Link>
                        <Link href="/wishlist" className="text-gray-300 hover:text-white transition-colors w-fit">
                            Wishlist
                        </Link>
                        <Link href="/legal" className="text-gray-300 hover:text-white transition-colors w-fit">
                            Privacidad y Términos
                        </Link>
                    </div>

                    <div className="flex flex-col gap-2 text-xs md:text-sm">
                        <span className="text-gray-500 uppercase tracking-[0.12em] text-[10px] mb-1">Contacto</span>
                        <SocialLinks compact={false} size="small" showLabels />
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[11px] md:text-xs text-gray-500">
                        © {currentYear} Zgaming. Todos los derechos reservados.
                    </p>
                    <span className="text-[11px] md:text-xs text-[#ff4200] uppercase tracking-[0.12em]">
                        Play more
                    </span>
                </div>
            </div>
        </footer>
    );
}
