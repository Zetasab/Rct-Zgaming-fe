'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import DetailedGame from '@/features/detailed-game/DetailedGame';

function GamePageContent() {
    const searchParams = useSearchParams();
    const slug = (searchParams.get('slug') || '').trim();

    if (!slug) {
        return (
            <div className="flex justify-center items-center h-screen text-white bg-[#151515]">
                Falta el parametro slug
            </div>
        );
    }

    return <DetailedGame gameSlug={slug} />;
}

export default function GamePage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen text-white bg-[#151515]" />}>
            <GamePageContent />
        </Suspense>
    );
}
