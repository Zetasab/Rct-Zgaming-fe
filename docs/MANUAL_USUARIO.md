# Manual de Usuario — Zgaming

## 1. ¿Qué es Zgaming?

Zgaming es un catálogo de videojuegos gratuito y sin fines comerciales: te permite explorar, buscar y filtrar juegos por género, plataforma o tienda, consultar su información y guardar tus favoritos en una lista de deseos (**Wishlist**) para encontrarlos rápido más adelante.

No necesitas registrarte ni crear una cuenta: cualquiera puede navegar libremente desde el navegador.

Puedes probarla en: **https://zgaming.vercel.app**

## 2. Primer acceso

La primera vez que entras en Zgaming verás un **aviso de bienvenida** que explica brevemente cómo funciona la web (búsqueda, filtros, Wishlist). Una vez lo cierras, no vuelve a aparecer en ese navegador.

## 3. Página de inicio

Al entrar en Zgaming encontrarás:

- Una **cabecera hero** destacada.
- **Carruseles** de juegos y un catálogo destacado.
- Un **menú de navegación** superior con un **mega menú** que da acceso rápido a géneros, plataformas y tiendas, con vista previa en cards.

## 4. Buscar juegos

1. Ve a la sección **Buscar** (`/search`) desde el menú de navegación.
2. Escribe el nombre del juego que buscas en el campo de texto libre.
3. Aplica filtros por **género**, **plataforma** o **tienda** para acotar los resultados.

## 5. Catálogos por categoría

Además de la búsqueda general, puedes navegar el catálogo completo desde secciones dedicadas:

- **Géneros** (`/searchGenres`)
- **Plataformas** (`/searchPlatforms`)
- **Tiendas** (`/searchStores`)

Estas mismas categorías están también accesibles directamente desde el **mega menú** del navbar, con una vista previa rápida en cards.

## 6. Ficha de detalle de un juego

Al hacer clic en cualquier juego accedes a su página de detalle, donde encontrarás su información ampliada: género, plataformas disponibles, tiendas y demás datos del catálogo.

Desde esta pantalla, así como desde las cards en carruseles y listados, puedes añadir el juego a tu **Wishlist** con el botón correspondiente.

## 7. Wishlist (lista de deseos)

Puedes guardar cualquier juego en tu Wishlist haciendo clic en su icono de guardado, tanto desde las cards de los carruseles/listados como desde la ficha de detalle. Al volver a hacer clic, se elimina de la lista.

> **Límite:** puedes guardar un máximo de **20 juegos**. Si intentas superar el límite, aparecerá una notificación indicando que no puedes guardar más.

Tu Wishlist se guarda en el **almacenamiento local del navegador** (`localStorage`), por lo que:

- Solo estará disponible en ese navegador y ese dispositivo.
- No se sincroniza entre dispositivos ni requiere conexión a un servidor propio.
- Si borras los datos de navegación del sitio, perderás los juegos guardados.

## 8. Página de Wishlist

En el apartado **Wishlist** (`/wishlist`) del menú de navegación puedes:

- Ver todos los juegos que has guardado.
- Filtrar la lista para encontrar un juego concreto.
- Quitar juegos individualmente haciendo clic de nuevo en su icono de guardado.

## 9. Política de privacidad

En el apartado **Legal** (`/legal`) encontrarás la política de privacidad y condiciones de uso, donde se explica qué datos se almacenan (únicamente en tu navegador, a través de `localStorage`) y cómo se usa la información del catálogo.

## 10. Preguntas frecuentes

**¿Necesito crear una cuenta para usar Zgaming?**
No. La aplicación no tiene sistema de registro ni login; todo funciona sin cuenta de usuario.

**¿Dónde se guarda mi Wishlist?**
En el almacenamiento local de tu propio navegador. No se envía ni almacena en ningún servidor.

**¿Por qué no veo mi Wishlist si cambio de navegador o dispositivo?**
Porque la Wishlist es local a cada navegador; no hay sincronización entre dispositivos.

**¿Cuántos juegos puedo guardar?**
Hasta 20 juegos como máximo en la Wishlist.

**¿Puedo recuperar mi Wishlist si la borro por error o cambio de navegador?**
No. Al ser un almacenamiento local del navegador, no hay copia de seguridad ni recuperación posible.
