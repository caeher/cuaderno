/**
 * Infrastructure Layer — Mock Database
 *
 * In-memory data standing in for a real database. Only this file
 * (and the repositories that read it) knows the data is mocked —
 * everything above the repository interfaces is unaware.
 */

import type { Category, Comment, Post, Tag, User } from "@/lib/domain/entities"

export const MOCK_CATEGORIES: Category[] = [
  {
    id: "c1",
    slug: "diseno-producto",
    name: "Diseño & Producto",
    description: "Artículos sobre UX, sistemas de diseño y metodología de producto.",
    color: "#3b82f6",
    icon: "palette",
  },
  {
    id: "c2",
    slug: "ingenieria",
    name: "Ingeniería de Software",
    description: "Arquitectura de software, TypeScript, rendimiento y decisiones técnicas.",
    color: "#8b5cf6",
    icon: "code",
  },
  {
    id: "c3",
    slug: "cocina",
    name: "Gastronomía & Recetas",
    description: "Platos de temporada, técnicas culinarias y notas de cocina.",
    color: "#f59e0b",
    icon: "utensils",
  },
  {
    id: "c4",
    slug: "running",
    name: "Deporte & Trail Running",
    description: "Entrenamiento, carreras de montaña, nutrición y resistencia.",
    color: "#10b981",
    icon: "activity",
  },
  {
    id: "c5",
    slug: "general",
    name: "General & Opinión",
    description: "Ensayos, reflexiones, notas de proceso y cultura.",
    color: "#64748b",
    icon: "bookmark",
  },
]

export const MOCK_USERS: User[] = [
  {
    id: "u1",
    username: "elena-marti",
    name: "Elena Martí",
    email: "elena@ejemplo.com",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    coverUrl: "/placeholder.svg?height=480&width=1600",
    bio: "Escribo sobre diseño de producto, sistemas y por qué las cosas simples cuestan tanto. Antes en dos startups que ya no existen.",
    tagline: "Diseño, producto y notas de proceso",
    location: "Barcelona, España",
    socials: { website: "https://elenamarti.com", twitter: "elenamarti" },
    role: "owner",
    joinedAt: "2022-03-14",
    postCount: 6,
    followerCount: 2840,
    timezone: "Europe/Madrid",
  },
  {
    id: "u2",
    username: "tomas-rivas",
    name: "Tomás Rivas",
    email: "tomas@ejemplo.com",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    coverUrl: "/placeholder.svg?height=480&width=1600",
    bio: "Ingeniero de software. Escribo sobre TypeScript, arquitectura y las decisiones que nadie documenta hasta que es tarde.",
    tagline: "Notas de ingeniería y arquitectura",
    location: "Ciudad de México",
    socials: { website: "https://tomasrivas.dev", github: "tomasrivas" },
    role: "owner",
    joinedAt: "2021-11-02",
    postCount: 5,
    followerCount: 5120,
    timezone: "America/Mexico_City",
  },
  {
    id: "u3",
    username: "sofia-vega",
    name: "Sofía Vega",
    email: "sofia@ejemplo.com",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    coverUrl: "/placeholder.svg?height=480&width=1600",
    bio: "Cocino, fotografío y a veces escribo sobre las dos cosas a la vez. Este blog es mi cuaderno de cocina público.",
    tagline: "Cocina de temporada y memoria",
    location: "Oaxaca, México",
    socials: { website: "https://cocinadesofia.com" },
    role: "owner",
    joinedAt: "2023-01-20",
    postCount: 4,
    followerCount: 1690,
    timezone: "America/Mexico_City",
  },
  {
    id: "u4",
    username: "javier-costa",
    name: "Javier Costa",
    email: "javier@ejemplo.com",
    avatarUrl: "/placeholder.svg?height=200&width=200",
    coverUrl: "/placeholder.svg?height=480&width=1600",
    bio: "Corredor de montaña de fin de semana. Documento entrenamientos, lesiones y la lenta obsesión de correr distancias largas.",
    tagline: "Ultramaratones y entrenamiento honesto",
    location: "Santiago, Chile",
    socials: { website: "https://javiercorre.cl" },
    role: "owner",
    joinedAt: "2022-08-09",
    postCount: 3,
    followerCount: 980,
    timezone: "America/Santiago",
  },
]

