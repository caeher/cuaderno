import type { Metadata } from "next"
import { LegalPage } from "@/components/site/legal-page"

export const metadata: Metadata = {
  title: "Política de Cookies y Tecnologías de Rastreo | Cuaderno",
  description:
    "Información transparente sobre las cookies técnicas y de preferencias utilizadas en Cuaderno y cómo configurar tu consentimiento.",
}

export default function CookiesPage() {
  return (
    <LegalPage
      title="Política de Cookies"
      badge="Transparencia Técnica"
      updatedAt="1 de enero de 2026"
      version="2.0"
      intro="En Cuaderno aplicamos una política de privacidad por diseño. No utilizamos cookies invasivas ni redes publicitarias de terceros para rastrearte en internet. Esta política detalla las cookies esenciales y de preferencias que empleamos para garantizar el funcionamiento correcto y seguro de la plataforma."
      keyPoints={[
        {
          title: "Sin cookies publicitarias",
          description:
            "No instalamos píxeles de seguimiento ni cookies de terceros orientadas a la elaboración de perfiles publicitarios.",
        },
        {
          title: "Control total en tu navegador",
          description:
            "Puedes consultar, bloquear o borrar las cookies en cualquier momento desde los ajustes de tu navegador o nuestro configurador.",
        },
      ]}
      sections={[
        {
          heading: "1. ¿Qué son las cookies y el almacenamiento local?",
          body: [
            "Las cookies son pequeños archivos de texto que los sitios web descargan en tu navegador cuando accedes a ellos. Permiten al sitio web reconocer tu dispositivo, recordar tus sesiones iniciadas y mantener tus preferencias activas durante la navegación.",
            "Asimismo, podemos utilizar tecnologías de almacenamiento local del navegador (como localStorage y sessionStorage), que permiten guardar información técnica de manera eficiente y segura en tu dispositivo sin transmitirla innecesariamente en cada petición de red.",
          ],
        },
        {
          heading: "2. Tipos de cookies que utiliza Cuaderno",
          body: [
            "En función de su finalidad y duración, clasificamos nuestras cookies en las siguientes categorías:",
          ],
          list: [
            "Cookies Técnicas y Estrictamente Necesarias: Imprescindibles para la autenticación de usuarios, la protección contra ataques de falsificación de petición en sitios cruzados (CSRF) y el mantenimiento de la sesión abierta mientras navegas por tu panel de control.",
            "Cookies de Preferencias y Funcionalidad: Permiten recordar tu configuración personalizada, como la elección del tema visual (modo claro u oscuro) y el estado de los paneles.",
            "Cookies Analíticas y de Rendimiento: Nos proporcionan métricas agregadas y anónimas sobre el volumen de visitas y lectura de artículos, utilizadas exclusivamente para alimentar las estadísticas de los autores de la comunidad.",
          ],
        },
        {
          heading: "3. Tabla técnica detallada de cookies",
          body: [
            "A continuación se detalla la relación exhaustiva de las cookies y elementos de almacenamiento local que pueden ser instalados al utilizar Cuaderno:",
          ],
          table: {
            headers: ["Nombre", "Proveedor", "Finalidad", "Tipo / Duración", "Obligatoriedad"],
            rows: [
              [
                "__session",
                "Clerk (Autenticación)",
                "Mantiene el token de sesión autenticada del usuario activo de forma cifrada.",
                "Cookie HTTP / Sesión",
                "Estrictamente Necesaria",
              ],
              [
                "__client_uat",
                "Clerk (Autenticación)",
                "Registra la última marca temporal de actualización de la sesión de usuario para prevenir accesos caducados.",
                "Cookie HTTP / Persistente",
                "Estrictamente Necesaria",
              ],
              [
                "theme",
                "Cuaderno (next-themes)",
                "Almacena la preferencia visual del usuario entre modo claro, oscuro o esquema del sistema operativo.",
                "localStorage / Persistente",
                "Preferencia / Opcional",
              ],
              [
                "cuaderno_cookie_consent",
                "Cuaderno",
                "Guarda la confirmación y las preferencias otorgadas en el banner de consentimiento de cookies.",
                "localStorage / 1 año",
                "Estrictamente Necesaria",
              ],
              [
                "cf_clearance / __cf_bm",
                "Infraestructura Cloudflare / Vercel",
                "Mitigación de ataques de denegación de servicio (DDoS) y verificación de tráfico legítimo no automatizado.",
                "Cookie HTTP / Hasta 1 año",
                "Seguridad / Esencial",
              ],
            ],
          },
        },
        {
          heading: "4. Cookies de terceros y proveedores autorizados",
          body: [
            "Cuaderno utiliza servicios de terceros especializados exclusivamente para funciones críticas de seguridad e infraestructura:",
          ],
          list: [
            "Clerk Inc.: Gestiona la identidad y autenticación multifactor con los más altos estándares de seguridad criptográfica.",
            "Vercel Inc.: Proporciona la infraestructura de red de distribución de contenidos (CDN) y balanceo de carga.",
          ],
          callout: {
            type: "info",
            title: "Transparencia con terceros",
            text: "Ninguno de nuestros proveedores tiene autorización para utilizar la información recogida en Cuaderno para fines distintos a los de prestarnos su servicio técnico especializado.",
          },
        },
        {
          heading: "5. Cómo gestionar y revocar el consentimiento",
          body: [
            "Puedes cambiar tus preferencias de cookies en cualquier momento pulsando el botón 'Configurar cookies' ubicado en la barra lateral o en el pie de página de nuestro sitio.",
            "Adicionalmente, todos los navegadores web modernos permiten consultar, restringir o eliminar las cookies instaladas. A continuación te ofrecemos los enlaces a las instrucciones oficiales de los principales navegadores:",
          ],
          list: [
            "Google Chrome: Configuración > Privacidad y seguridad > Cookies y otros datos de sitios.",
            "Mozilla Firefox: Ajustes > Privacidad y seguridad > Cookies y datos del sitio.",
            "Apple Safari: Preferencias > Privacidad > Bloquear todas las cookies.",
            "Microsoft Edge: Configuración > Permisos de sitios > Cookies y datos de sitios.",
          ],
          callout: {
            type: "warning",
            title: "Consecuencias de deshabilitar cookies técnicas",
            text: "Si bloqueas completamente las cookies técnicas y esenciales en tu navegador, no podrás iniciar sesión en tu panel de administración de Cuaderno ni publicar artículos.",
          },
        },
        {
          heading: "6. Actualizaciones de esta política",
          body: [
            "Podemos actualizar esta Política de Cookies para reflejar cambios en las tecnologías empleadas o por requerimientos normativos. Te recomendamos revisarla con regularidad.",
          ],
        },
      ]}
      relatedDocs={[
        { title: "Política de Privacidad", href: "/legal/privacidad" },
        { title: "Aviso Legal", href: "/legal/aviso-legal" },
      ]}
    />
  )
}
