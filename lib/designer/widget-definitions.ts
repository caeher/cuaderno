import type { BlockCategory, BlockNode, BlockStyle, BlockType, WidgetMeta } from "@/lib/domain/block-schema"
import { createBlockNode } from "@/lib/domain/block-schema"

export interface CategoryInfo {
  id: BlockCategory
  name: string
  description: string
}

export const WIDGET_CATEGORIES: CategoryInfo[] = [
  { id: "layout", name: "Estructura & Diseño", description: "Secciones, columnas, contenedores y separadores" },
  { id: "typography", name: "Texto & Títulos", description: "Encabezados, párrafos, citas y estadísticas" },
  { id: "media", name: "Medios & Visuales", description: "Imágenes, banners, videos y cajas con icono" },
  { id: "interactive", name: "Componentes Interactivos", description: "Botones, acordeones colapsables y avisos" },
  { id: "blog", name: "Blog & Dinámicos", description: "Caja de autor, suscripción y compartir" },
]

export const WIDGET_DEFINITIONS: Record<BlockType, WidgetMeta> = {
  // --- LAYOUT ---
  section: {
    type: "section",
    name: "Sección",
    description: "Contenedor principal para organizar bloques con fondo y espaciado",
    category: "layout",
    icon: "Layout",
    defaultProps: {
      isFluid: false,
    },
    defaultStyle: {
      padding: { top: "40px", right: "24px", bottom: "40px", left: "24px" },
      margin: { top: "0px", right: "auto", bottom: "0px", left: "auto" },
      maxWidth: "1100px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },
    defaultChildren: () => [
      createBlockNode("heading", { text: "Nueva Sección", level: 2 }, { textAlign: "left" }),
      createBlockNode("text", { text: "Añade aquí el contenido de tu sección..." }),
    ],
  },

  container: {
    type: "container",
    name: "Columnas / Flex",
    description: "Distribuye elementos en columnas horizontales o verticales",
    category: "layout",
    icon: "Columns",
    defaultProps: {
      columnsCount: 2,
    },
    defaultStyle: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "stretch",
      gap: "24px",
      padding: { top: "12px", right: "0px", bottom: "12px", left: "0px" },
    },
    defaultChildren: () => [
      createBlockNode(
        "section",
        { isFluid: true },
        {
          padding: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
          backgroundColor: "rgba(0, 0, 0, 0.02)",
          borderRadius: "12px",
          borderWidth: "1px",
          borderColor: "rgba(0, 0, 0, 0.08)",
        },
        [createBlockNode("heading", { text: "Columna 1", level: 3 }), createBlockNode("text", { text: "Contenido de la primera columna." })]
      ),
      createBlockNode(
        "section",
        { isFluid: true },
        {
          padding: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
          backgroundColor: "rgba(0, 0, 0, 0.02)",
          borderRadius: "12px",
          borderWidth: "1px",
          borderColor: "rgba(0, 0, 0, 0.08)",
        },
        [createBlockNode("heading", { text: "Columna 2", level: 3 }), createBlockNode("text", { text: "Contenido de la segunda columna." })]
      ),
    ],
  },

  grid: {
    type: "grid",
    name: "Cuadrícula (Grid)",
    description: "Grid responsivo automático de 2 a 4 columnas",
    category: "layout",
    icon: "Grid",
    defaultProps: {
      columns: 3,
    },
    defaultStyle: {
      display: "grid",
      gridColumns: 3,
      gap: "20px",
      padding: { top: "16px", right: "0px", bottom: "16px", left: "0px" },
    },
  },

  spacer: {
    type: "spacer",
    name: "Espaciador",
    description: "Añade separación vertical personalizada",
    category: "layout",
    icon: "MoveVertical",
    defaultProps: {
      height: "48px",
    },
    defaultStyle: {
      minHeight: "48px",
    },
  },

  divider: {
    type: "divider",
    name: "Separador de Línea",
    description: "Línea horizontal decorativa para separar contenidos",
    category: "layout",
    icon: "Minus",
    defaultProps: {
      styleType: "solid",
    },
    defaultStyle: {
      borderWidth: "1px",
      borderColor: "rgba(128, 128, 128, 0.25)",
      borderStyle: "solid",
      margin: { top: "24px", right: "0px", bottom: "24px", left: "0px" },
      width: "100%",
    },
  },

  // --- TYPOGRAPHY ---
  heading: {
    type: "heading",
    name: "Encabezado",
    description: "Títulos y subtítulos con jerarquía H1 a H6",
    category: "typography",
    icon: "Heading",
    defaultProps: {
      text: "Título del Bloque",
      level: 2,
    },
    defaultStyle: {
      fontFamily: "var(--font-serif)",
      fontSize: "32px",
      fontWeight: 600,
      lineHeight: "1.2",
      textAlign: "left",
      margin: { top: "8px", right: "0px", bottom: "8px", left: "0px" },
    },
  },

  text: {
    type: "text",
    name: "Párrafo de Texto",
    description: "Bloque de texto continuo o cuerpo de lectura",
    category: "typography",
    icon: "Type",
    defaultProps: {
      text: "Escribe aquí tu texto descriptivo. Puedes personalizar el tamaño de letra, color, interlineado y alineación.",
    },
    defaultStyle: {
      fontSize: "16px",
      fontWeight: 400,
      lineHeight: "1.7",
      textAlign: "left",
      color: "inherit",
      margin: { top: "4px", right: "0px", bottom: "12px", left: "0px" },
    },
  },

  quote: {
    type: "quote",
    name: "Cita Destacada",
    description: "Frase memorable o testimonio de autor",
    category: "typography",
    icon: "Quote",
    defaultProps: {
      quote: "El buen diseño no es cómo se ve, sino cómo funciona y qué emociones despierta en quien lo usa.",
      author: "Steve Jobs",
      title: "Cofundador de Apple",
    },
    defaultStyle: {
      fontFamily: "var(--font-serif)",
      fontSize: "20px",
      lineHeight: "1.6",
      padding: { top: "20px", right: "24px", bottom: "20px", left: "24px" },
      margin: { top: "16px", right: "0px", bottom: "16px", left: "0px" },
      borderWidth: "0px 0px 0px 4px",
      borderStyle: "solid",
      borderColor: "var(--primary)",
      backgroundColor: "rgba(0, 0, 0, 0.02)",
      borderRadius: "0px 12px 12px 0px",
    },
  },

  counter: {
    type: "counter",
    name: "Estadística / Contador",
    description: "Muestra métricas y números clave con etiquetas",
    category: "typography",
    icon: "Hash",
    defaultProps: {
      number: "10K+",
      label: "Lectores activos este mes",
      prefix: "",
      suffix: "",
    },
    defaultStyle: {
      textAlign: "center",
      padding: { top: "24px", right: "16px", bottom: "24px", left: "16px" },
      backgroundColor: "rgba(0, 0, 0, 0.02)",
      borderRadius: "12px",
      borderWidth: "1px",
      borderColor: "rgba(128, 128, 128, 0.15)",
    },
  },

  // --- MEDIA ---
  image: {
    type: "image",
    name: "Imagen",
    description: "Fotografía o ilustración con recorte, caption y borde",
    category: "media",
    icon: "Image",
    defaultProps: {
      src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&auto=format&fit=crop&q=80",
      alt: "Imagen descriptiva",
      caption: "Pie de foto descriptivo",
      aspectRatio: "16/9",
      objectFit: "cover",
    },
    defaultStyle: {
      borderRadius: "12px",
      boxShadow: "0 4px 20px -4px rgba(0, 0, 0, 0.1)",
      margin: { top: "12px", right: "0px", bottom: "12px", left: "0px" },
      width: "100%",
    },
  },

  gallery: {
    type: "gallery",
    name: "Galería de Fotos",
    description: "Mosaico de imágenes en grid",
    category: "media",
    icon: "Images",
    defaultProps: {
      images: [
        "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80",
      ],
      columns: 3,
      gap: "16px",
    },
    defaultStyle: {
      margin: { top: "16px", right: "0px", bottom: "16px", left: "0px" },
    },
  },

  video: {
    type: "video",
    name: "Video Incrustado",
    description: "Reproductor para YouTube, Vimeo o video MP4",
    category: "media",
    icon: "Video",
    defaultProps: {
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      title: "Video explicativo",
      aspectRatio: "16/9",
    },
    defaultStyle: {
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "0 8px 30px -6px rgba(0, 0, 0, 0.15)",
      margin: { top: "16px", right: "0px", bottom: "16px", left: "0px" },
    },
  },

  banner: {
    type: "banner",
    name: "Hero Banner",
    description: "Encabezado visual con fondo, título y botón CTA",
    category: "media",
    icon: "Maximize",
    defaultProps: {
      title: "Explora Nuevas Historias",
      subtitle: "Un espacio de reflexión, diseño y notas de proceso escritas con honestidad.",
      buttonText: "Empezar a leer",
      buttonUrl: "#",
      backgroundImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&auto=format&fit=crop&q=80",
      overlayColor: "rgba(0, 0, 0, 0.6)",
    },
    defaultStyle: {
      padding: { top: "80px", right: "32px", bottom: "80px", left: "32px" },
      borderRadius: "16px",
      textAlign: "center",
      color: "#ffffff",
      margin: { top: "16px", right: "0px", bottom: "24px", left: "0px" },
    },
  },

  icon_box: {
    type: "icon_box",
    name: "Caja con Icono",
    description: "Tarjeta de característica con icono, título y descripción",
    category: "media",
    icon: "Sparkles",
    defaultProps: {
      icon: "Sparkles",
      title: "Diseño Enfocado",
      description: "Creamos experiencias pensadas en la legibilidad y la sencillez para el lector.",
    },
    defaultStyle: {
      padding: { top: "24px", right: "24px", bottom: "24px", left: "24px" },
      backgroundColor: "rgba(0, 0, 0, 0.02)",
      borderRadius: "12px",
      borderWidth: "1px",
      borderColor: "rgba(128, 128, 128, 0.15)",
      textAlign: "left",
    },
  },

  // --- INTERACTIVE ---
  button: {
    type: "button",
    name: "Botón de Acción (CTA)",
    description: "Enlace llamativo para redirigir a los lectores",
    category: "interactive",
    icon: "MousePointerClick",
    defaultProps: {
      text: "Hacer Clic Aquí",
      url: "#",
      variant: "primary",
      size: "default",
      openInNewTab: false,
      iconName: "ArrowRight",
    },
    defaultStyle: {
      textAlign: "left",
      margin: { top: "8px", right: "0px", bottom: "8px", left: "0px" },
    },
  },

  accordion: {
    type: "accordion",
    name: "Acordeón / Preguntas Frecuentes",
    description: "Paneles desplegables para ahorrar espacio",
    category: "interactive",
    icon: "HelpCircle",
    defaultProps: {
      items: [
        { id: "acc_1", title: "¿Cómo funciona este diseñador de bloques?", content: "Puedes arrastrar y soltar bloques, ajustar estilos desde el panel lateral y ver cambios en tiempo real." },
        { id: "acc_2", title: "¿Es compatible con dispositivos móviles?", content: "Sí, todos los bloques cuentan con soporte responsivo automático para tabletas y teléfonos." },
        { id: "acc_3", title: "¿Puedo cambiar entre editor Notion y Elementor?", content: "Absolutamente, puedes alternar según tus necesidades creativas para cada artículo." },
      ],
    },
    defaultStyle: {
      margin: { top: "16px", right: "0px", bottom: "16px", left: "0px" },
    },
  },

  tabs: {
    type: "tabs",
    name: "Pestañas (Tabs)",
    description: "Contenido organizado en solapas alternables",
    category: "interactive",
    icon: "Layers",
    defaultProps: {
      tabs: [
        { id: "tab_1", label: "General", content: "Información general sobre el tema tratado." },
        { id: "tab_2", label: "Detalles", content: "Especificaciones técnicas y metodología paso a paso." },
        { id: "tab_3", label: "Recursos", content: "Enlaces útiles, lecturas recomendadas y descargables." },
      ],
    },
    defaultStyle: {
      margin: { top: "16px", right: "0px", bottom: "16px", left: "0px" },
    },
  },

  callout: {
    type: "callout",
    name: "Cuadro Destacado / Alerta",
    description: "Caja de aviso informativo, tip o advertencia",
    category: "interactive",
    icon: "Info",
    defaultProps: {
      type: "tip",
      title: "Nota importante",
      message: "Recuerda que los cambios en el diseño se aplican de forma instantánea al publicar tu post.",
    },
    defaultStyle: {
      padding: { top: "16px", right: "20px", bottom: "16px", left: "20px" },
      borderRadius: "12px",
      margin: { top: "12px", right: "0px", bottom: "12px", left: "0px" },
    },
  },

  // --- BLOG & DYNAMIC ---
  post_grid: {
    type: "post_grid",
    name: "Artículos Relacionados",
    description: "Muestra tarjetas de posts recomendados o filtrados",
    category: "blog",
    icon: "BookOpen",
    defaultProps: {
      count: 2,
      showExcerpt: true,
      showAuthor: true,
      title: "Artículos recomendados para seguir leyendo",
    },
    defaultStyle: {
      margin: { top: "28px", right: "0px", bottom: "28px", left: "0px" },
    },
  },

  author_box: {
    type: "author_box",
    name: "Tarjeta de Autor",
    description: "Biografía, foto y redes del creador del contenido",
    category: "blog",
    icon: "User",
    defaultProps: {
      name: "Elena Martí",
      role: "Autora & Diseñadora de Producto",
      bio: "Escribe sobre arquitectura de información, sistemas de diseño y procesos creativos.",
      avatarUrl: "/placeholder.svg",
      socialLinks: { twitter: "elenamarti", website: "https://elenamarti.com" },
    },
    defaultStyle: {
      padding: { top: "24px", right: "24px", bottom: "24px", left: "24px" },
      backgroundColor: "rgba(0, 0, 0, 0.02)",
      borderRadius: "16px",
      borderWidth: "1px",
      borderColor: "rgba(128, 128, 128, 0.15)",
      margin: { top: "32px", right: "0px", bottom: "24px", left: "0px" },
    },
  },

  newsletter_box: {
    type: "newsletter_box",
    name: "Caja de Suscripción (Newsletter)",
    description: "Llamada a la acción para captar lectores y correos",
    category: "blog",
    icon: "Mail",
    defaultProps: {
      title: "Suscríbete al Cuaderno Semanal",
      description: "Recibe cada domingo un ensayo corto sobre diseño, tecnología y notas de producción.",
      buttonText: "Suscribirme",
      placeholder: "tu-email@ejemplo.com",
    },
    defaultStyle: {
      padding: { top: "36px", right: "28px", bottom: "36px", left: "28px" },
      backgroundColor: "rgba(0, 0, 0, 0.03)",
      borderRadius: "16px",
      borderWidth: "1px",
      borderColor: "rgba(128, 128, 128, 0.18)",
      textAlign: "center",
      margin: { top: "32px", right: "0px", bottom: "32px", left: "0px" },
    },
  },

  social_share: {
    type: "social_share",
    name: "Compartir en Redes",
    description: "Botones para difundir el artículo en redes sociales",
    category: "blog",
    icon: "Share2",
    defaultProps: {
      label: "¿Te ha gustado este artículo? Compártelo con tu red:",
      platforms: ["twitter", "linkedin", "facebook", "whatsapp", "copy"],
    },
    defaultStyle: {
      padding: { top: "16px", right: "0px", bottom: "16px", left: "0px" },
      margin: { top: "24px", right: "0px", bottom: "24px", left: "0px" },
    },
  },

  post_content: {
    type: "post_content",
    name: "Cuerpo del Artículo (Dinámico)",
    description: "Espacio donde se renderiza el contenido editorial redactado del post",
    category: "blog",
    icon: "FileText",
    defaultProps: {
      placeholderText: "El contenido editorial del artículo se inyectará automáticamente aquí en tiempo de render.",
    },
    defaultStyle: {
      fontSize: "17px",
      lineHeight: "1.75",
      margin: { top: "16px", right: "0px", bottom: "24px", left: "0px" },
    },
  },

  post_title: {
    type: "post_title",
    name: "Título del Post (Dinámico)",
    description: "Muestra el título del artículo actual con jerarquía visual",
    category: "blog",
    icon: "Heading1",
    defaultProps: {
      level: 1,
    },
    defaultStyle: {
      fontFamily: "var(--font-serif)",
      fontSize: "40px",
      fontWeight: 700,
      lineHeight: "1.15",
      textAlign: "left",
      margin: { top: "12px", right: "0px", bottom: "16px", left: "0px" },
    },
  },

  post_meta: {
    type: "post_meta",
    name: "Metadatos del Post (Dinámico)",
    description: "Fecha de publicación, autor, tiempo de lectura y categoría",
    category: "blog",
    icon: "Calendar",
    defaultProps: {
      showAuthor: true,
      showDate: true,
      showReadingTime: true,
      showCategory: true,
    },
    defaultStyle: {
      padding: { top: "8px", right: "0px", bottom: "12px", left: "0px" },
      margin: { top: "4px", right: "0px", bottom: "16px", left: "0px" },
    },
  },

  post_cover: {
    type: "post_cover",
    name: "Imagen de Portada (Dinámica)",
    description: "Muestra la fotografía destacada asociada al artículo",
    category: "blog",
    icon: "ImagePlus",
    defaultProps: {
      aspectRatio: "16/9",
      rounded: true,
    },
    defaultStyle: {
      borderRadius: "16px",
      margin: { top: "16px", right: "0px", bottom: "24px", left: "0px" },
      width: "100%",
    },
  },

  post_takeaways: {
    type: "post_takeaways",
    name: "Puntos Clave / Resumen (Dinámico)",
    description: "Caja de resumen ejecutivo para lectores rápidos y motores de IA",
    category: "blog",
    icon: "Sparkles",
    defaultProps: {
      title: "Resumen ejecutivo",
    },
    defaultStyle: {
      padding: { top: "20px", right: "24px", bottom: "20px", left: "24px" },
      backgroundColor: "rgba(59, 130, 246, 0.05)",
      borderRadius: "14px",
      borderWidth: "1px",
      borderColor: "rgba(59, 130, 246, 0.2)",
      margin: { top: "20px", right: "0px", bottom: "20px", left: "0px" },
    },
  },

  post_action_bar: {
    type: "post_action_bar",
    name: "Barra de Acciones / Likes (Dinámica)",
    description: "Botón de Me Gusta, contador de comentarios y compartir",
    category: "blog",
    icon: "Heart",
    defaultProps: {
      showLikes: true,
      showCommentsCount: true,
      showShare: true,
    },
    defaultStyle: {
      padding: { top: "16px", right: "0px", bottom: "16px", left: "0px" },
      margin: { top: "24px", right: "0px", bottom: "24px", left: "0px" },
    },
  },

  comments_section: {
    type: "comments_section",
    name: "Sección de Comentarios (Dinámica)",
    description: "Lista de comentarios del artículo y formulario interactivo",
    category: "blog",
    icon: "MessageSquare",
    defaultProps: {
      title: "Comentarios",
    },
    defaultStyle: {
      padding: { top: "28px", right: "0px", bottom: "28px", left: "0px" },
      margin: { top: "32px", right: "0px", bottom: "32px", left: "0px" },
    },
  },

  blog_post_grid: {
    type: "blog_post_grid",
    name: "Listado de Posts del Blog (Dinámico)",
    description: "Cuadrícula o feed de artículos publicados del tenant",
    category: "blog",
    icon: "LayoutList",
    defaultProps: {
      columns: 2,
      showExcerpt: true,
      showDate: true,
      limit: 10,
    },
    defaultStyle: {
      margin: { top: "24px", right: "0px", bottom: "32px", left: "0px" },
    },
  },

  category_filter: {
    type: "category_filter",
    name: "Filtro de Categorías (Dinámico)",
    description: "Barra de navegación de etiquetas y categorías del blog",
    category: "blog",
    icon: "Tags",
    defaultProps: {
      showCount: true,
    },
    defaultStyle: {
      padding: { top: "12px", right: "0px", bottom: "12px", left: "0px" },
      margin: { top: "12px", right: "0px", bottom: "20px", left: "0px" },
    },
  },

  site_navbar: {
    type: "site_navbar",
    name: "Barra de Navegación (Header)",
    description: "Logo del tenant, enlaces principales y selector de tema",
    category: "layout",
    icon: "Compass",
    defaultProps: {
      showSearch: true,
      showThemeToggle: true,
    },
    defaultStyle: {
      padding: { top: "16px", right: "24px", bottom: "16px", left: "24px" },
      backgroundColor: "var(--background)",
      borderWidth: "0px 0px 1px 0px",
      borderColor: "var(--border)",
      borderStyle: "solid",
    },
  },

  site_footer: {
    type: "site_footer",
    name: "Pie de Página (Footer)",
    description: "Derechos reservados, enlaces legales y redes sociales del blog",
    category: "layout",
    icon: "PanelBottom",
    defaultProps: {
      copyrightText: "Todos los derechos reservados",
      showLegalLinks: true,
    },
    defaultStyle: {
      padding: { top: "36px", right: "24px", bottom: "36px", left: "24px" },
      backgroundColor: "rgba(0, 0, 0, 0.02)",
      borderWidth: "1px 0px 0px 0px",
      borderColor: "var(--border)",
      borderStyle: "solid",
      margin: { top: "48px", right: "0px", bottom: "0px", left: "0px" },
    },
  },
}
