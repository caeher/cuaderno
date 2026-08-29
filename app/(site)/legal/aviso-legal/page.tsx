import type { Metadata } from "next"
import { LegalPage } from "@/components/site/legal-page"

export const metadata: Metadata = {
  title: "Aviso Legal e Información Corporativa | Cuaderno",
  description:
    "Información identificativa de la entidad responsable del portal Cuaderno, condiciones generales de uso y normativa aplicable.",
}

export default function AvisoLegalPage() {
  return (
    <LegalPage
      title="Aviso Legal e Información Corporativa"
      badge="LSSI-CE & Información Legal"
      updatedAt="1 de enero de 2026"
      version="1.1"
      intro="En cumplimiento con las obligaciones de información establecidas en la Ley de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE) y normativas comunitarias aplicables, se exponen a continuación los datos identificativos y las condiciones que regulan el acceso al portal Cuaderno."
      keyPoints={[
        {
          title: "Titularidad transparente",
          description:
            "Cuaderno es una plataforma operada para la creación, publicación y difusión de blogs independientes.",
        },
        {
          title: "Uso responsable",
          description:
            "El acceso y navegación por el sitio atribuye la condición de usuario e implica la aceptación íntegra de este aviso.",
        },
      ]}
      sections={[
        {
          heading: "1. Datos identificativos del titular",
          body: [
            "En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se informa a los usuarios de los datos identificativos de la entidad gestora:",
          ],
          list: [
            "Denominación comercial: Cuaderno (Plataforma de Publicación Digital)",
            "Titular del servicio: Cuaderno Platform Technologies S.L.",
            "N.I.F. / Identificación Fiscal: B-89234123 (o equivalente para operaciones internacionales)",
            "Domicilio social: Calle Gran Vía 45, Planta 4, 28013 Madrid, España",
            "Correo electrónico de contacto general: contacto@cuaderno.app",
            "Correo electrónico para notificaciones legales: legal@cuaderno.app",
          ],
        },
        {
          heading: "2. Objeto y ámbito de aplicación",
          body: [
            "El presente Aviso Legal regula el acceso, navegación y uso del sitio web accesible mediante el dominio cuaderno.app y sus subdominios asociados.",
            "Cuaderno pone a disposición de autores y lectores una infraestructura digital destinada a la redacción, maquetación, publicación y lectura de blogs personales y temáticos.",
            "El acceso a determinadas funcionalidades, como la creación de publicaciones o la administración de un blog, requiere el registro previo como usuario conforme a nuestros Términos de Servicio.",
          ],
        },
        {
          heading: "3. Condiciones de uso del portal",
          body: [
            "El usuario se compromete a hacer un uso adecuado y diligente de los contenidos y servicios que Cuaderno ofrece, absteniéndose de incurrir en actividades ilícitas, ilegales o contrarias a la buena fe y al orden público.",
            "Queda estrictamente prohibido:",
          ],
          list: [
            "Difundir contenidos o propaganda de carácter racista, xenófobo, pornográfico-ilegal, de apología del terrorismo o atentatorio contra los derechos humanos.",
            "Provocar daños en los sistemas físicos y lógicos de Cuaderno, de sus proveedores o de terceras personas.",
            "Introducir o difundir en la red virus informáticos, malware o cualesquiera otros sistemas susceptibles de provocar daños.",
            "Intentar acceder, manipular o utilizar las cuentas de otros usuarios sin autorización expresa.",
          ],
        },
        {
          heading: "4. Propiedad intelectual e industrial de la plataforma",
          body: [
            "La estructura del sitio web, el código fuente, la arquitectura de software, el diseño gráfico, los logotipos, iconos, textos institucionales y elementos distintivos propios de Cuaderno son titularidad exclusiva de Cuaderno Platform Technologies S.L. o de sus licenciantes, estando protegidos por la legislación sobre propiedad intelectual e industrial.",
            "Respecto al contenido publicado por los usuarios registrados (artículos, ensayos, imágenes propias), la titularidad corresponde íntegra y exclusivamente a sus respectivos autores, rigiéndose por nuestra Política de Propiedad Intelectual.",
          ],
        },
        {
          heading: "5. Exclusión de garantías y responsabilidad",
          body: [
            "Cuaderno no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos publicados por autores terceros, falta de disponibilidad del portal por causas técnicas ajenas o mantenimientos, o la transmisión de virus a pesar de haber adoptado todas las medidas tecnológicas preventivas necesarias.",
            "Las opiniones y artículos expresados por los autores en sus respectivos blogs pertenecen exclusivamente a sus creadores y no reflejan necesariamente el criterio ni la postura institucional de Cuaderno.",
          ],
          callout: {
            type: "info",
            title: "Aviso sobre enlaces de terceros",
            text: "En el caso de que en Cuaderno se dispusiesen enlaces o hipervínculos hacia otros sitios de Internet, Cuaderno no ejercerá ningún tipo de control sobre dichos sitios y contenidos.",
          },
        },
        {
          heading: "6. Modificaciones y vigencia",
          body: [
            "Cuaderno se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través de la misma como la forma en la que éstos aparezcan presentados o localizados.",
          ],
        },
        {
          heading: "7. Legislación aplicable y fuero",
          body: [
            "Para la resolución de todas las controversias o cuestiones relacionadas con el presente sitio web o de las actividades en él desarrolladas, será de aplicación la legislación española y europea.",
            "Las partes se someten, a su elección, para la resolución de los conflictos y con renuncia a cualquier otro fuero, a los juzgados y tribunales del domicilio del usuario cuando éste tenga la condición de consumidor, o a los tribunales de Madrid para relaciones mercantiles entre empresas.",
          ],
        },
      ]}
      relatedDocs={[
        { title: "Términos de Servicio", href: "/legal/terminos" },
        { title: "Política de Privacidad", href: "/legal/privacidad" },
      ]}
    />
  )
}
