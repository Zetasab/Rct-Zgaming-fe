export interface WishlistItem {
    id: number;
    slug: string;
    name: string;
    background_image: string;
}

export type ToggleWishlistResult = 'added' | 'removed' | 'limit-reached';

const STORAGE_KEY = 'zgaming_wishlist';
export const WISHLIST_MAX_ITEMS = 20;
export const WISHLIST_CHANGE_EVENT = 'zgaming-wishlist-change';

function readWishlist(): WishlistItem[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeWishlist(items: WishlistItem[]): void {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(WISHLIST_CHANGE_EVENT));
}

export function getWishlist(): WishlistItem[] {
    return readWishlist();
}

export function isGameWishlisted(gameId: number): boolean {
    return readWishlist().some((item) => item.id === gameId);
}

export function toggleWishlist(game: WishlistItem): ToggleWishlistResult {
    const items = readWishlist();
    const existingIndex = items.findIndex((item) => item.id === game.id);

    if (existingIndex >= 0) {
        items.splice(existingIndex, 1);
        writeWishlist(items);
        return 'removed';
    }

    if (items.length >= WISHLIST_MAX_ITEMS) {
        return 'limit-reached';
    }

    items.push(game);
    writeWishlist(items);
    return 'added';
}
