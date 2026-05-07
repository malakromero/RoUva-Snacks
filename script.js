// Configuración Inicial y Datos
let currentView = 'dashboard';
let cart = [];
let shiftOpen = false;
let startCash = 0;
let shiftTotal = 0;
let currentPayAmount = "0";
let currentDashboardRange = "all";

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

function initApp() {
    loadData();
    checkLogin();
    renderDashboard();
    renderDailySummary();
    renderPOSProducts();
}

function checkLogin() {
    const isLoggedIn = localStorage.getItem('ROUVA_LOGGED_IN');
    if (isLoggedIn === 'true') {
        const overlay = document.getElementById('login-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.style.opacity = '0';
        }
    }
}

function loadData() {
    const saved = localStorage.getItem('ROUVA_DATA');
    if (saved) {
        const parsedData = JSON.parse(saved);
        // Fusionar precios: Los de datos.js tienen prioridad para actualizaciones
        parsedData.precios = { ...parsedData.precios, ...window.ROUVA_DATA.precios };
        
        // Eliminar el chicharrón antiguo de $20 que quedó en memoria
        delete parsedData.precios.chicharron;
        
        window.ROUVA_DATA = parsedData;
    }
}

function saveData() {
    localStorage.setItem('ROUVA_DATA', JSON.stringify(window.ROUVA_DATA));
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
                localStorage.setItem('ROUVA_LOGGED_IN', 'true');
                document.getElementById('login-overlay').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('login-overlay').classList.add('hidden');
                }, 500);
            } else {
                showNotification('Error de Acceso', 'Usuario o contraseña incorrectos. Intenta con Malak / Malakrt37', 'error');
            }
        });
    }

    // Botón Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            localStorage.removeItem('ROUVA_LOGGED_IN');
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
    document.getElementById('nav-sync')?.addEventListener('click', () => {
        document.getElementById('sync-modal-container').classList.remove('hidden');
    });
    document.getElementById('close-sync-modal')?.addEventListener('click', () => {
        document.getElementById('sync-modal-container').classList.add('hidden');
    });

    // Botones de Sincronización
    document.getElementById('btn-copy-data')?.addEventListener('click', copySyncData);
    document.getElementById('btn-import-data')?.addEventListener('click', importSyncData);

    // Botones de Rango Dashboard
    document.querySelectorAll('.range-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDashboardRange = btn.getAttribute('data-range');
            
            // Mostrar/Ocultar inputs de fecha si es personalizado
            const customInputs = document.getElementById('custom-range-inputs');
            if (currentDashboardRange === 'custom') {
                customInputs.classList.remove('hidden');
            } else {
                customInputs.classList.add('hidden');
            }

            renderDashboard();
        });
    });

    document.getElementById('date-from')?.addEventListener('change', renderDashboard);
    document.getElementById('date-to')?.addEventListener('change', renderDashboard);

    // Botones de Acciones Rápidas
    document.getElementById('open-pos-modal')?.addEventListener('click', () => showView('pos'));
    document.getElementById('open-expense-modal')?.addEventListener('click', () => {
        document.getElementById('expense-modal-container').classList.remove('hidden');
    });
    document.getElementById('close-expense-modal')?.addEventListener('click', () => {
        document.getElementById('expense-modal-container').classList.add('hidden');
    });

    // Modales de Inversión
    document.getElementById('open-roi-modal')?.addEventListener('click', () => {
        document.getElementById('roi-modal-container').classList.remove('hidden');
    });
    document.getElementById('close-roi-modal')?.addEventListener('click', () => {
        document.getElementById('roi-modal-container').classList.add('hidden');
    });
    document.getElementById('card-roi-config')?.addEventListener('click', () => {
        document.getElementById('config-roi-total').value = window.ROUVA_DATA.inversionInicial;
        document.getElementById('config-roi-modal-container').classList.remove('hidden');
    });
    document.getElementById('close-config-roi-modal')?.addEventListener('click', () => {
        document.getElementById('config-roi-modal-container').classList.add('hidden');
    });

    // Formularios de Gasto e Inversión
    document.getElementById('expense-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        saveExpense();
    });
    document.getElementById('roi-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        saveROIPayment();
    });
    document.getElementById('config-roi-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        updateInitialInvestment();
    });
    
    // Cerrar POS
    document.getElementById('btn-back-to-dashboard')?.addEventListener('click', () => showView('dashboard'));

    // --- LÓGICA POS ---
    document.getElementById('btn-shift-toggle')?.addEventListener('click', toggleShift);
    document.getElementById('btn-confirm-start-shift')?.addEventListener('click', startShift);
    document.getElementById('btn-open-payment')?.addEventListener('click', openPaymentModal);
    
    // Ver Historial Completo
    document.getElementById('btn-view-all')?.addEventListener('click', () => {
        document.getElementById('history-modal-container').classList.remove('hidden');
        renderHistoryModal();
    });
    document.getElementById('close-history-modal')?.addEventListener('click', () => {
        document.getElementById('history-modal-container').classList.add('hidden');
    });
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

    // Filtrar ventas y gastos por rango
    let filteredVentas = data.ventas || [];
    let filteredGastos = data.gastos || [];

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (currentDashboardRange !== 'all') {
        filteredVentas = filteredVentas.filter(v => {
            const vDate = new Date(v.fecha);
            if (currentDashboardRange === 'today') return v.fecha.startsWith(todayStr);
            if (currentDashboardRange === 'week') {
                const diff = (now - vDate) / (1000 * 60 * 60 * 24);
                return diff <= 7;
            }
            if (currentDashboardRange === 'month') {
                return vDate.getMonth() === now.getMonth() && vDate.getFullYear() === now.getFullYear();
            }
            if (currentDashboardRange === 'custom') {
                const from = document.getElementById('date-from').value;
                const to = document.getElementById('date-to').value;
                if (!from || !to) return true;
                const vStr = v.fecha.split('T')[0];
                return vStr >= from && vStr <= to;
            }
            return true;
        });

        filteredGastos = filteredGastos.filter(g => {
            const gDate = new Date(g.fecha);
            if (currentDashboardRange === 'today') return g.fecha.startsWith(todayStr);
            if (currentDashboardRange === 'week') {
                const diff = (now - gDate) / (1000 * 60 * 60 * 24);
                return diff <= 7;
            }
            if (currentDashboardRange === 'month') {
                return gDate.getMonth() === now.getMonth() && gDate.getFullYear() === now.getFullYear();
            }
            if (currentDashboardRange === 'custom') {
                const from = document.getElementById('date-from').value;
                const to = document.getElementById('date-to').value;
                if (!from || !to) return true;
                const gStr = g.fecha.split('T')[0];
                return gStr >= from && gStr <= to;
            }
            return true;
        });
    }

    let totalRev = 0;
    filteredVentas.forEach(v => totalRev += v.total);

    let totalExp = 0;
    filteredGastos.forEach(g => totalExp += g.total);

    // Actualizar stats principales
    document.getElementById('total-revenue').innerText = `$${totalRev.toFixed(2)}`;
    document.getElementById('total-expenses').innerText = `$${totalExp.toFixed(2)}`;
    document.getElementById('net-profit').innerText = `$${(totalRev - totalExp).toFixed(2)}`;

    const roiPercent = Math.min(100, (data.pagosInversion / data.inversionInicial) * 100);
    const roiProgress = document.getElementById('roi-progress');
    if (roiProgress) {
        roiProgress.innerText = `${roiPercent.toFixed(1)}%`;
        roiProgress.style.color = roiPercent >= 100 ? 'var(--success)' : 'white';
    }

    const roiStatus = document.getElementById('roi-status');
    if (roiStatus) roiStatus.innerText = `Faltan: $${(data.inversionInicial - data.pagosInversion).toFixed(2)}`;

    // Actividad Reciente (Ventas + Gastos)
    const activityList = document.getElementById('recent-activity');
    if (activityList) {
        activityList.innerHTML = '';
        
        let allActivity = [];
        data.ventas.forEach(v => allActivity.push({ ...v, type: 'sale' }));
        if (data.gastos) {
            data.gastos.forEach(g => allActivity.push({ ...g, type: 'expense' }));
        }

        // Ordenar por fecha descendente
        allActivity.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        if (allActivity.length === 0) {
            activityList.innerHTML = '<div class="empty-state"><p>No hay actividad registrada.</p></div>';
        } else {
            allActivity.slice(0, 10).forEach(act => {
                const item = document.createElement('div');
                item.className = 'activity-item';
                const fechaObj = new Date(act.fecha);
                const fechaPretty = fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const fechaDia = fechaObj.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
                
                const isSale = act.type === 'sale';
                const icon = isSale ? '🛒' : '➖';
                const title = isSale ? `Venta #${act.id.toString().slice(-4)}` : act.concept;
                const amountClass = isSale ? 'sale' : 'expense';
                const amountSign = isSale ? '+' : '-';

                item.innerHTML = `
                    <div class="activity-icon ${amountClass}">${icon}</div>
                    <div class="activity-details">
                        <h4>${title}</h4>
                        <p>${fechaDia} - ${fechaPretty}</p>
                    </div>
                    <div class="activity-amount ${amountClass}">${amountSign}$${act.total.toFixed(2)}</div>
                    <button class="btn-delete" onclick="${isSale ? 'deleteVenta' : 'deleteGasto'}(${act.id})" title="Eliminar">🗑️</button>
                `;
                activityList.appendChild(item);
            });
        }
    }
}

