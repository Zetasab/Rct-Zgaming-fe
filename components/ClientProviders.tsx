'use client';

import React, { useEffect } from 'react';
import { PrimeReactProvider } from 'primereact/api';
import Navbar from '@/shared/navbar/Navbar'; // Import Navbar
import { usePathname } from 'next/navigation';
import FloatingSocialMenu from '@/shared/social/FloatingSocialMenu';
import ToastProvider from '@/components/ToastProvider';
import WelcomeDialog from '@/components/WelcomeDialog';
import { startVisitTracking } from '@/services/visitTracking';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const normalizedPathname = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
    const isLegalPage = normalizedPathname === '/legal' || normalizedPathname.endsWith('/legal');
    const hideNavbar = isLegalPage;

    useEffect(() => {
        startVisitTracking();
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        // Keep browser from restoring previous scroll position on route changes.
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        const scrollTop = () => {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
        };

        scrollTop();

        // Mobile browsers can apply a late layout shift; retry shortly after paint.
        const rafId = window.requestAnimationFrame(scrollTop);
        const timeoutId = window.setTimeout(scrollTop, 80);

        return () => {
            window.cancelAnimationFrame(rafId);
            window.clearTimeout(timeoutId);
        };
    }, [pathname]);

    return (
        <PrimeReactProvider value={{ ripple: true }}>
            {!hideNavbar && <Navbar />}
            {children}
            <FloatingSocialMenu />
            <ToastProvider />
            <WelcomeDialog />
        </PrimeReactProvider>
    );
}