export const MOCK_TAGS: Tag[] = [
  { id: "t1", slug: "diseno", name: "Diseño", color: "#3b82f6" },
  { id: "t2", slug: "producto", name: "Producto", color: "#0ea5e9" },
  { id: "t3", slug: "ingenieria", name: "Ingeniería", color: "#8b5cf6" },
  { id: "t4", slug: "typescript", name: "TypeScript", color: "#3178c6" },
  { id: "t5", slug: "cocina", name: "Cocina", color: "#f59e0b" },
  { id: "t6", slug: "temporada", name: "Temporada", color: "#eab308" },
  { id: "t7", slug: "running", name: "Running", color: "#10b981" },
  { id: "t8", slug: "entrenamiento", name: "Entrenamiento", color: "#14b8a6" },
  { id: "t9", slug: "carrera", name: "Carrera profesional", color: "#6366f1" },
  { id: "t10", slug: "sistemas", name: "Sistemas de diseño", color: "#ec4899" },
]

const LOREM = `La primera versión nunca es la correcta, y está bien. Lo que importa es tener un circuito de retroalimentación lo bastante corto para no enamorarse de una decisión antes de probarla contra la realidad.

Cuando empezamos este proceso, la tentación fue resolver todo de una vez: la arquitectura, el sistema visual, el tono de voz. En la práctica, avanzar en paralelo en tres frentes distintos solo generó más preguntas sin respuesta. Decidimos secuenciar: primero la estructura, después la superficie.

Lo que sigue es un resumen de las decisiones que tomamos, por qué las tomamos, y en qué punto tuvimos que revertir alguna de ellas porque el costo de mantenerlas superaba el beneficio original.

## El problema real

No era un problema de herramientas. Era un problema de claridad: nadie en el equipo podía explicar en una frase qué hacía distinto a este producto de los otros cinco que ya existían en el mercado. Eso, más que cualquier decisión técnica, fue lo que retrasó todo.

## Lo que cambiamos

Redujimos el alcance a la mitad. No porque la ambición estuviera mal, sino porque construir la mitad de las cosas bien vale más que construir todas las cosas a medias. Esto suena obvio escrito así, pero decidirlo en el momento — con presión de fechas y expectativas ya comunicadas — es otra historia.

## Lo que aprendimos

La velocidad no viene de escribir más código más rápido. Viene de tomar menos decisiones reversibles como si fueran irreversibles. Cuanto más barato es deshacer una decisión, más rápido puedes tomarla — y eso, multiplicado por cien decisiones pequeñas al día, es lo que separa a los equipos que avanzan de los que solo están ocupados.`

const RECIPE_LOREM = `Esta receta nació de una nevera casi vacía y una necesidad urgente de comer algo que no fuera arroz con huevo. Con el tiempo se convirtió en la receta que hago cuando no tengo ganas de pensar pero sí de comer bien.

## Ingredientes

- 2 tazas de caldo de verduras, idealmente casero
- Una cebolla mediana, en brunoise fina
- Tres dientes de ajo, machacados, no picados
- El jugo de un limón, sin las semillas
- Hierbas frescas de temporada — lo que tengas a mano funciona

## El proceso

No hay que apurar el sofrito. Cinco minutos a fuego bajo transforman la cebolla de algo agresivo a algo dulce, y esa base dulce es la que sostiene todo el plato después. Si el fuego está alto, estás cocinando para el reloj, no para el sabor.

Una vez que el fondo está listo, todo lo demás es acomodar capas. Añade el líquido, deja que hierva apenas, y baja el fuego de inmediato. La paciencia aquí no es una virtud abstracta — es literalmente el ingrediente que hace que el plato funcione.

## Notas de temporada

En invierno cambio las hierbas frescas por secas y agrego una cucharada extra de aceite al final, fuera del fuego, para compensar el frío del ambiente. En verano hago lo opuesto: menos grasa, más acidez, servido casi frío.`

