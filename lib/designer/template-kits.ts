import { createBlockNode } from "@/lib/domain/block-schema"
import type { BlockNode } from "@/lib/domain/block-schema"

export interface TemplateKit {
  id: string
  name: string
  description: string
  thumbnailUrl?: string
  category: "hero" | "features" | "content" | "cta" | "faq"
  createBlocks: () => BlockNode[]
}

export const TEMPLATE_KITS: TemplateKit[] = [
  {
    id: "hero-modern",
    name: "Cabecera Hero Moderna con CTA",
    description: "Titular llamativo, texto introductorio y botón de acción principal.",
    category: "hero",
    createBlocks: () => [
      createBlockNode(
        "section",
        { isFluid: false },
        {
          padding: { top: "48px", right: "24px", bottom: "48px", left: "24px" },
          backgroundColor: "rgba(0, 0, 0, 0.02)",
          borderRadius: "16px",
          borderWidth: "1px",
          borderColor: "rgba(128, 128, 128, 0.15)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          textAlign: "center",
        },
        [
          createBlockNode(
            "heading",
            { text: "El Futuro del Diseño Digital en 2026", level: 1 },
            { fontSize: "38px", fontWeight: 700, textAlign: "center" }
          ),
          createBlockNode(
            "text",
            {
              text: "Una mirada profunda a cómo las interfaces adaptables y la composición visual modular están transformando la manera en que consumimos contenidos.",
            },
            { fontSize: "18px", lineHeight: "1.6", color: "var(--muted-foreground)", textAlign: "center" }
          ),
          createBlockNode(
            "container",
            {},
            { display: "flex", justifyContent: "center", gap: "12px", padding: { top: "8px" } },
            [
              createBlockNode(
                "button",
                { text: "Continuar Leyendo", url: "#", variant: "primary", iconName: "ArrowDown" },
                {}
              ),
            ]
          ),
        ]
      ),
    ],
  },

  {
    id: "two-column-story",
    name: "2 Columnas: Imagen y Reflexión",
    description: "Estructura equilibrada con fotografía a la izquierda y narrativa a la derecha.",
    category: "content",
    createBlocks: () => [
      createBlockNode(
        "container",
        {},
        {
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: "32px",
          padding: { top: "32px", bottom: "32px" },
        },
        [
          createBlockNode(
            "image",
            {
              src: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80",
              alt: "Espacio de trabajo y creatividad",
              aspectRatio: "4/3",
            },
            { borderRadius: "12px", width: "100%" }
          ),
          createBlockNode(
            "section",
            { isFluid: true },
            { display: "flex", flexDirection: "column", gap: "12px" },
            [
              createBlockNode("heading", { text: "Pensar antes de construir", level: 2 }, { fontSize: "28px" }),
              createBlockNode("text", {
                text: "Cuando el proceso creativo se apoya en una estructura visual modular, los creadores tienen la libertad de experimentar sin miedo a desordenar la jerarquía.",
              }),
              createBlockNode("quote", {
                quote: "La simplicidad consiste en restar lo obvio y añadir lo significativo.",
                author: "John Maeda",
              }),
            ]
          ),
        ]
      ),
    ],
  },

  {
    id: "three-features-grid",
    name: "Cuadrícula de 3 Puntos Clave",
    description: "Tres tarjetas con icono para resumir aprendizajes, pasos o conclusiones.",
    category: "features",
    createBlocks: () => [
      createBlockNode(
        "grid",
        { columns: 3 },
        { display: "grid", gridColumns: 3, gap: "20px", padding: { top: "24px", bottom: "24px" } },
        [
          createBlockNode("icon_box", {
            icon: "Zap",
            title: "Velocidad Visual",
            description: "Modifica estilos, tipografías y márgenes sin recompilar ni esperar.",
          }),
          createBlockNode("icon_box", {
            icon: "Smartphone",
            title: "100% Responsivo",
            description: "Previsualiza cómo se adapta cada bloque a móviles y tabletas al instante.",
          }),
          createBlockNode("icon_box", {
            icon: "CheckCircle",
            title: "Listo para Producción",
            description: "Genera HTML limpio y optimizado para buscadores (SEO) y lectores.",
          }),
        ]
      ),
    ],
  },

  {
    id: "newsletter-cta-banner",
    name: "Caja de Suscripción al Boletín",
    description: "Banner para invitar a los lectores a unirse a tu lista de correo.",
    category: "cta",
    createBlocks: () => [
      createBlockNode("newsletter_box", {
        title: "¿Te ha inspirado esta lectura?",
        description: "Suscríbete para recibir nuevas reflexiones y guías de diseño directamente en tu buzón cada semana.",
        buttonText: "Unirme gratis",
        placeholder: "tu-correo@ejemplo.com",
      }),
    ],
  },

  {
    id: "faq-section",
    name: "Sección de Preguntas Frecuentes",
    description: "Título centrado con acordeón de dudas comunes.",
    category: "faq",
    createBlocks: () => [
      createBlockNode(
        "section",
        {},
        { padding: { top: "32px", bottom: "32px" }, display: "flex", flexDirection: "column", gap: "16px" },
        [
          createBlockNode(
            "heading",
            { text: "Preguntas Frecuentes", level: 2 },
            { textAlign: "center", fontSize: "30px" }
          ),
          createBlockNode(
            "text",
            { text: "Todo lo que necesitas saber antes de dar el siguiente paso." },
            { textAlign: "center", color: "var(--muted-foreground)" }
          ),
          createBlockNode("accordion", {
            items: [
              {
                id: "faq_1",
                title: "¿Puedo personalizar los colores y tipografías de cada bloque?",
                content: "Sí, desde la pestaña 'Estilo' del panel lateral puedes ajustar fuentes, tamaños, colores de fondo y bordes.",
              },
              {
                id: "faq_2",
                title: "¿Cómo se visualiza en dispositivos móviles?",
                content: "El diseñador incluye un conmutador responsivo para previsualizar el diseño en Desktop, Tablet y Móvil.",
              },
              {
                id: "faq_3",
                title: "¿Se conservan mis artículos anteriores?",
                content: "Totalmente. El sistema es compatible tanto con el formato tradicional de texto como con los bloques visuales.",
              },
            ],
          }),
        ]
      ),
    ],
  },
]
