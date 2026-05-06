// Configuración Inicial y Datos
let currentView = 'dashboard';
let cart = [];
let shiftOpen = false;
let startCash = 0;
let currentPayAmount = "0";

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

function initApp() {
    renderDashboard();
    renderDailySummary();
    renderPOSProducts();
}

// --- NAVEGACIÓN ---
function showView(viewId) {
    const views = ['view-dashboard', 'view-pos', 'view-users'];
    views.forEach(v => {
        const el = document.getElementById(v);
        if (el) el.classList.add('hidden');
    });

    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) targetView.classList.remove('hidden');
    
    // Actualizar menú activo
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const navItem = document.getElementById(`nav-${viewId}`);
    if (navItem) navItem.classList.add('active');

    currentView = viewId;
}

// --- LÓGICA DE LOGIN ---
function setupEventListeners() {
    // Formulario de Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('login-username').value;
            const pass = document.getElementById('login-password').value;

            // Login con las credenciales solicitadas
            if (user.trim().toLowerCase() === 'malak' && pass.trim() === 'Malakrt37') {
                document.getElementById('login-overlay').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('login-overlay').classList.add('hidden');
                }, 500);
            } else {
                alert('Usuario o contraseña incorrectos. Intenta con Malak / Malakrt37');
            }
        });
    }

    // Botón Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            document.getElementById('login-overlay').classList.remove('hidden');
            setTimeout(() => {
                document.getElementById('login-overlay').style.opacity = '1';
            }, 10);
            document.getElementById('login-username').value = '';
            document.getElementById('login-password').value = '';
        });
    }

    // Navegación Sidebar
    document.getElementById('nav-dashboard')?.addEventListener('click', () => showView('dashboard'));
    document.getElementById('nav-pos')?.addEventListener('click', () => showView('pos'));
    document.getElementById('nav-users')?.addEventListener('click', () => showView('users'));

    // Botones de Acciones Rápidas
    document.getElementById('open-pos-modal')?.addEventListener('click', () => showView('pos'));
    
    // Cerrar POS
    document.getElementById('btn-back-to-dashboard')?.addEventListener('click', () => showView('dashboard'));

    // --- LÓGICA POS ---
    document.getElementById('btn-shift-toggle')?.addEventListener('click', toggleShift);
    document.getElementById('btn-confirm-start-shift')?.addEventListener('click', startShift);
    document.getElementById('btn-open-payment')?.addEventListener('click', openPaymentModal);
    document.getElementById('btn-confirm-payment')?.addEventListener('click', processPayment);

    // Cerrar modales genérico
    document.querySelectorAll('.close-modal, .close-user-modal, .close-corte-modal, .close-shift-modal, .close-payment-modal, .close-summary-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay').classList.add('hidden');
        });
    });
}

// --- RENDERIZADO DASHBOARD ---
function renderDashboard() {
    const data = window.ROUVA_DATA;
    if (!data) return;

    let totalRev = 0;
    data.ventas.forEach(v => totalRev += v.total);

    document.getElementById('total-revenue').innerText = `$${totalRev.toFixed(2)}`;
    document.getElementById('total-expenses').innerText = `$0.00`; // Placeholder
    document.getElementById('net-profit').innerText = `$${totalRev.toFixed(2)}`;

    const roiPercent = Math.min(100, (data.pagosInversion / data.inversionInicial) * 100);
    const roiProgress = document.getElementById('roi-progress');
    if (roiProgress) roiProgress.innerText = `${roiPercent.toFixed(1)}%`;

    const roiStatus = document.getElementById('roi-status');
    if (roiStatus) roiStatus.innerText = `Pendiente: $${(data.inversionInicial - data.pagosInversion).toFixed(2)}`;

    // Actividad Reciente
    const activityList = document.getElementById('recent-activity');
    if (activityList) {
        activityList.innerHTML = '';
        data.ventas.slice(-5).reverse().forEach(v => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            item.innerHTML = `
                <div class="activity-icon sale">🛒</div>
                <div class="activity-details">
                    <h4>Venta #${v.id}</h4>
                    <p>${new Date(v.fecha).toLocaleString()}</p>
                </div>
                <div class="activity-amount sale">+$${v.total.toFixed(2)}</div>
            `;
            activityList.appendChild(item);
        });
    }
}

