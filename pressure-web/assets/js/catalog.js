/*
 * PRESSURE — Catálogo de productos.
 * Este archivo es la "base de datos" de la tienda. Para editar precios, stock o
 * agregar productos, modifica este listado (ver README.md, sección "Catálogo").
 *   sizes[].available  -> false = talla agotada
 *   images             -> la primera es la foto de catálogo, la segunda aparece al pasar el mouse
 */
window.PRESSURE_CATALOG = {
  "products": [
    {
      "handle": "gorra-astro",
      "ref": "PRS-011",
      "title": "Gorra Astro",
      "type": "gorras",
      "collection": "orbita",
      "color": "Verde lavado",
      "swatch": "#3f6b4e",
      "price": 70000,
      "compareAt": null,
      "sizes": [],
      "description": "Gorra unstructured verde con bordado frontal en contraste, visera curva y confección en algodón de alta resistencia.",
      "images": [
        "assets/img/products/gorra-astro-1.webp",
        "assets/img/products/gorra-astro-2.webp",
        "assets/img/products/gorra-astro-3.webp"
      ],
      "date": "2026-06-07"
    },
    {
      "handle": "gorra-tierra",
      "ref": "PRS-010",
      "title": "Gorra Tierra",
      "type": "gorras",
      "collection": "orbita",
      "color": "Beige / negro",
      "swatch": "#cdbb98",
      "price": 70000,
      "compareAt": null,
      "sizes": [],
      "description": "Dad cap beige con bordado frontal en contraste, visera curva bicolor y confección en algodón de alta resistencia.",
      "images": [
        "assets/img/products/gorra-tierra-1.webp",
        "assets/img/products/gorra-tierra-2.webp",
        "assets/img/products/gorra-tierra-3.webp",
        "assets/img/products/gorra-tierra-4.webp"
      ],
      "date": "2026-05-18"
    },
    {
      "handle": "gorra-cielo",
      "ref": "PRS-009",
      "title": "Gorra Cielo",
      "type": "gorras",
      "collection": "orbita",
      "color": "Azul cielo",
      "swatch": "#7fa6d6",
      "price": 70000,
      "compareAt": null,
      "sizes": [],
      "description": "Gorra unstructured azul con bordado frontal en contraste, visera curva y confección en algodón de alta resistencia.",
      "images": [
        "assets/img/products/gorra-cielo-1.webp",
        "assets/img/products/gorra-cielo-2.webp",
        "assets/img/products/gorra-cielo-3.webp",
        "assets/img/products/gorra-cielo-4.webp"
      ],
      "date": "2026-05-18"
    },
    {
      "handle": "gorra-sombra",
      "ref": "PRS-008",
      "title": "Gorra Sombra",
      "type": "gorras",
      "collection": "orbita",
      "color": "Negro",
      "swatch": "#141414",
      "price": 70000,
      "compareAt": null,
      "sizes": [],
      "description": "Gorra unstructured negra con bordado blanco, visera curva y confección en algodón de alta resistencia.",
      "images": [
        "assets/img/products/gorra-sombra-1.webp",
        "assets/img/products/gorra-sombra-2.webp"
      ],
      "date": "2026-05-18"
    },
    {
      "handle": "llavero-pressure",
      "ref": "PRS-007",
      "title": "Llavero PRESSURE",
      "type": "accesorios",
      "collection": "accesorios",
      "color": "Plata",
      "swatch": "#b9b9b9",
      "price": 20000,
      "compareAt": null,
      "sizes": [],
      "description": "Llavero del logo de PRESSURE en acero inoxidable pintado a mano y diseñado para uso diario.",
      "images": [
        "assets/img/products/llavero-pressure-1.webp",
        "assets/img/products/llavero-pressure-2.jpg",
        "assets/img/products/llavero-pressure-3.webp"
      ],
      "date": "2026-05-11"
    },
    {
      "handle": "camiseta-redencion",
      "ref": "PRS-006",
      "title": "Camiseta Redención",
      "type": "camisetas",
      "collection": "testamentos",
      "color": "Gris piedra",
      "swatch": "#8b8a84",
      "price": 100000,
      "compareAt": null,
      "sizes": [
        {
          "name": "S",
          "available": true
        },
        {
          "name": "M",
          "available": true
        },
        {
          "name": "L",
          "available": true
        },
        {
          "name": "XL",
          "available": true
        }
      ],
      "description": "Camiseta oversize color gris piedra de manga corta con estampado serigráfico blanco crema en frente y espalda, cuello redondo y confeccionada en 100% algodón de 250 g.",
      "images": [
        "assets/img/products/camiseta-redencion-1.webp",
        "assets/img/products/camiseta-redencion-2.webp",
        "assets/img/products/camiseta-redencion-3.webp"
      ],
      "date": "2026-05-11"
    },
    {
      "handle": "camiseta-juicio",
      "ref": "PRS-005",
      "title": "Camiseta Juicio",
      "type": "camisetas",
      "collection": "testamentos",
      "color": "Chocolate",
      "swatch": "#5a3a28",
      "price": 100000,
      "compareAt": null,
      "sizes": [
        {
          "name": "S",
          "available": true
        },
        {
          "name": "M",
          "available": true
        },
        {
          "name": "L",
          "available": false
        },
        {
          "name": "XL",
          "available": true
        }
      ],
      "description": "Camiseta oversize color chocolate de manga corta con estampado serigráfico amarillo en frente y espalda, cuello redondo y confeccionada en 100% algodón de 250 g.",
      "images": [
        "assets/img/products/camiseta-juicio-1.webp",
        "assets/img/products/camiseta-juicio-2.webp",
        "assets/img/products/camiseta-juicio-3.webp"
      ],
      "date": "2026-05-11"
    },
    {
      "handle": "camiseta-confesion",
      "ref": "PRS-004",
      "title": "Camiseta Confesión",
      "type": "camisetas",
      "collection": "testamentos",
      "color": "Negro",
      "swatch": "#111111",
      "price": 100000,
      "compareAt": null,
      "sizes": [
        {
          "name": "S",
          "available": true
        },
        {
          "name": "M",
          "available": true
        },
        {
          "name": "L",
          "available": true
        },
        {
          "name": "XL",
          "available": true
        }
      ],
      "description": "Camiseta oversize negra de manga corta con estampado serigráfico blanco en frente y espalda, cuello redondo y confeccionada en 100% algodón de 250 g.",
      "images": [
        "assets/img/products/camiseta-confesion-1.webp",
        "assets/img/products/camiseta-confesion-2.webp",
        "assets/img/products/camiseta-confesion-3.webp"
      ],
      "date": "2026-05-11"
    },
    {
      "handle": "camiseta-basica-blanca-logo-lila",
      "ref": "PRS-003",
      "title": "Camiseta básica blanca (logo lila)",
      "type": "camisetas",
      "collection": "basicas",
      "color": "Blanco / lila",
      "swatch": "#f4f2ee",
      "price": 95000,
      "compareAt": null,
      "sizes": [
        {
          "name": "S",
          "available": false
        },
        {
          "name": "M",
          "available": false
        },
        {
          "name": "L",
          "available": true
        },
        {
          "name": "XL",
          "available": false
        }
      ],
      "description": "Camiseta oversize blanca de manga corta con logo bordado en lila, cuello redondo y confeccionada en 100% algodón de 200 g.",
      "images": [
        "assets/img/products/camiseta-basica-blanca-logo-lila-1.webp"
      ],
      "date": "2026-05-06"
    },
    {
      "handle": "camiseta-basica-blanca",
      "ref": "PRS-002",
      "title": "Camiseta básica blanca (logo negro)",
      "type": "camisetas",
      "collection": "basicas",
      "color": "Blanco / negro",
      "swatch": "#f4f2ee",
      "price": 95000,
      "compareAt": null,
      "sizes": [
        {
          "name": "S",
          "available": false
        },
        {
          "name": "M",
          "available": false
        },
        {
          "name": "L",
          "available": false
        },
        {
          "name": "XL",
          "available": false
        }
      ],
      "description": "Camiseta oversize blanca de manga corta con logo bordado en negro, cuello redondo y confeccionada en 100% algodón de 200 g.",
      "images": [
        "assets/img/products/camiseta-basica-blanca-1.webp"
      ],
      "date": "2026-05-06"
    },
    {
      "handle": "camiseta-basica-negra",
      "ref": "PRS-001",
      "title": "Camiseta básica negra (logo blanco)",
      "type": "camisetas",
      "collection": "basicas",
      "color": "Negro / blanco",
      "swatch": "#111111",
      "price": 95000,
      "compareAt": null,
      "sizes": [
        {
          "name": "S",
          "available": false
        },
        {
          "name": "M",
          "available": false
        },
        {
          "name": "L",
          "available": false
        },
        {
          "name": "XL",
          "available": false
        }
      ],
      "description": "Camiseta oversize negra de manga corta con logo bordado en blanco, cuello redondo y confeccionada en 100% algodón de 200 g.",
      "images": [
        "assets/img/products/camiseta-basica-negra-1.webp"
      ],
      "date": "2026-05-06"
    }
  ]
};
