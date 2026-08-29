import type { Metadata } from "next"
import { LegalPage } from "@/components/site/legal-page"

export const metadata: Metadata = {
  title: "Términos y Condiciones de Servicio | Cuaderno",
  description:
    "Condiciones de uso, derechos sobre el contenido publicado y directrices comunitarias de la plataforma de blogs Cuaderno.",
}

export default function TerminosPage() {
  return (
    <LegalPage
      title="Términos y Condiciones de Servicio"
      badge="Contrato de Usuario"
      updatedAt="1 de enero de 2026"
      version="2.0"
      intro="Bienvenido a Cuaderno. Estos Términos y Condiciones regulan la relación jurídica entre tú (el 'Usuario' o 'Autor') y Cuaderno Platform Technologies S.L. ('Cuaderno', 'nosotros' o la 'Plataforma') con respecto al uso de nuestros servicios de publicación digital."
      keyPoints={[
        {
          title: "Tu contenido es 100% tuyo",
          description:
            "Conservas la propiedad intelectual total de todos los artículos y material que escribas y publiques en Cuaderno.",
        },
        {
          title: "Plataforma sin ataduras",
          description:
            "Puedes editar, despublicar o exportar tus artículos en cualquier momento y cerrar tu cuenta sin penalizaciones.",
        },
      ]}
      sections={[
        {
          heading: "1. Aceptación de las condiciones y capacidad",
          body: [
            "Al crear una cuenta en Cuaderno o al interactuar con las publicaciones y servicios de la plataforma, declaras haber leído, comprendido y aceptado quedar vinculado por los presentes Términos de Servicio y nuestra Política de Privacidad.",
            "Para utilizar nuestros servicios debes contar con la edad mínima legal requerida en tu jurisdicción (generalmente 16 o 18 años). Si utilizas la plataforma en representación de una persona jurídica u organización, garantizas que posees los poderes de representación suficientes para vincularla a estos términos.",
          ],
        },
        {
          heading: "2. Registro y seguridad de tu cuenta",
          body: [
            "Para acceder a las funciones de creación de blogs y publicación de artículos, es necesario registrarse mediante nuestra plataforma de autenticación.",
            "Te comprometes a proporcionar información veraz, precisa y actualizada durante el registro.",
            "Eres el único responsable de preservar la confidencialidad de tus credenciales de acceso y de cualquier actividad que ocurra bajo tu cuenta. Si sospechas de cualquier acceso no autorizado o brecha de seguridad, deberás notificárnoslo inmediatamente a legal@cuaderno.app.",
          ],
        },
        {
          heading: "3. Propiedad intelectual y licencia de publicación",
          body: [
            "Tu contenido te pertenece: Conservas todos los derechos morales y patrimoniales de autor sobre los artículos, textos, gráficos y fotografías que publiques en tu blog dentro de Cuaderno.",
            "Licencia limitada para la operación del servicio: Al publicar contenido en Cuaderno, nos concedes una licencia no exclusiva, mundial, gratuita y transferible únicamente con el propósito técnico y operativo de almacenar, procesar, maquetar, generar índices, almacenar en caché y distribuir dicho contenido para que sea visible por los lectores a través del sitio web y sus canales asociados.",
            "Esta licencia finaliza en el momento en que decidas eliminar el artículo correspondiente o darte de baja de la plataforma.",
          ],
          callout: {
            type: "success",
            title: "Garantía de autoría",
            text: "Cuaderno nunca utilizará tus artículos para entrenar modelos de inteligencia artificial propios ni revenderá tus textos a empresas de recopilación de datos.",
          },
        },
        {
          heading: "4. Reglas de la comunidad y conductas prohibidas",
          body: [
            "Como usuario de Cuaderno, te comprometes a hacer un uso ético y respetuoso de la plataforma. Queda terminantemente prohibido publicar o difundir:",
          ],
          list: [
            "Material que infrinja derechos de autor, patentes, marcas registradas o secretos comerciales de terceros sin la debida autorización.",
            "Contenido difamatorio, calumnioso, acosador, amenazante o que incite al odio y a la violencia contra personas o colectivos.",
            "Spam no solicitado, esquemas piramidales, enlaces a malware o sitios fraudulentos de phishing.",
            "Acceso no autorizado mediante técnicas de scraping masivo que perjudiquen la disponibilidad de los servidores de la plataforma.",
            "Suplantación de la identidad de otros autores, celebridades o entidades oficiales.",
          ],
        },
        {
          heading: "5. Comentarios y participación comunitaria",
          body: [
            "Cuaderno permite a los usuarios registrados interactuar con las publicaciones mediante comentarios constructivos.",
            "Los autores tienen la facultad de moderar y eliminar comentarios en sus propios artículos.",
            "Nos reservamos el derecho de retirar de oficio cualquier comentario que contravenga las reglas de conducta expuestas en la cláusula anterior.",
          ],
        },
        {
          heading: "6. Procedimiento de moderación y cancelación de cuentas",
          body: [
            "Moderación proactiva y reactiva: Si detectamos o recibimos una notificación fundada de que un contenido vulnera estos términos o la legislación aplicable, podremos solicitar al autor su rectificación o proceder a su retirada preventiva.",
            "Suspensión de cuenta: En casos de infracciones graves o reiteradas, nos reservamos el derecho de suspender o cancelar permanentemente la cuenta del usuario infractor.",
            "Baja voluntaria: Puedes darte de baja de Cuaderno en cualquier momento desde los ajustes de tu cuenta, lo que conllevará la despublicación y borrado de tus datos conforme a la Política de Privacidad.",
          ],
        },
        {
          heading: "7. Disponibilidad del servicio y limitación de responsabilidad",
          body: [
            "Nos esforzamos por ofrecer un servicio disponible las 24 horas del día con altos estándares de rendimiento. Sin embargo, Cuaderno se presta 'tal cual' ('as is') y 'según disponibilidad', sin garantías expresas o implícitas de funcionamiento ininterrumpido.",
            "Cuaderno no será responsable por daños indirectos, pérdidas de beneficios, pérdidas de datos o interrupciones operativas derivadas del uso o imposibilidad de uso del servicio, en la máxima medida permitida por la legislación de protección a los consumidores.",
          ],
        },
        {
          heading: "8. Modificaciones a los presentes términos",
          body: [
            "Podemos actualizar estos Términos de Servicio periódicamente para adaptarnos a mejoras funcionales o cambios legislativos.",
            "En caso de modificaciones sustanciales, notificaremos a los autores registrados con un preaviso mínimo de 15 días naturales a través del correo electrónico asociado o mediante un aviso destacado en la plataforma antes de que los nuevos términos entren en vigor.",
          ],
        },
        {
          heading: "9. Legislación aplicable y resolución de litigios",
          body: [
            "Los presentes Términos se rigen por la legislación española y europea.",
            "Para cualquier discrepancia, las partes intentarán resolver el desacuerdo de buena fe mediante negociación directa contactando a legal@cuaderno.app.",
            "Si no fuera posible alcanzar un acuerdo extrajudicial, los litigios serán sometidos a la jurisdicción de los juzgados y tribunales competentes conforme a la normativa de consumidores y usuarios.",
          ],
        },
      ]}
      relatedDocs={[
        { title: "Política de Privacidad", href: "/legal/privacidad" },
        { title: "Propiedad Intelectual", href: "/legal/propiedad-intelectual" },
      ]}
    />
  )
}
