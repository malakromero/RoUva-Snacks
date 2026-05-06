var ROUVA_DATA = {
    inversionInicial: 1000,
    precios: {
        "n4": 20,
        "n6": 24,
        "n8": 28,
        "n10": 32,
        "n12": 36,
        "medio": 40, // ¡PROMOCIÓN!
        "tostitos": 60,
        "sopa": 100,
        "chicharron": 20,
        "elote": 30
    },
    ventas: [
        {
            id: 1001,
            fecha: "2026-05-04T19:42:15",
            items: [
                { producto: "Trole 1/2", cantidad: 2, precio: 40 }, // Ajustado a Promo
                { producto: "Tostitos", cantidad: 1, precio: 60 },
                { producto: "Trole n8", cantidad: 3, precio: 28 },
                { producto: "Trole n6", cantidad: 1, precio: 24 }
            ],
            total: 248 // Ajustado (antes 268)
        },
        {
            id: 1002,
            fecha: "2026-05-05T20:15:30",
            items: [
                { producto: "Trole n10", cantidad: 1, precio: 32 },
                { producto: "Trole n12", cantidad: 1, precio: 36 },
                { producto: "Trole n8", cantidad: 2, precio: 28 },
                { producto: "Trole n6", cantidad: 1, precio: 24 },
                { producto: "Tostitos", cantidad: 1, precio: 60 },
                { producto: "Sopa", cantidad: 1, precio: 100 }
            ],
            total: 308
        }
    ],
    pagosInversion: 214
};
