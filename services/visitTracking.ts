import { getBaseUrl } from './config';

const ID_SEG_KEY = 'zgaming_id_seg';
const HEARTBEAT_INTERVAL_MS = 60000;
const HUMAN_SIGNAL_TIMEOUT_MS = 12000;
const BOT_UA_REGEX = /bot|crawl|spider|slurp|bingpreview|headless|wget|curl|python-requests|aiohttp|httpclient|scanner|nikto|sqlmap|nmap/i;
const HUMAN_SIGNAL_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const;

let heartbeatIntervalId: ReturnType<typeof setInterval> | null = null;

function getIdSeg(): string {
    let idSeg = sessionStorage.getItem(ID_SEG_KEY);
    if (!idSeg) {
        idSeg = crypto.randomUUID();
        sessionStorage.setItem(ID_SEG_KEY, idSeg);
    }
    return idSeg;
}

function isLikelyBot(): boolean {
    const userAgent = navigator.userAgent || '';
    const webdriver = navigator.webdriver === true;
    return webdriver || BOT_UA_REGEX.test(userAgent);
}

function waitForHumanSignal(timeoutMs: number): Promise<boolean> {
    return new Promise((resolve) => {
        let resolved = false;

        function cleanup(): void {
            HUMAN_SIGNAL_EVENTS.forEach((event) => window.removeEventListener(event, onHumanAction, true));
        }

        function finish(value: boolean): void {
            if (resolved) {
                return;
            }
            resolved = true;
            cleanup();
            resolve(value);
        }

        function onHumanAction(): void {
            finish(true);
        }

        HUMAN_SIGNAL_EVENTS.forEach((event) =>
            window.addEventListener(event, onHumanAction, { once: true, passive: true, capture: true })
        );

        setTimeout(() => {
            const visibleAndFocused = document.visibilityState === 'visible' && document.hasFocus();
            finish(visibleAndFocused);
        }, timeoutMs);
    });
}

function registerVisit(): void {
    fetch(`${getBaseUrl()}/api/addzgaming`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idSeg: getIdSeg() }),
    }).catch((error) => console.warn('No se pudo registrar la visita:', error));
}

function sendHeartbeat(): void {
    fetch(`${getBaseUrl()}/api/addkeepalivezgaming?idSeg=${encodeURIComponent(getIdSeg())}`, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
    }).catch((error) => console.warn('No se pudo enviar el keepalive de visita:', error));
}

function startHeartbeat(): void {
    if (heartbeatIntervalId !== null) {
        return;
    }

    heartbeatIntervalId = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
}

export async function startVisitTracking(): Promise<void> {
    if (isLikelyBot()) {
        return;
    }

    const humanSignalDetected = await waitForHumanSignal(HUMAN_SIGNAL_TIMEOUT_MS);
    if (!humanSignalDetected) {
        return;
    }

    registerVisit();
    startHeartbeat();
}
