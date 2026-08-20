import Footer from "@/shared/footer/Footer";
import SocialLinks from "@/shared/social/SocialLinks";

export default function LegalPage() {
  const effectiveDate = "20 de agosto de 2026";

  return (
    <div className="min-h-screen bg-[#151515] text-gray-100">
      <main className="mx-auto w-full max-w-4xl px-4 md:px-8 lg:px-12 pt-28 pb-10">
        <header className="mb-8 border-b border-gray-700 pb-5">
          <p className="text-xs uppercase tracking-[0.2em] text-[#ff4200] mb-2">Zgaming</p>
          <h1
            className="text-2xl md:text-3xl text-white"
            style={{ fontFamily: "var(--font-press-start-2p)" }}
          >
            Política de Privacidad y Condiciones de Uso
          </h1>
          <p className="mt-4 text-sm text-gray-400">Vigencia: {effectiveDate}</p>
        </header>

        <section className="space-y-8 text-sm md:text-base leading-7 text-gray-200">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-2">
              1. Información que recopilamos
            </h2>
            <p className="text-gray-300">
              Zgaming no tiene sistema de registro ni cuentas de usuario, por lo que no recopilamos nombres,
              contraseñas ni datos de identificación personal. Cuando visitas o usas esta página, podemos guardar:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-300 mt-2">
              <li>Dirección IP y fecha/hora de cada visita, a través de los logs del proveedor de hosting.</li>
              <li>
                Datos guardados únicamente en el almacenamiento local (localStorage) de tu propio navegador: los
                juegos que marcas en tu Wishlist (máximo 20) y si ya has visto el aviso inicial de la web. Estos
                datos nunca salen de tu dispositivo ni se envían a ningún servidor nuestro.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-2">
              2. Uso de la información
            </h2>
            <p className="text-gray-300">
              La información de visitas (IP, fecha) se guarda exclusivamente con fines estadísticos, para mejorar
              el rendimiento, la estabilidad, la seguridad y la experiencia general del servicio. Los datos de
              localStorage se usan únicamente para que la propia página funcione (recordar tu Wishlist y si ya
              viste el aviso inicial).
            </p>
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-2">
              3. Comparticion con terceros
            </h2>
            <p className="text-gray-300">
              No vendemos, alquilamos ni cedemos ninguna información a terceros con fines comerciales. Zgaming
              muestra un catálogo de videojuegos (nombre, imágenes, géneros, plataformas, tiendas y valoraciones)
              recopilado en una base de datos propia; el contenido audiovisual y los datos de los juegos pertenecen
              a sus respectivos titulares.
            </p>
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-2">
              4. Conservación y eliminación
            </h2>
            <p className="text-gray-300">
              Los logs de visitas del hosting se conservan por un periodo máximo de 30 días y luego se eliminan de
              forma automática. Los datos guardados en localStorage (Wishlist, aviso leído) permanecen en tu
              navegador hasta que tú mismo los borres (quitando los juegos guardados desde el icono de corazón) o
              elimines los datos de navegación de este sitio desde la configuración de tu navegador.
            </p>
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-2">
              5. Condiciones de uso
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>Al usar esta página aceptas estas políticas y condiciones de uso.</li>
              <li>
                Zgaming es un proyecto personal sin fines comerciales; el contenido de los juegos (títulos,
                imágenes, descripciones) pertenece a sus respectivos titulares.
              </li>
              <li>No se garantiza disponibilidad continua ni ausencia de errores en el servicio.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-2">
              6. Cambios en este documento
            </h2>
            <p className="text-gray-300">
              Podemos actualizar esta política de privacidad y condiciones de uso en cualquier momento. Los
              cambios se publicarán en esta misma página.
            </p>
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-semibold text-white mb-2">
              7. Naturaleza del proyecto y seguridad
            </h2>
            <p className="text-gray-300">
              Este sitio es un proyecto personal de pruebas y no tiene finalidad comercial. Aunque se aplican
              medidas razonables para proteger los datos, su objetivo principal es de aprendizaje, por lo que es
              posible que alguna funcionalidad no se comporte siempre como esperas. Si tienes cualquier problema,
              puedes ponerte en contacto con el administrador a través de los siguientes enlaces:
            </p>
            <div className="mt-3">
              <SocialLinks compact size="small" />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
