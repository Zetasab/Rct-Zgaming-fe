'use client';

import { Toast, ToastMessage } from 'primereact/toast';
import { useEffect, useRef } from 'react';

let toastInstance: Toast | null = null;

export function showToast(message: ToastMessage): void {
    toastInstance?.show({ life: 3000, ...message });
}

export default function ToastProvider() {
    const toastRef = useRef<Toast>(null);

    useEffect(() => {
        toastInstance = toastRef.current;
        return () => {
            toastInstance = null;
        };
    }, []);

    return <Toast ref={toastRef} position="bottom-right" />;
}
