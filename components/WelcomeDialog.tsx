'use client';

import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import SocialLinks from '@/shared/social/SocialLinks';

const STORAGE_KEY = 'zgaming-disclaimer-acknowledged';

export default function WelcomeDialog() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        try {
            setVisible(window.localStorage.getItem(STORAGE_KEY) !== 'true');
        } catch {
            setVisible(true);
        }
    }, []);

    const handleAcknowledge = () => {
        setVisible(false);
        try {
            window.localStorage.setItem(STORAGE_KEY, 'true');
        } catch {
            // localStorage unavailable, ignore
        }
    };

    return (
        <Dialog
            visible={visible}
            onHide={() => {}}
            closable={false}
            modal
            draggable={false}
            dismissableMask={false}
            style={{ width: '460px', maxWidth: '92vw' }}
            header={
                <div className="flex items-center gap-2 text-white">
                    <i className="pi pi-exclamation-triangle text-[#ff4200]" />
                    <span>Aviso importante</span>
                </div>
            }
            pt={{
                root: { className: 'bg-[#1a1a1a] border border-white/10' },
                header: { className: 'bg-[#1a1a1a]' },
                content: { className: 'bg-[#1a1a1a] text-gray-200' },
                mask: { className: 'backdrop-blur-sm' },
            }}
        >
            <div className="space-y-3 text-sm">
                <h3 className="text-base font-bold text-white">Proyecto personal de pruebas — ¿Cómo funciona Zgaming?</h3>
                <p>
                    Zgaming es un proyecto personal, no comercial, para buscar y descubrir videojuegos por género,
                    plataforma y tienda. Puede que alguna funcionalidad no se comporte siempre como esperas.
                </p>
                <p>
                    No necesitas crear una cuenta ni iniciar sesión. La sección <strong>Wishlist</strong> guarda tus
                    juegos favoritos directamente en este navegador (hasta un máximo de 20); si cambias de
                    navegador o dispositivo, esa lista no se compartirá.
                </p>
                <p>Si tienes cualquier problema, ponte en contacto con el administrador.</p>
                <SocialLinks compact size="small" showLabels={false} />
            </div>

            <div className="flex justify-end mt-5">
                <Button label="Entiendo, continuar" onClick={handleAcknowledge} />
            </div>
        </Dialog>
    );
}
