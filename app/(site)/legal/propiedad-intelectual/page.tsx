import type { Metadata } from "next"
import { LegalPage } from "@/components/site/legal-page"

export const metadata: Metadata = {
  title: "Política de Propiedad Intelectual y DMCA | Cuaderno",
  description:
    "Protección de los derechos de autor de los creadores en Cuaderno y procedimiento formal para notificaciones de infracción y retirada de contenidos.",
}

export default function PropiedadIntelectualPage() {
  return (
    <LegalPage
      title="Política de Propiedad Intelectual y DMCA"
      badge="Derechos de Autor & UGC"
      updatedAt="1 de enero de 2026"
      version="1.0"
      intro="Cuaderno es una plataforma construida por y para creadores. Respetamos y protegemos la propiedad intelectual de todos los autores y exigimos a nuestros usuarios el mismo compromiso. Esta política detalla la titularidad de los derechos sobre los contenidos publicados y el procedimiento formal para reportar cualquier vulneración de derechos de autor."
      keyPoints={[
        {
          title: "Tus posts te pertenecen",
          description:
            "El autor mantiene el 100% de la propiedad y los derechos de autor sobre sus artículos, fotos y creaciones.",
        },
        {
          title: "Procedimiento ágil de retirada",
          description:
            "Disponemos de un canal dedicado para tramitar notificaciones de infracción y proteger a los titulares legítimos.",
        },
      ]}
      sections={[
        {
          heading: "1. Principios de autoría en Cuaderno",
          body: [
            "En Cuaderno creemos firmemente que quien escribe o crea una obra debe conservar el control absoluto sobre ella. Por ello:",
          ],
          list: [
            "Cada autor es el único titular de los derechos de propiedad intelectual sobre los artículos, textos, ensayos, ilustraciones y material audiovisual original que publique en su blog.",
            "Cuaderno no reclama ningún derecho de propiedad, explotación comercial ni exclusividad sobre tu contenido.",
            "La licencia que otorgas a Cuaderno es estrictamente técnica y no exclusiva, con el único fin de alojar, formatear y mostrar tus publicaciones a los lectores que visiten la plataforma.",
          ],
        },
        {
          heading: "2. Propiedad de la plataforma y marca Cuaderno",
          body: [
            "El software, diseño de interfaz, código fuente, algoritmos, bases de datos, logotipos, marcas comerciales y demás elementos distintivos de la plataforma Cuaderno son propiedad exclusiva de Cuaderno Platform Technologies S.L. o de sus respectivos licenciantes.",
            "Queda prohibida la reproducción, descompilación, ingeniería inversa o distribución de cualquier elemento de la plataforma sin nuestra autorización expresa por escrito.",
          ],
        },
        {
          heading: "3. Procedimiento de Notificación de Infracción (Notice & Takedown / DMCA)",
          body: [
            "Si eres titular de derechos de autor o actúas en representación de uno y consideras que algún contenido publicado en Cuaderno vulnera tus derechos protegidos, puedes enviar una notificación formal de retirada a nuestro agente designado de propiedad intelectual.",
            "Para que la notificación sea válida y pueda ser tramitada, debe contener la siguiente información obligatoria:",
          ],
          list: [
            "1. Identificación clara y detallada de la obra protegida por derechos de autor que alegas ha sido infringida (o una lista representativa si se trata de múltiples obras).",
            "2. Identificación del material presuntamente infractor, incluyendo la URL o enlace directo exacto al post dentro de Cuaderno.",
            "3. Datos de contacto completos del reclamante: nombre y apellidos o razón social, dirección física, número de teléfono y correo electrónico.",
            "4. Una declaración de buena fe indicando que consideras que el uso del material en la forma reclamada no está autorizado por el titular de los derechos, su agente ni por la ley.",
            "5. Una declaración bajo pena de perjurio de que la información contenida en la notificación es verídica y que eres el titular de los derechos o estás facultado para actuar en su nombre.",
            "6. Firma física o electrónica del titular de los derechos o de su representante autorizado.",
          ],
          callout: {
            type: "info",
            title: "Canal designado para notificaciones de copyright",
            text: "Envía tu notificación con todos los requisitos requeridos a: copyright@cuaderno.app con el asunto 'Notificación formal de infracción de propiedad intelectual'.",
          },
        },
        {
          heading: "4. Tramitación de notificaciones de infracción",
          body: [
            "Al recibir una notificación válida de infracción, el equipo legal de Cuaderno procederá con diligencia a:",
          ],
          list: [
            "1. Deshabilitar el acceso o retirar cautelarmente el contenido señalado para evitar la propagación de la infracción.",
            "2. Notificar inmediatamente al autor del blog afectado sobre la reclamación recibida, adjuntando los motivos y datos del reclamante.",
          ],
        },
        {
          heading: "5. Procedimiento de Contranotificación para autores",
          body: [
            "Si el autor considera de buena fe que su publicación fue retirada indebidamente, por error de identificación o que cuenta con las licencias correspondientes (incluyendo excepciones legales como derecho de cita, uso legítimo o parodia), podrá presentar una Contranotificación formal indicando:",
          ],
          list: [
            "Identificación del contenido específico que fue retirado y su ubicación URL original.",
            "Declaración bajo pena de perjurio de que cree de buena fe que el contenido fue retirado por error o identificación incorrecta.",
            "Consentimiento a la jurisdicción de los tribunales competentes y datos completos de contacto.",
            "Firma física o electrónica del autor.",
          ],
        },
        {
          heading: "6. Política frente a infractores reincidentes",
          body: [
            "En cumplimiento de las mejores prácticas y regulaciones internacionales (incluyendo la DMCA y la Directiva Europea sobre Derechos de Autor en el Mercado Único Digital), Cuaderno mantiene una estricta política de tolerancia cero frente a infractores reincidentes.",
            "Cualquier cuenta de usuario que acumule múltiples avisos fundamentados de vulneración de propiedad intelectual será suspendida o cancelada definitivamente.",
          ],
          callout: {
            type: "warning",
            title: "Consecuencias de notificaciones fraudulentas",
            text: "Ten en cuenta que presentar notificaciones falsas o malintencionadas de infracción de derechos de autor puede acarrear responsabilidad civil por daños y perjuicios conforme a la legislación aplicable.",
          },
        },
      ]}
      relatedDocs={[
        { title: "Términos de Servicio", href: "/legal/terminos" },
        { title: "Aviso Legal", href: "/legal/aviso-legal" },
      ]}
    />
  )
}