function renderDailySummary() {
    const body = document.getElementById('daily-summary-body');
    if (!body) return;
    body.innerHTML = '';
    
    // Agrupar por día (simulado con datos estáticos de datos.js)
    const summary = [
        { fecha: '2024-05-04', prods: 7, ventas: 248, gastos: 0, neta: 248 },
        { fecha: '2024-05-05', prods: 7, ventas: 308, gastos: 0, neta: 308 }
    ];

    summary.forEach(s => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid var(--glass-border)';
        row.innerHTML = `
            <td style="padding: 1rem;">${s.fecha}</td>
            <td style="padding: 1rem;">${s.prods}</td>
            <td style="padding: 1rem;">$${s.ventas.toFixed(2)}</td>
            <td style="padding: 1rem;">$${s.gastos.toFixed(2)}</td>
            <td style="padding: 1rem; color: var(--success); font-weight: 600;">$${s.neta.toFixed(2)}</td>
        `;
        body.appendChild(row);
    });
}

// --- LÓGICA POS ---
function renderPOSProducts() {
    const grid = document.getElementById('pos-products-grid');
    if (!grid) return;
    const prods = window.ROUVA_DATA.precios;
    
    grid.innerHTML = '';
    for (const [key, price] of Object.entries(prods)) {
        const btn = document.createElement('button');
        btn.className = 'pos-product-btn';
        btn.style = `
            background: rgba(255,255,255,0.03);
            border: 1px solid var(--glass-border);
            border-radius: 20px;
            padding: 1.5rem 1rem;
            color: white;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            transition: all 0.2s;
            position: relative;
        `;
        
        let label = key.replace('n', 'Vaso #');
        if(key === 'medio') label = 'Trole 1/2';
        if(key === 'tostitos') label = 'Tostitos';
        if(key === 'sopa') label = 'Sopa Maruchan';
        if(key === 'chicharron') label = 'Chicharrón';
        if(key === 'elote') label = 'Elote';

        btn.innerHTML = `
            <img src="${getProductIcon(key)}" style="width: 70px; height: 70px; object-fit: contain; filter: drop-shadow(0 5px 15px rgba(0,0,0,0.3));">
            <span style="font-weight: 600; text-align: center; font-size: 0.9rem;">${label}</span>
            <span style="color: var(--primary-light); font-weight: 800; font-size: 1.2rem;">$${price}</span>
        `;

        if (key === 'medio') {
            const badge = document.createElement('div');
            badge.className = 'promo-badge';
            badge.innerText = 'PROMO';
            btn.appendChild(badge);
        }

        btn.onclick = () => addToCart(label, price);
        grid.appendChild(btn);
    }
}

function getProductIcon(key) {
    if (key.includes('n') || key === 'medio') return 'assets/trole.png';
    if (key === 'tostitos') return 'assets/tostitos.png';
    if (key === 'sopa') return 'assets/sopa.png';
    if (key === 'chicharron') return 'assets/chicharron.png';
    if (key === 'elote') return 'assets/elote.png';
    return 'assets/trole.png';
}

function addToCart(name, price) {
    if (!shiftOpen) {
        alert('Debes iniciar turno primero.');
        document.getElementById('shift-modal-container').classList.remove('hidden');
        return;
    }
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    updateCartUI();
}