function deleteGasto(id) {
    showNotification(
        '¿Eliminar Gasto?', 
        '¿Estás seguro de que quieres borrar este gasto?', 
        'warning',
        () => {
            const index = window.ROUVA_DATA.gastos.findIndex(g => g.id === id);
            if (index !== -1) {
                window.ROUVA_DATA.gastos.splice(index, 1);
                saveData();
                renderDashboard();
                renderDailySummary();
                showNotification('Eliminado', 'el gasto ha sido borrado.', 'success');
            }
        },
        true
    );
}

function renderDailySummary() {
    const body = document.getElementById('daily-summary-body');
    if (!body) return;
    body.innerHTML = '';
    
    const data = window.ROUVA_DATA;
    if (!data.ventas || data.ventas.length === 0) {
        body.innerHTML = '<tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-muted);">Sin datos históricos</td></tr>';
        return;
    }

    // Agrupar por día real
    const dailyMap = {};
    
    // Sumar Ventas
    data.ventas.forEach(v => {
        const d = v.fecha.split('T')[0];
        if (!dailyMap[d]) dailyMap[d] = { ventas: 0, prods: 0, gastos: 0 };
        dailyMap[d].ventas += v.total;
        dailyMap[d].prods += v.items ? v.items.reduce((acc, i) => acc + (i.cantidad || 0), 0) : 0;
    });

    // Sumar Gastos
    if (data.gastos) {
        data.gastos.forEach(g => {
            const d = g.fecha.split('T')[0];
            if (!dailyMap[d]) dailyMap[d] = { ventas: 0, prods: 0, gastos: 0 };
            dailyMap[d].gastos += g.total;
        });
    }

    // Ordenar fechas descendente
    const sortedDates = Object.keys(dailyMap).sort().reverse();

    sortedDates.forEach(date => {
        const s = dailyMap[date];
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid var(--glass-border)';
        row.style.transition = 'background 0.2s';
        
        row.innerHTML = `
            <td style="padding: 1.2rem; font-weight: 600; color: var(--primary-light);">${date}</td>
            <td style="padding: 1.2rem;">${s.prods} unidades</td>
            <td style="padding: 1.2rem; font-weight: 700; font-size: 1.1rem;">$${s.ventas.toFixed(2)}</td>
            <td style="padding: 1.2rem; color: var(--text-muted);">$${s.gastos.toFixed(2)}</td>
            <td style="padding: 1.2rem; color: var(--success); font-weight: 800; font-size: 1.1rem;">$${(s.ventas - s.gastos).toFixed(2)}</td>
        `;
        body.appendChild(row);
    });
}

