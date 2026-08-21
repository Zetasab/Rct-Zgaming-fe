import { getBaseUrl } from './config';

const ID_SEG_KEY = 'zgaming_id_seg';
const HEARTBEAT_INTERVAL_MS = 60000;

let heartbeatIntervalId: ReturnType<typeof setInterval> | null = null;

function getIdSeg(): string {
    let idSeg = sessionStorage.getItem(ID_SEG_KEY);
    if (!idSeg) {
        idSeg = crypto.randomUUID();
        sessionStorage.setItem(ID_SEG_KEY, idSeg);
    }
    return idSeg;
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

export function startVisitTracking(): void {
    registerVisit();

    if (heartbeatIntervalId !== null) {
        return;
    }

    heartbeatIntervalId = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);
}
