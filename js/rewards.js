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

// ==========================================================================
// CHAGEE-STYLE COFFEE CUP STAMP HUNT (10 CUPS PROGRESS)
// ==========================================================================
function getStampCount() {
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('mrcoffee_order_history') || '[]');
    } catch (e) {}

    const cupsFromOrders = history.reduce((sum, ord) => {
        return sum + (ord.items || []).reduce((iSum, itm) => iSum + (Number(itm.qty) || 1), 0);
    }, 0);

    // Additional demo/simulated stamps saved in localStorage if any
    let bonusStamps = 0;
    try {
        bonusStamps = Number(localStorage.getItem('mrcoffee_demo_bonus_stamps') || '4');
    } catch (e) {
        bonusStamps = 4;
    }

    const total = cupsFromOrders + bonusStamps;
    return Math.min(10, Math.max(0, total));
}

function renderStampHunt() {
    const container = document.getElementById('stampHuntContainer');
    if (!container) return;

    const count = getStampCount();
    const isCompleted = count >= 10;
    const percent = count * 10;
    const remaining = 10 - count;

    let slotsHtml = '';
    for (let i = 1; i <= 9; i++) {
        if (i <= count) {
            slotsHtml += `
                <div class="stamp-slot stamped" title="Cup #${i}: Terstempel">
                    <div class="stamp-slot-icon">☕</div>
                    <div class="stamp-slot-badge">✓ Cup ${i}</div>
                </div>
            `;
        } else {
            slotsHtml += `
                <div class="stamp-slot empty" title="Cup #${i}: Belum Terstempel">
                    <div class="stamp-slot-icon">☕</div>
                    <div class="stamp-slot-num">Cup #${i}</div>
                </div>
            `;
        }
    }

    // 10th Slot: The Free Coffee Reward
    if (isCompleted) {
        slotsHtml += `
            <div class="stamp-slot reward-slot completed" title="Cup #10: Selamat! Hadiah Free Coffee Anda Siap Digunakan!">
                <div class="stamp-slot-icon">🎁</div>
                <div class="stamp-slot-badge">GRATIS!</div>
            </div>
        `;
    } else {
        slotsHtml += `
            <div class="stamp-slot reward-slot" title="Cup #10: 1 Cangkir Kopi Gratis">
                <div class="stamp-slot-icon">🎁</div>
                <div class="stamp-slot-badge">Cup #10 Free</div>
            </div>
        `;
    }

    const actionHtml = isCompleted ? `
        <div class="stamp-action-group">
            <button class="btn-claim-free-coffee" onclick="claimStampFreeCoffee()">
                <span>🎁 Klaim 1 Cangkir Kopi Gratis Sekarang!</span>
            </button>
            <button class="btn-demo-stamp" onclick="resetStampDemo()" title="Reset simulasi stamp untuk coba lagi">
                <span>🔄 Reset Simulasi</span>
            </button>
            <span class="stamp-reward-sub">Gunakan kode voucher <strong>FREECOFFEE</strong> saat checkout untuk potongan 100%.</span>
        </div>
    ` : `
        <div class="stamp-action-group">
            <a href="order.html" class="btn-collect-stamps">
                <span>+ Pesan Kopi & Kumpulkan Stamp</span>
            </a>
            <button class="btn-demo-stamp" onclick="demoAddStamp()" title="Tambah 1 stamp simulasi">
                <span>⚡ +1 Stamp (Simulasi)</span>
            </button>
            <span class="stamp-reward-sub">Tersisa <strong>${remaining} cangkir</strong> lagi untuk unlock cangkir ke-10 gratis.</span>
        </div>
    `;

    container.innerHTML = `
        <div class="stamp-hunt-card">
            <div class="stamp-hunt-header">
                <div class="stamp-hunt-title-group">
                    <span class="stamp-kicker">LOYALTY STAMP HUNT</span>
                    <h2>☕ Kumpulkan 10 Stamp Cangkir</h2>
                    <p>Setiap cangkir kopi yang dipesan memberikan 1 stamp digital. Kumpulkan 10 stamp dan nikmati <strong>1 Cup Signature Coffee Gratis!</strong></p>
                </div>
                <div class="stamp-hunt-badge">
                    <span class="stamp-count-val">${count}</span> / 10 Stamp
                </div>
            </div>

            <!-- 10 Stamp Slots Grid -->
            <div class="stamp-slots-grid">
                ${slotsHtml}
            </div>

            <!-- Stamp Progress Bar -->
            <div class="stamp-progress-section">
                <div class="stamp-progress-header">
                    <span>${isCompleted ? '🎉 Selamat! Target 10 cangkir tercapai!' : `Progres: ${count} dari 10 cangkir terkumpul`}</span>
                    <strong>${percent}%</strong>
                </div>
                <div class="stamp-progress-bar">
                    <div class="stamp-progress-fill" style="width: ${percent}%;"></div>
                </div>
            </div>

            <!-- Action Bar -->
            ${actionHtml}
        </div>
    `;
}

window.demoAddStamp = function () {
    let current = Number(localStorage.getItem('mrcoffee_demo_bonus_stamps') || '4');
    current = Math.min(10, current + 1);
    localStorage.setItem('mrcoffee_demo_bonus_stamps', current.toString());
    renderStampHunt();
    if (window.MrCoffeeCart) {
        if (current === 10) {
            window.MrCoffeeCart.showToast('🎉 Selamat! 10 Stamp Cangkir Lengkap! Klaim 1 cup kopi gratis Anda sekarang!');
        } else {
            window.MrCoffeeCart.showToast(`✨ Stamp berhasil ditambahkan! Total: <strong>${current}/10</strong> cangkir.`);
        }
    }
};

window.resetStampDemo = function () {
    localStorage.setItem('mrcoffee_demo_bonus_stamps', '4');
    renderStampHunt();
    if (window.MrCoffeeCart) {
        window.MrCoffeeCart.showToast('🔄 Simulasi stamp di-reset kembali ke 4/10.');
    }
};

window.claimStampFreeCoffee = function () {
    navigator.clipboard.writeText('FREECOFFEE').then(() => {
        if (window.MrCoffeeCart) {
            window.MrCoffeeCart.showToast('🎁 Kode <strong>FREECOFFEE</strong> disalin! Mengarahkan ke menu pemesanan...');
        }
        setTimeout(() => {
            window.location.href = 'order.html';
        }, 800);
    }).catch(() => {
        if (window.MrCoffeeCart) {
            window.MrCoffeeCart.showToast('🎁 Kode Promo: <strong>FREECOFFEE</strong> (Diskon 100% 1 cup kopi)');
        }
        setTimeout(() => {
            window.location.href = 'order.html';
        }, 800);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    renderRecentOrders();
    renderStampHunt();

    const modal = document.getElementById('appDownloadModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeAppDownload();
            }
        });
    }
});