const RUNNING_LOREM = `Nadie te avisa que la parte más difícil de correr cincuenta kilómetros no es la distancia — es la hora tres, cuando la novedad ya se fue y la meta todavía está lejísimos. Ahí es donde se decide la carrera, mucho antes de la línea de llegada.

## La preparación que sí importa

Entrené doce semanas para esto, pero las últimas cuatro fueron las únicas que realmente contaron. Antes de eso estaba construyendo una base que ni siquiera iba a usar completa el día de la carrera — el cuerpo necesita ese colchón, aunque el plan de entrenamiento específico llegue después.

## Lo que salió mal

En el kilómetro 34 tuve un calambre que no había sentido nunca en entrenamiento. La diferencia entre entrenar en llano y correr con desnivel acumulado de dos mil metros se paga tarde o temprano, y a mí me tocó pagarla ahí, sola, sin nadie cerca durante casi diez minutos.

## Lo que me llevo

La meta no se cruza con las piernas. Se cruza con la cabeza que decidió, catorce kilómetros antes, que parar no era una opción real. Todo el entrenamiento físico es, en el fondo, entrenamiento para tener esa conversación contigo mismo y ganarla.`

export const MOCK_POSTS: Post[] = [
  {
    id: "p1",
    authorId: "u1",
    categoryId: "c1",
    title: "Por qué rediseñamos nuestro sistema de diseño desde cero",
    slug: "rediseno-sistema-diseno-desde-cero",
    excerpt:
      "Después de tres años de parches, decidimos tirar el sistema anterior. Esto es lo que aprendimos sobre decisiones reversibles y costo de mantenimiento.",
    content: LOREM,
    coverUrl: "/placeholder.svg?height=630&width=1200",
    tags: ["diseno", "sistemas", "producto"],
    status: "published",
    publishedAt: "2024-11-02",
    updatedAt: "2024-11-02",
    readingTimeMinutes: 7,
    views: 12400,
    likes: 412,
    comments: 3,
    featured: true,
  },
  {
    id: "p2",
    authorId: "u1",
    categoryId: "c1",
    title: "El costo invisible de las decisiones de diseño reversibles",
    slug: "costo-invisible-decisiones-reversibles",
    excerpt: "Tratamos cada decisión como si fuera permanente. La mayoría no lo es, y eso cambia todo el cálculo.",
    content: LOREM,
    coverUrl: "/placeholder.svg?height=630&width=1200",
    tags: ["diseno", "producto"],
    status: "published",
    publishedAt: "2024-09-18",
    updatedAt: "2024-09-18",
    readingTimeMinutes: 5,
    views: 8210,
    likes: 298,
    comments: 1,
    featured: false,
  },
  {
    id: "p3",
    authorId: "u1",
    categoryId: "c1",
    title: "Cómo documentamos decisiones sin frenar el equipo",
    slug: "documentar-decisiones-sin-frenar-equipo",
    excerpt: "Un ADR de una página vale más que un wiki de cincuenta que nadie lee.",
    content: LOREM,
    coverUrl: null,
    tags: ["producto", "sistemas"],
    status: "published",
    publishedAt: "2024-07-05",
    updatedAt: "2024-07-05",
    readingTimeMinutes: 4,
    views: 5100,
    likes: 156,
    comments: 0,
    featured: false,
  },
  {
    id: "p4",
    authorId: "u1",
    categoryId: "c1",
    title: "Notas sobre la próxima versión de nuestros componentes",
    slug: "notas-proxima-version-componentes",
    excerpt: "Un borrador con lo que estamos probando internamente antes de anunciarlo.",
    content: LOREM,
    coverUrl: "/placeholder.svg?height=630&width=1200",
    tags: ["diseno", "sistemas"],
    status: "draft",
    publishedAt: null,
    updatedAt: "2025-01-11",
    readingTimeMinutes: 6,
    views: 0,
    likes: 0,
    comments: 0,
    featured: false,
  },
  {
    id: "p5",
    authorId: "u2",
    categoryId: "c2",
    title: "TypeScript avanzado: tipos condicionales que sí vas a usar",
    slug: "typescript-tipos-condicionales-que-vas-a-usar",
    excerpt: "Nada de teoría abstracta. Tres patrones de tipos condicionales que resolví en producción esta semana.",
    content: LOREM,
    coverUrl: "/placeholder.svg?height=480&width=1600",
    tags: ["typescript", "ingenieria"],
    status: "published",
    publishedAt: "2024-12-14",
    updatedAt: "2024-12-14",
    readingTimeMinutes: 9,
    views: 21300,
    likes: 891,
    comments: 4,
    featured: true,
  },
  {
    id: "p6",
    authorId: "u2",
    categoryId: "c2",
    title: "La arquitectura que elegimos y la que descartamos",
    slug: "arquitectura-elegida-y-descartada",
    excerpt: "Evaluamos cuatro enfoques de arquitectura en dos semanas. Documentamos por qué ganó el más aburrido.",
    content: LOREM,
    coverUrl: "/placeholder.svg?height=630&width=1200",
    tags: ["ingenieria", "sistemas"],
    status: "published",
    publishedAt: "2024-10-22",
    updatedAt: "2024-10-22",
    readingTimeMinutes: 8,
    views: 14700,
    likes: 623,
    comments: 2,
    featured: false,
  },
  {
    id: "p7",
    authorId: "u2",
    categoryId: "c2",
    title: "Cinco años escribiendo código en producción: lo que cambiaría",
    slug: "cinco-anos-codigo-produccion",
    excerpt: "Una retrospectiva honesta sobre decisiones técnicas que hoy tomaría distinto.",
    content: LOREM,
    coverUrl: null,
    tags: ["carrera", "ingenieria"],
    status: "published",
    publishedAt: "2024-05-30",
    updatedAt: "2024-05-30",
    readingTimeMinutes: 6,
    views: 9800,
    likes: 445,
    comments: 1,
    featured: false,
  },
  {
    id: "p8",
    authorId: "u2",
    categoryId: "c2",
    title: "Borrador: migrar de REST a un enfoque tipado end-to-end",
    slug: "borrador-migrar-rest-tipado-end-to-end",
    excerpt: "Notas de trabajo en progreso, sin pulir todavía.",
    content: LOREM,
    coverUrl: "/placeholder.svg?height=480&width=1600",
    tags: ["typescript", "ingenieria"],
    status: "scheduled",
    publishedAt: "2025-02-20",
    updatedAt: "2025-01-15",
    readingTimeMinutes: 10,
    views: 0,
    likes: 0,
    comments: 0,
    featured: false,
  },
  {
    id: "p9",
    authorId: "u3",
    categoryId: "c3",
    title: "Sopa de otoño con lo que sobró de la semana",
    slug: "sopa-otono-con-lo-que-sobro",
    excerpt: "La receta que hago cuando la nevera está casi vacía y no quiero pedir comida a domicilio.",
    content: RECIPE_LOREM,
    coverUrl: "/placeholder.svg?height=480&width=1600",
    tags: ["cocina", "temporada"],
    status: "published",
    publishedAt: "2024-11-20",
    updatedAt: "2024-11-20",
    readingTimeMinutes: 5,
    views: 7600,
    likes: 512,
    comments: 6,
    featured: true,
  },
  {
    id: "p10",
    authorId: "u3",
    categoryId: "c3",
    title: "Cómo guardo hierbas frescas para que duren tres semanas",
    slug: "guardar-hierbas-frescas-tres-semanas",
    excerpt: "El método que aprendí de mi abuela y que nadie me creyó hasta que lo probaron.",
    content: RECIPE_LOREM,
    coverUrl: "/placeholder.svg?height=480&width=1600",
    tags: ["cocina"],
    status: "published",
    publishedAt: "2024-09-02",
    updatedAt: "2024-09-02",
    readingTimeMinutes: 3,
    views: 4300,
    likes: 289,
    comments: 2,
    featured: false,
  },
  {
    id: "p11",
    authorId: "u3",
    categoryId: "c3",
    title: "El plato que cocino cuando extraño mi casa",
    slug: "plato-que-cocino-cuando-extrano-mi-casa",
    excerpt: "Un ensayo corto sobre memoria, migración y una receta de tres ingredientes.",
    content: RECIPE_LOREM,
    coverUrl: null,
    tags: ["cocina", "temporada"],
    status: "published",
    publishedAt: "2024-06-11",
    updatedAt: "2024-06-11",
    readingTimeMinutes: 4,
    views: 6100,
    likes: 401,
    comments: 3,
    featured: false,
  },
  {
    id: "p12",
    authorId: "u3",
    categoryId: "c3",
    title: "Borrador: menú de temporada para diciembre",
    slug: "borrador-menu-temporada-diciembre",
    excerpt: "Ideas sueltas todavía sin fotos.",
    content: RECIPE_LOREM,
    coverUrl: null,
    tags: ["cocina", "temporada"],
    status: "draft",
    publishedAt: null,
    updatedAt: "2025-01-08",
    readingTimeMinutes: 5,
    views: 0,
    likes: 0,
    comments: 0,
    featured: false,
  },
  {
    id: "p13",
    authorId: "u4",
    categoryId: "c4",
    title: "Cincuenta kilómetros, un calambre y la conversación que gané",
    slug: "cincuenta-kilometros-calambre-conversacion",
    excerpt: "Crónica de mi primer ultra de montaña, incluyendo la parte donde casi me rindo.",
    content: RUNNING_LOREM,
    coverUrl: "/placeholder.svg?height=480&width=1600",
    tags: ["running", "entrenamiento"],
    status: "published",
    publishedAt: "2024-12-01",
    updatedAt: "2024-12-01",
    readingTimeMinutes: 8,
    views: 5400,
    likes: 334,
    comments: 5,
    featured: true,
  },
  {
    id: "p14",
    authorId: "u4",
    categoryId: "c4",
    title: "Doce semanas de entrenamiento, resumidas sin filtro",
    slug: "doce-semanas-entrenamiento-sin-filtro",
    excerpt: "Todo lo que salió del plan original, y lo que hice al respecto.",
    content: RUNNING_LOREM,
    coverUrl: "/placeholder.svg?height=480&width=1600",
    tags: ["entrenamiento", "running"],
    status: "published",
    publishedAt: "2024-10-09",
    updatedAt: "2024-10-09",
    readingTimeMinutes: 6,
    views: 3200,
    likes: 210,
    comments: 1,
    featured: false,
  },
  {
    id: "p15",
    authorId: "u4",
    categoryId: "c4",
    title: "Por qué corro distancias que no le hacen bien a nadie explicar",
    slug: "por-que-corro-distancias-dificiles-de-explicar",
    excerpt: "Un intento honesto de responder la pregunta que me hacen todo el tiempo.",
    content: RUNNING_LOREM,
    coverUrl: null,
    tags: ["running"],
    status: "published",
    publishedAt: "2024-08-14",
    updatedAt: "2024-08-14",
    readingTimeMinutes: 4,
    views: 2100,
    likes: 178,
    comments: 0,
    featured: false,
  },
]