function updateCartUI() {
    const cartEl = document.getElementById('pos-cart');
    const totalEl = document.getElementById('pos-total-amount');
    const countEl = document.getElementById('pos-item-count');
    
    if (!cartEl) return;

    cartEl.innerHTML = '';
    let total = 0;
    let count = 0;

    cart.forEach((item, index) => {
        total += item.price * item.qty;
        count += item.qty;
        
        const div = document.createElement('div');
        div.style = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05);';
        div.innerHTML = `
            <div>
                <div style="font-weight: 600;">${item.name}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">$${item.price} x ${item.qty}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <div style="font-weight: 700;">$${(item.price * item.qty).toFixed(2)}</div>
                <button onclick="removeFromCart(${index})" style="background: none; border: none; color: var(--error); cursor: pointer; font-size: 1.2rem;">×</button>
            </div>
        `;
        cartEl.appendChild(div);
    });

    totalEl.innerText = `$${total.toFixed(2)}`;
    countEl.innerText = count;

    if (cart.length === 0) {
        cartEl.innerHTML = '<div style="text-align: center; color: var(--text-muted); margin-top: 2rem;">Carrito vacío</div>';
    }
}

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCartUI();
};

// --- TURNO ---
function toggleShift() {
    if (shiftOpen) {
        // Mostrar resumen de cierre
        const totalSales = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
        document.getElementById('summary-sales').innerText = `$${totalSales.toFixed(2)}`;
        document.getElementById('summary-start-cash').innerText = `$${startCash.toFixed(2)}`;
        document.getElementById('summary-total-expected').innerText = `$${(totalSales + startCash).toFixed(2)}`;
        document.getElementById('shift-summary-modal').classList.remove('hidden');
    } else {
        document.getElementById('shift-modal-container').classList.remove('hidden');
    }
}

function startShift() {
    const val = parseFloat(document.getElementById('input-start-cash').value);
    if (isNaN(val)) return alert('Ingresa un monto válido');
    
    startCash = val;
    shiftOpen = true;
    document.getElementById('btn-shift-toggle').innerText = 'CERRAR TURNO / CORTE';
    document.getElementById('btn-shift-toggle').style.background = 'var(--error)';
    document.getElementById('shift-modal-container').classList.add('hidden');
}

document.getElementById('btn-confirm-end-shift')?.addEventListener('click', () => {
    shiftOpen = false;
    cart = [];
    updateCartUI();
    document.getElementById('btn-shift-toggle').innerText = 'INICIAR TURNO';
    document.getElementById('btn-shift-toggle').style.background = '#3498db';
    document.getElementById('shift-summary-modal').classList.add('hidden');
    alert('Turno cerrado correctamente.');
});

// --- COBRO ---
function openPaymentModal() {
    if (cart.length === 0) return alert('El carrito está vacío');
    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    document.getElementById('pay-total-display').innerText = `$${total.toFixed(2)}`;
    currentPayAmount = "0";
    updateKeypadDisplay();
    document.getElementById('payment-modal-container').classList.remove('hidden');
}

window.pressKey = (key) => {
    if (key === 'clear') {
        currentPayAmount = "0";
    } else if (key === 'delete') {
        currentPayAmount = currentPayAmount.length > 1 ? currentPayAmount.slice(0, -1) : "0";
    } else {
        if (currentPayAmount === "0") currentPayAmount = key.toString();
        else currentPayAmount += key.toString();
    }
    updateKeypadDisplay();
};

function updateKeypadDisplay() {
    const input = document.getElementById('pay-cash-input');
    const change = document.getElementById('pay-change-display');
    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    
    input.value = currentPayAmount;
    const received = parseFloat(currentPayAmount);
    const changeVal = received - total;
    change.innerText = `$${Math.max(0, changeVal).toFixed(2)}`;
    change.style.color = changeVal >= 0 ? 'var(--success)' : 'var(--text-muted)';
}

function processPayment() {
    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const received = parseFloat(currentPayAmount);
    
    if (received < total) return alert('Monto insuficiente');

    // Registrar venta (en memoria)
    const newVenta = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        items: [...cart],
        total: total
    };
    window.ROUVA_DATA.ventas.push(newVenta);
    
    cart = [];
    updateCartUI();
    renderDashboard();
    
    document.getElementById('payment-modal-container').classList.add('hidden');
    
    // Notificación de éxito
    const noti = document.getElementById('notification-modal');
    noti.classList.remove('hidden');
    document.getElementById('btn-noti-primary').onclick = () => noti.classList.add('hidden');
}
