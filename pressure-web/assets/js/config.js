/*
 * PRESSURE — Configuración general de la tienda.
 * Textos, contacto, colecciones y reglas de envío. Todo lo editable sin tocar el código.
 */
window.PRESSURE_CONFIG = {
  store: {
    name: "PRESSURE",
    domain: "lapressure.co",
    city: "Barrancabermeja, Colombia",
    email: "lapressure.co@gmail.com",
    // Número en formato internacional, sin "+" ni espacios. Recibe los pedidos.
    whatsapp: "573133139364",
    instagram: "https://www.instagram.com/lapressure__/",
    tiktok: "https://www.tiktok.com/@lapressure__",
    facebook: "https://www.facebook.com/profile.php?id=61574956738637",
  },

  shipping: {
    freeThreshold: 300000,      // Envío gratis a toda Colombia desde este valor (COP)
    freeCity: "Barrancabermeja" // Envío gratis siempre en esta ciudad
  },

  // Pago en línea con Wompi (tarjeta, PSE, Nequi, Bancolombia). Las llaves NO van aquí:
  // se configuran en el servidor (ver README.md, "Pagos en línea"). false = solo WhatsApp.
  payments: {
    wompi: false, // Copia de portafolio en GitHub Pages: sin PHP, solo pedidos por WhatsApp.
    endpoint: "api/firma.php",
  },

  announcements: [
    "Envíos gratis en Barrancabermeja",
    "Envíos gratis a toda Colombia por compras superiores a $300.000 COP",
    "Pedidos preparados y empacados a mano desde Colombia",
  ],

  // Newsletter (Klaviyo). Pega aquí el "Public API Key / Site ID" y el ID de la lista.
  // Si quedan vacíos, el bloque de newsletter no se muestra.
  newsletter: { klaviyoCompanyId: "", klaviyoListId: "" },

  // Expedientes = colecciones / drops. El orden define el menú y la portada.
  collections: [
    {
      handle: "orbita",
      title: "Órbita",
      file: "EXP. 004",
      kicker: "Gorras · Drop 2026",
      tagline: "¡Ya disponible!",
      description: "Cuatro gorras, cuatro órbitas: Astro, Tierra, Cielo y Sombra. Algodón de alta resistencia, visera curva y el bordado PRESSURE en contraste.",
      cover: "assets/img/editorial/img_024.webp",
      video: "assets/video/67595336afee454586099d75d8f3fc6d.hd-1080p-7.2mbps-84348916.mp4",
      poster: "assets/img/editorial/post_02-05_1617a13d-5970-414f-9027-b266c300a020.webp",
      lookbook: [
        "assets/img/editorial/img_024.webp",
        "assets/img/editorial/img_028.webp",
        "assets/img/editorial/img_022.webp",
        "assets/img/editorial/img_029.webp",
        "assets/img/editorial/img_020.webp",
        "assets/img/editorial/img_030.webp",
      ],
    },
    {
      handle: "testamentos",
      title: "Testamentos",
      file: "EXP. 002",
      kicker: "Camisetas · Serigrafía",
      tagline: "Lo que pesa y permanece",
      description: "Una colección hecha desde lo interno, lo que pesa y permanece. Camisetas oversize de 250 g con estampado serigráfico en frente y espalda.",
      cover: "assets/img/editorial/img001.webp",
      video: "assets/video/e786b18f3a464229a7a411c454585ff8.hd-1080p-2.5mbps-83226971.mp4",
      poster: "assets/img/editorial/img002.webp",
      lookbook: [
        "assets/img/editorial/img001.webp",
        "assets/img/editorial/img002.webp",
        "assets/img/editorial/img003.webp",
        "assets/img/editorial/img_007.webp",
      ],
    },
    {
      handle: "basicas",
      title: "Básicas",
      file: "EXP. 001",
      kicker: "Esenciales · Logo bordado",
      tagline: "Para todos los días",
      description: "Camisetas oversize en 100% algodón de 200 g con el logo PRESSURE bordado en contraste. La base de todo.",
      cover: "assets/img/products/camiseta-basica-negra-1.webp",
    },
    {
      handle: "accesorios",
      title: "Accesorios",
      file: "EXP. 003",
      kicker: "Acero inoxidable",
      tagline: "El logo, en tu bolsillo",
      description: "El murciélago PRESSURE en acero inoxidable, pintado a mano con acabado metálico.",
      cover: "assets/img/editorial/img_010.webp",
    },
  ],

  // Tipos de prenda (pestaña "Prendas" del menú)
  types: [
    { handle: "gorras", title: "Gorras", cover: "assets/img/editorial/img_022.webp" },
    { handle: "camisetas", title: "Camisetas", cover: "assets/img/editorial/img003.webp" },
    { handle: "accesorios", title: "Accesorios", cover: "assets/img/editorial/img_009.jpg" },
  ],

  // Textos de cuidado por tipo de prenda (ficha de producto)
  care: {
    gorras: "Limpiar cuidadosamente a mano. Evitar lavadora, secadora o contacto prolongado con humedad para conservar la forma y los bordados.",
    camisetas: "Lavar las prendas por separado, del revés y en agua fría. No usar blanqueadores ni secadora para conservar materiales, estampados y bordados.",
    accesorios: "Evitar el contacto prolongado con agua, humedad o superficies abrasivas para conservar el acabado y los detalles de la pieza.",
  },

  // Guía de tallas. Completa las medidas reales (cm) para mostrar la tabla en la ficha.
  // Si "rows" está vacío, solo se muestra la recomendación de fit.
  sizeGuide: {
    note: "Nuestras camisetas tienen fit oversize: hombros caídos y largo amplio. Si prefieres un fit más ajustado, elige una talla menos.",
    columns: ["Talla", "Ancho pecho", "Largo total", "Manga"],
    rows: [],
  },
};
