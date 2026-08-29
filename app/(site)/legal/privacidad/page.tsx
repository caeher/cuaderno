import type { Metadata } from "next"
import { LegalPage } from "@/components/site/legal-page"

export const metadata: Metadata = {
  title: "Política de Privacidad | Cuaderno",
  description:
    "Descubre cómo recopilamos, tratamos y protegemos tus datos personales en Cuaderno de conformidad con el RGPD y la normativa de protección de datos.",
}

export default function PrivacidadPage() {
  return (
    <LegalPage
      title="Política de Privacidad"
      badge="Cumplimiento RGPD / GDPR"
      updatedAt="1 de enero de 2026"
      version="2.0"
      intro="En Cuaderno nos tomamos muy en serio la protección de tu privacidad. Esta política detalla de forma clara qué datos personales recopilamos cuando utilizas nuestra plataforma de publicación de blogs, para qué fines legítimos los tratamos, bajo qué garantías y qué control absoluto mantienes sobre ellos."
      keyPoints={[
        {
          title: "Tus datos no se venden",
          description:
            "No comercializamos ni monetizamos información personal con corredores de datos ni redes publicitarias.",
        },
        {
          title: "Control y derechos ARCO+",
          description:
            "Puedes acceder, corregir, exportar o eliminar todos tus datos en cualquier momento desde tu panel o por correo.",
        },
      ]}
      sections={[
        {
          heading: "1. Responsable del tratamiento de datos",
          body: [
            "El responsable del tratamiento de los datos personales recabados a través de Cuaderno es:",
          ],
          list: [
            "Identidad: Cuaderno Platform Technologies S.L.",
            "N.I.F.: B-89234123",
            "Dirección postal: Calle Gran Vía 45, Planta 4, 28013 Madrid, España",
            "Delegado de Protección de Datos / Contacto de Privacidad: privacidad@cuaderno.app",
          ],
        },
        {
          heading: "2. Información personal que recopilamos",
          body: [
            "Recopilamos únicamente la información necesaria para brindarte una experiencia de blogging fluida y segura:",
          ],
          list: [
            "Datos identificativos y de cuenta: Nombre, apellidos, nombre de usuario y dirección de correo electrónico facilitados durante el proceso de registro mediante nuestra capa de autenticación segura (Clerk). Las contraseñas se almacenan mediante algoritmos criptográficos unidireccionales de alta seguridad y nunca en texto plano.",
            "Datos del perfil de autor: Biografía, fotografía de avatar, ubicación geográfica declarada y enlaces a redes sociales que decidas incorporar voluntariamente en tu perfil público.",
            "Contenidos generados: Textos, borradores, artículos publicados, imágenes incrustadas, etiquetas y comentarios emitidos en publicaciones.",
            "Datos técnicos y de registro: Dirección IP de conexión, tipo de navegador, sistema operativo y fecha/hora de acceso, registrados estrictamente con fines de seguridad, prevención de ataques de denegación de servicio (DDoS) y detección de abusos.",
            "Métricas de interacción agregadas: Número de lecturas, vistas por publicación y me gusta generados dentro del ecosistema de Cuaderno, presentados de forma anónima o disociada en tu panel de estadísticas.",
          ],
        },
        {
          heading: "3. Finalidades y bases jurídicas del tratamiento",
          body: [
            "Tratamos tus datos personales exclusivamente bajo las bases de legitimación reconocidas por el artículo 6 del Reglamento General de Protección de Datos (RGPD):",
          ],
          table: {
            headers: ["Finalidad del Tratamiento", "Base Jurídica (RGPD)", "Categoría de Datos"],
            rows: [
              [
                "Prestación del servicio: gestión de cuentas, panel de autor, edición y publicación de artículos en tu blog.",
                "Ejecución de contrato (Art. 6.1.b RGPD).",
                "Datos de cuenta, perfil y contenido.",
              ],
              [
                "Seguridad de la plataforma: monitorización de incidentes, prevención de intrusiones y bloqueo de bots maliciosos.",
                "Interés legítimo y obligación legal (Art. 6.1.c y 6.1.f RGPD).",
                "Datos técnicos y logs de acceso.",
              ],
              [
                "Comunicaciones operativas: alertas de seguridad, cambios en las políticas o avisos sobre el estado de tu cuenta.",
                "Ejecución de contrato y cumplimiento normativo (Art. 6.1.b y 6.1.c RGPD).",
                "Correo electrónico y nombre.",
              ],
              [
                "Estadísticas anónimas de rendimiento: generación de métricas de lectura para los autores de la comunidad.",
                "Interés legítimo en la mejora del servicio (Art. 6.1.f RGPD).",
                "Métricas agregadas disociadas.",
              ],
            ],
          },
        },
        {
          heading: "4. Destinatarios y transferencias internacionales",
          body: [
            "Cuaderno no cede ni vende datos personales a terceros con fines publicitarios o comerciales.",
            "Para prestar el servicio, recurrimos a proveedores de infraestructura tecnológica de primer nivel que actúan en calidad de Encargados del Tratamiento bajo contratos vinculantes de confidencialidad y tratamiento de datos:",
          ],
          list: [
            "Autenticación e Identidad: Clerk Inc. (proveedor de autenticación que aplica cifrado de extremo a extremo y opera bajo el Marco de Privacidad de Datos UE-EE.UU. / Data Privacy Framework y Cláusulas Contractuales Tipo).",
            "Alojamiento web y CDN: Vercel Inc. y servidores en centros de datos ubicados en la Unión Europea o con salvaguardas equivalentes.",
            "Bases de datos: Servicios gestionados con cifrado en tránsito (TLS 1.3) y en reposo (AES-256).",
          ],
        },
        {
          heading: "5. Plazo de conservación de los datos",
          body: [
            "Conservamos tus datos personales durante el tiempo en que mantengas activa tu cuenta en Cuaderno.",
            "En caso de que decidas solicitar la baja o eliminación de tu cuenta, tus datos personales, perfiles y artículos asociados serán suprimidos de nuestras bases de datos operativas de forma definitiva en un plazo máximo de 30 días, salvo aquella información técnica que debamos conservar bloqueada para el cumplimiento de obligaciones legales de retención tributaria o de seguridad por los periodos legalmente prescritos.",
          ],
        },
        {
          heading: "6. Tus derechos de protección de datos (ARCO+)",
          body: [
            "De acuerdo con la legislación vigente, dispones de los siguientes derechos sobre tus datos personales:",
          ],
          list: [
            "Derecho de Acceso: Conocer qué datos tuyos estamos tratando y obtener una copia de los mismos.",
            "Derecho de Rectificación: Modificar cualquier dato inexacto o incompleto directamente desde el panel de ajustes de tu perfil.",
            "Derecho de Supresión (Derecho al Olvido): Solicitar el borrado íntegro de tu cuenta y todos tus datos asociados.",
            "Derecho de Oposición: Oponerte al tratamiento de tus datos en aquellos supuestos basados en nuestro interés legítimo.",
            "Derecho a la Limitación del Tratamiento: Solicitar que restrinjamos temporalmente el uso de tus datos en situaciones específicas.",
            "Derecho a la Portabilidad: Recibir tus datos y publicaciones en un formato estructurado, de uso común y lectura mecánica (JSON/Markdown).",
          ],
          callout: {
            type: "success",
            title: "¿Cómo ejercer tus derechos?",
            text: "Puedes ejercer cualquiera de estos derechos sin coste alguno enviando un correo electrónico a privacidad@cuaderno.app indicando en el asunto 'Ejercicio de Derechos RGPD' o gestionándolo directamente desde tu panel de configuración en Cuaderno.",
          },
        },
        {
          heading: "7. Reclamación ante la autoridad de control",
          body: [
            "Si consideras que el tratamiento de tus datos personales no se ajusta a la normativa vigente, tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD, www.aepd.es) o ante la autoridad de protección de datos competente de tu país de residencia dentro de la Unión Europea.",
          ],
        },
        {
          heading: "8. Medidas de seguridad técnicas y organizativas",
          body: [
            "En Cuaderno implementamos medidas de seguridad de última generación para evitar la alteración, pérdida, acceso no autorizado o robo de datos. Entre ellas se incluyen:",
          ],
          list: [
            "Cifrado de todas las comunicaciones mediante protocolo HTTPS y certificados TLS actualizados.",
            "Tokens de sesión firmados digitalmente con expiración automática.",
            "Políticas de contraseñas robustas y autenticación multifactor (MFA/2FA) opcional para autores.",
            "Copias de seguridad periódicas y aislamiento de entornos.",
          ],
        },
      ]}
      relatedDocs={[
        { title: "Términos de Servicio", href: "/legal/terminos" },
        { title: "Política de Cookies", href: "/legal/cookies" },
      ]}
    />
  )
}
