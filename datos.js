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
        // 04/05/2026
        { id: 1001, fecha: "2026-05-04T18:15:00", items: [{ producto: "Trole 1/2", cantidad: 2, precio: 40 }], total: 80 },
        { id: 1002, fecha: "2026-05-04T18:45:00", items: [{ producto: "Tostitos", cantidad: 1, precio: 60 }], total: 60 },
        { id: 1003, fecha: "2026-05-04T19:20:00", items: [{ producto: "Trole n8", cantidad: 2, precio: 28 }], total: 56 },
        { id: 1004, fecha: "2026-05-04T19:50:00", items: [{ producto: "Trole n6", cantidad: 1, precio: 24 }], total: 24 },
        { id: 1005, fecha: "2026-05-04T20:15:00", items: [{ producto: "Trole n8", cantidad: 1, precio: 28 }], total: 28 },
        
        // 05/05/2026
        { id: 1006, fecha: "2026-05-05T18:10:00", items: [{ producto: "Trole n10", cantidad: 1, precio: 32 }], total: 32 },
        { id: 1007, fecha: "2026-05-05T18:40:00", items: [{ producto: "Trole n12", cantidad: 1, precio: 36 }], total: 36 },
        { id: 1008, fecha: "2026-05-05T19:15:00", items: [{ producto: "Trole n8", cantidad: 2, precio: 28 }], total: 56 },
        { id: 1009, fecha: "2026-05-05T19:45:00", items: [{ producto: "Trole n6", cantidad: 1, precio: 24 }], total: 24 },
        { id: 1010, fecha: "2026-05-05T20:10:00", items: [{ producto: "Tostitos", cantidad: 1, precio: 60 }], total: 60 },
        { id: 1011, fecha: "2026-05-05T20:45:00", items: [{ producto: "Sopa", cantidad: 1, precio: 100 }], total: 100 },
        
        // 06/05/2026
        { id: 1012, fecha: "2026-05-06T19:10:00", items: [{ producto: "Trole n8", cantidad: 1, precio: 28 }], total: 28 },
        { id: 1013, fecha: "2026-05-06T19:45:00", items: [{ producto: "Trole 1/2", cantidad: 1, precio: 40 }], total: 40 }
    ],
    pagosInversion: 214,
    gastos: [
        { id: 2001, fecha: "2026-05-07T01:10:00", concept: "GASTOS COMPRAS", total: 524.00 }
    ]
};