function deleteVenta(id) {
    showNotification(
        '¿Eliminar Venta?', 
        'Esta acción no se puede deshacer. ¿Estás seguro de que quieres borrar este registro?', 
        'warning',
        () => {
            const index = window.ROUVA_DATA.ventas.findIndex(v => v.id === id);
            if (index !== -1) {
                window.ROUVA_DATA.ventas.splice(index, 1);
                saveData();
                renderDashboard();
                renderDailySummary();
                renderHistoryModal();
                showNotification('Eliminado', 'La venta ha sido borrada.', 'success');
            }
        },
        true // Mostrar botón cancelar
    );
}

function renderHistoryModal() {
    const list = document.getElementById('history-list-full');
    if (!list) return;
    list.innerHTML = '';
    
    const data = window.ROUVA_DATA;
    if (!data.ventas || data.ventas.length === 0) {
        list.innerHTML = '<div class="empty-state"><p>No hay historial de ventas.</p></div>';
        return;
    }

    // Todas las ventas reversas (más recientes arriba)
    data.ventas.slice().reverse().forEach(v => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.style.marginBottom = '10px';
        item.style.padding = '1.2rem';
        item.style.background = 'rgba(255,255,255,0.03)';
        
        const fechaObj = new Date(v.fecha);
        const fechaPretty = fechaObj.toLocaleString([], { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
        
        const prodsText = v.items ? v.items.map(i => `${i.cantidad}x ${i.producto}`).join(', ') : 'Sin detalle';

        item.innerHTML = `
            <div class="activity-icon sale">🛒</div>
            <div class="activity-details">
                <h4 style="font-size: 1.1rem;">Venta #${v.id.toString().slice(-4)}</h4>
                <p style="color: var(--primary-light); font-weight: 600;">${fechaPretty}</p>
                <p style="font-size: 0.85rem; opacity: 0.8; margin-top: 5px;">${prodsText}</p>
            </div>
            <div class="activity-amount sale" style="font-size: 1.3rem; font-weight: 800;">+$${v.total.toFixed(2)}</div>
            <button class="btn-delete" onclick="deleteVenta(${v.id})" title="Eliminar" style="opacity: 1; margin-left: 10px;">🗑️</button>
        `;
        list.appendChild(item);
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
        
        let label = key;
        if (key.startsWith('n') && !isNaN(key.substring(1))) {
            label = key.replace('n', 'Vaso #');
        } else {
            if(key === 'medio') label = 'Trole 1/2';
            if(key === 'tostitos') label = 'Tostitos';
            if(key === 'sopa') label = 'Sopa Maruchan';
            if(key === 'chicharron_especial') label = 'Chicharrón Especial';
            if(key === 'chicharron_sencillo') label = 'Chicharrón Sencillo';
            if(key === 'elote') label = 'Elote';
        }

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
    if (key === 'tostitos') return 'assets/tostitos.png';
    if (key === 'sopa') return 'assets/sopa.png';
    if (key === 'chicharron_especial') return 'assets/chicharron.png';
    if (key === 'chicharron_sencillo') return 'assets/chicharron_sencillo.png';
    if (key === 'elote') return 'assets/elote.png';
    if (key.startsWith('n') || key === 'medio') return 'assets/trole.png';
    return 'assets/trole.png';
}

function addToCart(name, price) {
    if (!shiftOpen) {
        showNotification('Caja Cerrada', 'Debes iniciar turno primero para poder vender.', 'warning');
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
        document.getElementById('summary-sales').innerText = `$${shiftTotal.toFixed(2)}`;
        document.getElementById('summary-start-cash').innerText = `$${startCash.toFixed(2)}`;
        document.getElementById('summary-total-expected').innerText = `$${(shiftTotal + startCash).toFixed(2)}`;
        document.getElementById('shift-summary-modal').classList.remove('hidden');
    } else {
        document.getElementById('shift-modal-container').classList.remove('hidden');
    }
}

function startShift() {
    const val = parseFloat(document.getElementById('input-start-cash').value);
    if (isNaN(val)) return showNotification('Error', 'Ingresa un monto válido para el fondo de caja.', 'error');
    
    startCash = val;
    shiftTotal = 0;
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
    showNotification('¡Turno Cerrado!', 'El corte de caja se realizó correctamente.', 'success');
});

// --- COBRO ---
function openPaymentModal() {
    if (cart.length === 0) return showNotification('Atención', 'El carrito está vacío. Agrega productos primero.', 'warning');
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
    
    if (received < total) return showNotification('Monto Insuficiente', `Faltan $${(total - received).toFixed(2)} para completar el pago.`, 'error');

    // Registrar venta (en memoria)
    const newVenta = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        items: [...cart],
        total: total
    };
    window.ROUVA_DATA.ventas.push(newVenta);
    saveData();
    
    if (shiftOpen) shiftTotal += total;

    cart = [];
    updateCartUI();
    renderDashboard();
    renderDailySummary(); // Asegurar que el resumen histórico se actualice
    
    document.getElementById('payment-modal-container').classList.add('hidden');
    
    showNotification('¡Venta Exitosa!', `La venta por $${total.toFixed(2)} ha sido registrada.`, 'success');
}

function showNotification(title, message, type = 'success', callback = null, showCancel = false) {
    const modal = document.getElementById('notification-modal');
    const icon = document.getElementById('noti-icon');
    const titleEl = document.getElementById('noti-title');
    const msgEl = document.getElementById('noti-message');
    const btn = document.getElementById('btn-noti-primary');
    const btnSecondary = document.getElementById('btn-noti-secondary');

    titleEl.innerText = title;
    msgEl.innerText = message;
    
    // Configurar icono y color según tipo
    if (type === 'success') {
        icon.innerText = '✅';
        icon.style.filter = 'drop-shadow(0 10px 20px rgba(46, 204, 113, 0.4))';
        btn.style.background = 'var(--success)';
        btn.innerText = 'ACEPTAR';
    } else if (type === 'error') {
        icon.innerText = '❌';
        icon.style.filter = 'drop-shadow(0 10px 20px rgba(231, 76, 60, 0.4))';
        btn.style.background = 'var(--error)';
        btn.innerText = 'ACEPTAR';
    } else if (type === 'warning') {
        icon.innerText = '⚠️';
        icon.style.filter = 'drop-shadow(0 10px 20px rgba(243, 156, 18, 0.4))';
        btn.style.background = 'var(--secondary)';
        btn.innerText = 'CONFIRMAR';
    }

    // Botón Secundario (Cancelar)
    if (showCancel) {
        btnSecondary.style.display = 'block';
        btnSecondary.onclick = () => modal.classList.add('hidden');
    } else {
        btnSecondary.style.display = 'none';
    }

    // Acción del Botón Principal
    btn.onclick = () => {
        modal.classList.add('hidden');
        if (callback) callback();
    };
    
    modal.classList.remove('hidden');
}

function saveExpense() {
    const concept = document.getElementById('expense-concept').value;
    const amount = parseFloat(document.getElementById('expense-amount').value);

    if (!concept || isNaN(amount)) return;

    const newExpense = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        concept: concept,
        total: amount
    };

    if (!window.ROUVA_DATA.gastos) window.ROUVA_DATA.gastos = [];
    window.ROUVA_DATA.gastos.push(newExpense);
    saveData();

    // Reset y cerrar
    document.getElementById('expense-form').reset();
    document.getElementById('expense-modal-container').classList.add('hidden');

    renderDashboard();
    renderDailySummary();
    showNotification('Gasto Registrado', `Se guardó el gasto: ${concept} por $${amount.toFixed(2)}`, 'success');
}