export const MOCK_COMMENTS: Comment[] = [
  {
    id: "c1",
    postId: "p1",
    authorName: "Marcos Iglesias",
    authorAvatarUrl: "/placeholder.svg?height=200&width=200",
    content: "Justo estamos pasando por esto en mi equipo. Gracias por documentarlo con tanto detalle.",
    createdAt: "2024-11-03",
  },
  {
    id: "c2",
    postId: "p1",
    authorName: "Nadia Solís",
    authorAvatarUrl: "/placeholder.svg?height=200&width=200",
    content: "La parte de 'decisiones reversibles' me voló la cabeza. Totalmente de acuerdo.",
    createdAt: "2024-11-04",
  },
  {
    id: "c3",
    postId: "p1",
    authorName: "Rubén Paz",
    authorAvatarUrl: "/placeholder.svg?height=200&width=200",
    content: "¿Tienen pensado publicar el ADR completo en algún momento?",
    createdAt: "2024-11-06",
  },
  {
    id: "c4",
    postId: "p5",
    authorName: "Camila Ortiz",
    authorAvatarUrl: "/placeholder.svg?height=200&width=200",
    content: "El segundo patrón me resolvió un problema que llevaba semanas evitando. Gracias.",
    createdAt: "2024-12-15",
  },
  {
    id: "c5",
    postId: "p9",
    authorName: "Diego Fuentes",
    authorAvatarUrl: "/placeholder.svg?height=200&width=200",
    content: "La hice ayer con lo que tenía en la nevera. Increíble de verdad.",
    createdAt: "2024-11-21",
  },
  {
    id: "c6",
    postId: "p13",
    authorName: "Laura Núñez",
    authorAvatarUrl: "/placeholder.svg?height=200&width=200",
    content: "Esto me da fuerzas para mi primer ultra en abril. Gracias por ser tan honesta.",
    createdAt: "2024-12-02",
  },
]
