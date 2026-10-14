/**
 * MR.COFFEE - REWARDS & PROMO ENGINE
 * Handles: Copy Voucher, Direct Redeem in Order, App Download Modal,
 *          Order History Display & 1-Click Reorder
 */

window.copyVoucher = function (code, btn) {
    navigator.clipboard.writeText(code).then(() => {
        if (window.MrCoffeeCart) {
            window.MrCoffeeCart.showToast(`✨ Kode promo <strong>${code}</strong> berhasil disalin!`);
        }
        if (btn) {
            const originalText = btn.innerHTML;
            btn.innerHTML = '✓ Disalin';
            btn.style.color = '#2D6A4F';
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.style.color = '';
            }, 1800);
        }
    }).catch(() => {
        if (window.MrCoffeeCart) {
            window.MrCoffeeCart.showToast(`✨ Kode promo: <strong>${code}</strong>`);
        }
    });
};

window.redeemVoucher = function (code) {
    if (window.MrCoffeeCart) {
        window.MrCoffeeCart.showToast(`🚀 Membuka pemesanan dengan voucher <strong>${code}</strong>...`);
    }
    // Redirect to order page
    setTimeout(() => {
        window.location.href = 'order.html';
    }, 400);
};

window.showAppDownload = function () {
    const modal = document.getElementById('appDownloadModal');
    if (modal) {
        modal.classList.add('active');
    }
};

window.closeAppDownload = function () {
    const modal = document.getElementById('appDownloadModal');
    if (modal) {
        modal.classList.remove('active');
    }
};

function renderRecentOrders() {
    const container = document.getElementById('recentOrdersContainer');
    if (!container) return;

    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('mrcoffee_order_history') || '[]');
    } catch (e) {}

    if (history.length === 0) {
        container.innerHTML = `
            <div class="recent-orders-card" style="text-align:center; padding: 2rem;">
                <div style="font-size: 2.2rem; margin-bottom: 8px;">☕</div>
                <h4 style="color:var(--primary-color); margin-bottom: 4px;">Belum Ada Riwayat Pesanan</h4>
                <p style="font-size: 0.88rem; color:var(--text-muted); max-width: 420px; margin: 0 auto 1.2rem;">
                    Pesanan yang Anda buat melalui website akan tercatat otomatis di sini agar mudah dipesan ulang dalam 1 klik.
                </p>
                <a href="order.html" class="btn-primary" style="display:inline-block;">Pesan Kopi Sekarang →</a>
            </div>
        `;
        return;
    }

    const cardsHtml = history.map((order, orderIdx) => {
        const itemsList = order.items.map(item => {
            let optStr = '';
            if (item.options) {
                const opt = item.options;
                const parts = [];
                if (opt.temp) parts.push(opt.temp === 'iced' ? 'Iced' : 'Hot');
                if (opt.sugar && opt.sugar !== '100%') parts.push(opt.sugar);
                if (opt.milk === 'oat') parts.push('Oat Milk');
                if (parts.length > 0) optStr = ` (${parts.join(', ')})`;
            }
            return `${item.qty}x ${item.name}${optStr}`;
        }).join(', ');

        return `
            <div class="recent-order-item-box">
                <div class="recent-order-meta">
                    <strong>Order ${order.orderId}</strong> • <span style="color:var(--text-light);">${order.date}</span>
                    <p>${order.fulfillment} • ${itemsList}</p>
                </div>
                <div style="display:flex; align-items:center; gap: 14px;">
                    <div style="font-weight:700; color:var(--primary-color);">${window.MrCoffeeCart ? window.MrCoffeeCart.formatRp(order.total) : 'Rp ' + Number(order.total).toLocaleString('id-ID')}</div>
                    <button class="btn-reorder-main" onclick="reorderHistoricalOrder(${orderIdx})">
                        <span>Pesan Lagi 🔁</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="recent-orders-card">
            <div class="recent-orders-header">
                <h3><span>☕</span> Riwayat Pesanan Anda</h3>
                <span style="font-size:0.82rem; color:var(--accent-color); font-weight:600;">1-Click Reorder Aktif</span>
            </div>
            <div style="display:flex; flex-direction:column; gap: 10px;">
                ${cardsHtml}
            </div>
        </div>
    `;
}

window.reorderHistoricalOrder = function (index) {
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('mrcoffee_order_history') || '[]');
    } catch (e) {}

    const order = history[index];
    if (!order || !window.MrCoffeeCart) return;

    order.items.forEach(item => {
        window.MrCoffeeCart.addItem({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            category: item.category,
            options: item.options
        }, item.qty);
    });

    window.MrCoffeeCart.showToast(`✨ Pesanan <strong>${order.orderId}</strong> dimasukkan ke keranjang!`);

    // Open drawer
    const overlay = document.querySelector('.cart-drawer-overlay');
    const drawer = document.querySelector('.cart-drawer');
    if (overlay && drawer) {
        overlay.classList.add('active');
        drawer.classList.add('active');
        window.MrCoffeeCart.renderDrawer();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    renderRecentOrders();

    const modal = document.getElementById('appDownloadModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAppDownload();
            }
        });
    }
});