function saveROIPayment() {
    const amount = parseFloat(document.getElementById('roi-amount').value);
    if (isNaN(amount) || amount <= 0) return;

    window.ROUVA_DATA.pagosInversion += amount;
    saveData();

    document.getElementById('roi-form').reset();
    document.getElementById('roi-modal-container').classList.add('hidden');

    renderDashboard();
    showNotification('¡Abono Registrado!', `Has abonado $${amount.toFixed(2)} a la recuperación de inversión.`, 'success');
}

function updateInitialInvestment() {
    const total = parseFloat(document.getElementById('config-roi-total').value);
    if (isNaN(total) || total < 0) return;

    window.ROUVA_DATA.inversionInicial = total;
    saveData();

    document.getElementById('config-roi-modal-container').classList.add('hidden');

    renderDashboard();
    showNotification('Configuración Guardada', `La inversión inicial se ha actualizado a $${total.toFixed(2)}`, 'success');
}

function copySyncData() {
    const dataStr = btoa(JSON.stringify(window.ROUVA_DATA)); // Codificar en Base64 para que no se vea tan feo
    const textarea = document.getElementById('sync-data-text');
    textarea.value = dataStr;
    textarea.select();
    document.execCommand('copy');
    showNotification('¡Copiado!', 'El código de tus datos está en el portapapeles. Envíalo a tu otro dispositivo.', 'success');
}

function importSyncData() {
    const dataStr = document.getElementById('sync-data-text').value.trim();
    if (!dataStr) return showNotification('Error', 'Pega el código de sincronización primero.', 'error');

    showNotification(
        '¿Importar Datos?', 
        'Esto borrará tus ventas actuales en este dispositivo y las reemplazará con las nuevas. ¿Continuar?', 
        'warning',
        () => {
            try {
                const decoded = atob(dataStr);
                const newData = JSON.parse(decoded);
                
                // Validación básica
                if (newData.ventas && newData.precios) {
                    window.ROUVA_DATA = newData;
                    saveData();
                    location.reload(); // Recargar para aplicar todo
                } else {
                    throw new Error("Formato inválido");
                }
            } catch (e) {
                showNotification('Error de Formato', 'El código de sincronización no es válido.', 'error');
            }
        },
        true
    );
}
