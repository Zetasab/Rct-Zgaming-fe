'use client';

import React, { useEffect, useRef, useState } from 'react';
import SocialLinks from './SocialLinks';

export default function FloatingSocialMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="fixed bottom-5 right-5 z-90" ref={menuRef}>
            {isOpen && (
                <div className="mb-3 w-48 rounded-xl border border-white/15 bg-black/85 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-sm">
                    <p className="mb-2 text-xs text-gray-300">Redes del administrador</p>
                    <SocialLinks />
                </div>
            )}

            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="group flex h-14 w-14 items-center justify-center rounded-full border border-[#ff4200]/60 bg-[#151515] text-[#ff4200] shadow-[0_0_18px_rgba(255,66,0,0.4)] transition-transform hover:scale-105"
                aria-label="Mostrar redes sociales"
                aria-expanded={isOpen}
            >
                <i className={`pi ${isOpen ? 'pi-times' : 'pi-share-alt'} text-lg transition-transform duration-200 group-hover:rotate-12`} aria-hidden="true" />
            </button>
        </div>
    );
}