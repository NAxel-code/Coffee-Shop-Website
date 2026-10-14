/**
 * MR.COFFEE - MAIN JAVASCRIPT ENGINE & COMPONENT MOTION
 * Handles: Cart State with POS Item Options, Quick Drawer, POS Cashier Modal,
 *          Store Operational Status, Order History Reorder, Scroll Reveals, Mobile Nav
 */

// Global Cart State Manager
const MrCoffeeCart = {
    STORAGE_KEY: 'mrcoffee_cart_v2',

    getItems() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    },

    saveItems(items) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
        this.notifyListeners();
    },

    getItemKey(item) {
        const opt = item.options || {};
        return `${(item.name || '').toLowerCase()}__${opt.temp || ''}__${opt.sugar || ''}__${opt.milk || ''}__${opt.ice || ''}__${(opt.notes || '').toLowerCase()}`;
    },

    addItem(product, qty = 1, options = null) {
        const items = this.getItems();
        const itemOptions = options || product.options || null;

        const dummyItem = {
            name: product.name,
            options: itemOptions
        };
        const itemKey = this.getItemKey(dummyItem);
        const existing = items.find(i => this.getItemKey(i) === itemKey);

        // Clean numeric price
        const numPrice = typeof product.price === 'number'
            ? product.price
            : parseInt(String(product.price).replace(/[^\d]/g, ''), 10) || 0;

        if (existing) {
            existing.qty += qty;
        } else {
            items.push({
                id: product.id || product.name.toLowerCase().replace(/\s+/g, '-'),
                name: product.name,
                price: numPrice,
                image: product.image || 'images/product1.jpeg',
                category: product.category || 'Espresso',
                qty: qty,
                options: itemOptions
            });
        }
        this.saveItems(items);
        this.showToast(`☕ <strong>${product.name}</strong> ditambahkan ke pesanan!`);
        this.triggerBadgePulse();
    },

    updateQty(index, delta) {
        let items = this.getItems();
        if (items[index]) {
            items[index].qty += delta;
            if (items[index].qty <= 0) {
                items.splice(index, 1);
            }
            this.saveItems(items);
        }
    },

    removeItem(index) {
        let items = this.getItems();
        if (items[index]) {
            items.splice(index, 1);
            this.saveItems(items);
        }
    },

    clearCart() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.notifyListeners();
    },

    getTotal() {
        return this.getItems().reduce((sum, item) => sum + (item.price * item.qty), 0);
    },

    getCount() {
        return this.getItems().reduce((count, item) => count + item.qty, 0);
    },

    formatRp(amount) {
        return 'Rp ' + Number(amount || 0).toLocaleString('id-ID');
    },

    listeners: [],
    subscribe(fn) {
        this.listeners.push(fn);
    },
    notifyListeners() {
        this.updateBadge();
        this.renderDrawer();
        this.listeners.forEach(fn => fn(this.getItems()));
    },

    updateBadge() {
        const badges = document.querySelectorAll('.cart-badge');
        const count = this.getCount();
        badges.forEach(badge => {
            badge.textContent = count;
        });
    },

    triggerBadgePulse() {
        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(badge => {
            badge.classList.remove('pulse');
            void badge.offsetWidth; // trigger reflow
            badge.classList.add('pulse');
        });
    },

    showToast(message) {
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = 'toast-msg';
        toast.innerHTML = `
            <span>${message}</span>
            <button style="background:none; border:none; color:rgba(255,255,255,0.7); cursor:pointer; font-size:1.1rem; margin-left:8px;" onclick="this.parentElement.remove()">&times;</button>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 350);
        }, 3200);
    },

    reorderLast() {
        let history = [];
        try {
            history = JSON.parse(localStorage.getItem('mrcoffee_order_history') || '[]');
        } catch (e) {}
        if (history.length === 0) {
            this.showToast('Belum ada riwayat pesanan sebelumnya.');
            return;
        }
        const lastOrder = history[0];
        lastOrder.items.forEach(item => {
            this.addItem({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                category: item.category,
                options: item.options
            }, item.qty);
        });
        this.showToast(`✨ Pesanan <strong>${lastOrder.orderId}</strong> berhasil dimasukkan ke keranjang!`);
        
        // Open drawer
        const overlay = document.querySelector('.cart-drawer-overlay');
        const drawer = document.querySelector('.cart-drawer');
        if (overlay && drawer) {
            overlay.classList.add('active');
            drawer.classList.add('active');
            this.renderDrawer();
        }
    },

    renderDrawer() {
        const drawerBody = document.querySelector('.cart-drawer-body');
        const subtotalEl = document.querySelector('.cart-subtotal-val');
        const checkoutBtn = document.querySelector('.drawer-checkout-btn');
        if (!drawerBody) return;

        // Check order history for reorder banner
        let history = [];
        try {
            history = JSON.parse(localStorage.getItem('mrcoffee_order_history') || '[]');
        } catch (e) {}

        let reorderBanner = '';
        if (history.length > 0) {
            const lastOrder = history[0];
            const itemNames = lastOrder.items.map(i => `${i.qty}x ${i.name}`).slice(0, 2).join(', ');
            reorderBanner = `
                <div class="cart-reorder-banner">
                    <div class="cart-reorder-info">
                        <strong>Pesanan Terakhir (${lastOrder.orderId})</strong>
                        <span>${itemNames}${lastOrder.items.length > 2 ? '...' : ''}</span>
                    </div>
                    <button class="btn-mini-reorder" onclick="MrCoffeeCart.reorderLast()">Pesan Lagi 🔁</button>
                </div>
            `;
        }

        const items = this.getItems();
        if (items.length === 0) {
            drawerBody.innerHTML = `
                ${reorderBanner}
                <div class="cart-empty-state">
                    <div class="cart-empty-icon">☕</div>
                    <h4 style="color:var(--primary-color); margin-bottom:6px;">Keranjang Masih Kosong</h4>
                    <p style="font-size:0.88rem;">Pilih kopi favorit Anda dari menu dan rasakan kenikmatannya.</p>
                </div>
            `;
            if (subtotalEl) subtotalEl.textContent = 'Rp 0';
            if (checkoutBtn) {
                checkoutBtn.disabled = true;
                checkoutBtn.style.opacity = '0.5';
                checkoutBtn.style.cursor = 'not-allowed';
            }
            return;
        }

        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.style.opacity = '1';
            checkoutBtn.style.cursor = 'pointer';
        }

        const itemsHTML = items.map((item, idx) => {
            // Fix image path if inside pages/
            let imgSrc = item.image;
            if (window.MrCoffeeProducts) {
                imgSrc = window.MrCoffeeProducts.resolveImage(imgSrc);
            } else {
                const isInsidePages = window.location.pathname.includes('/pages/');
                if (!isInsidePages && imgSrc.startsWith('../')) {
                    imgSrc = imgSrc.replace('../', '');
                } else if (isInsidePages && !imgSrc.startsWith('../') && !imgSrc.startsWith('http')) {
                    imgSrc = '../' + imgSrc;
                }
            }

            // Options summary badge
            let optionsText = '';
            if (item.options) {
                const opt = item.options;
                const parts = [];
                if (opt.temp) parts.push(opt.temp === 'iced' ? '🧊 Iced' : '☕ Hot');
                if (opt.sugar && opt.sugar !== '100%') parts.push(`Gula: ${opt.sugar}`);
                if (opt.milk === 'oat') parts.push('🌾 Oat Milk');
                if (opt.temp === 'iced' && opt.ice === 'less') parts.push('❄️ Less Ice');
                if (opt.notes) parts.push(`"${opt.notes}"`);
                if (parts.length > 0) {
                    optionsText = `<div class="cart-item-options-text">${parts.join(' • ')}</div>`;
                }
            }

            return `
                <div class="cart-item-row">
                    <img src="${imgSrc}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150'">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        ${optionsText}
                        <div class="cart-item-price">${this.formatRp(item.price)}</div>
                    </div>
                    <div class="cart-item-qty-controls">
                        <button class="qty-btn" onclick="MrCoffeeCart.updateQty(${idx}, -1)">−</button>
                        <span class="qty-number">${item.qty}</span>
                        <button class="qty-btn" onclick="MrCoffeeCart.updateQty(${idx}, 1)">+</button>
                    </div>
                </div>
            `;
        }).join('');

        drawerBody.innerHTML = reorderBanner + itemsHTML;

        if (subtotalEl) {
            subtotalEl.textContent = this.formatRp(this.getTotal());
        }
    }
};

// Make accessible on window
window.MrCoffeeCart = MrCoffeeCart;

// ==========================================================================
// MR.COFFEE POS CASHIER & ITEM CUSTOMIZATION MODAL ENGINE
// ==========================================================================
const MrCoffeePOS = {
    activeProduct: null,
    currentOptions: {
        temp: 'hot',
        sugar: '100%',
        milk: 'regular',
        ice: 'normal',
        notes: ''
    },
    currentQty: 1,

    init() {
        if (document.querySelector('.pos-modal-backdrop')) return;

        const backdrop = document.createElement('div');
        backdrop.className = 'pos-modal-backdrop';
        backdrop.innerHTML = `
            <div class="pos-modal">
                <div class="pos-modal-header">
                    <div class="pos-header-info">
                        <h3 class="pos-modal-title">Item Name</h3>
                        <div class="pos-header-badges">
                            <span class="pos-meta-tag pos-modal-cat">Espresso</span>
                            <span class="pos-meta-origin pos-modal-origin">Origin</span>
                        </div>
                    </div>
                    <button class="pos-close-btn" aria-label="Tutup" onclick="MrCoffeePOS.closeModal()">&times;</button>
                </div>
                <div class="pos-modal-body">
                    <!-- Product Overview -->
                    <div class="pos-product-overview">
                        <img src="" alt="" class="pos-product-img">
                        <div class="pos-overview-text">
                            <div class="pos-price-row">
                                <span class="pos-base-price">Rp 0</span>
                                <span class="pos-roast-badge" style="font-size:0.75rem; color:var(--text-light);">(Harga Dasar)</span>
                            </div>
                            <p class="pos-desc-paragraph"></p>
                            <div class="pos-taste-notes-callout"></div>
                        </div>
                    </div>

                    <!-- POS Customization Form -->
                    <div class="pos-customization-section">
                        <!-- Suhu -->
                        <div class="pos-form-group pos-temp-group">
                            <div class="pos-section-label">
                                <span>Suhu Penyajian</span>
                                <span class="req">Wajib</span>
                            </div>
                            <div class="pos-chips-group pos-temp-chips">
                                <div class="pos-chip" data-temp="hot" onclick="MrCoffeePOS.selectTemp('hot')">☕ Panas (Hot)</div>
                                <div class="pos-chip" data-temp="iced" onclick="MrCoffeePOS.selectTemp('iced')">🧊 Dingin (Iced)</div>
                            </div>
                        </div>

                        <!-- Tingkat Manis -->
                        <div class="pos-form-group">
                            <div class="pos-section-label">
                                <span>Tingkat Kemanisan (Sugar Level)</span>
                                <span class="req">Pilihan</span>
                            </div>
                            <div class="pos-chips-group pos-sugar-chips">
                                <div class="pos-chip active" data-sugar="100%" onclick="MrCoffeePOS.selectSugar('100%')">100% Normal</div>
                                <div class="pos-chip" data-sugar="50%" onclick="MrCoffeePOS.selectSugar('50%')">50% Less Sugar</div>
                                <div class="pos-chip" data-sugar="0%" onclick="MrCoffeePOS.selectSugar('0%')">0% No Sugar</div>
                            </div>
                        </div>

                        <!-- Pilihan Susu -->
                        <div class="pos-form-group pos-milk-group">
                            <div class="pos-section-label">
                                <span>Pilihan Susu</span>
                                <span class="req">Substitusi</span>
                            </div>
                            <div class="pos-chips-group pos-milk-chips">
                                <div class="pos-chip active" data-milk="regular" onclick="MrCoffeePOS.selectMilk('regular')">🥛 Fresh Milk (Standar)</div>
                                <div class="pos-chip" data-milk="oat" onclick="MrCoffeePOS.selectMilk('oat')">🌾 Oat Milk (+Rp 8.000)</div>
                            </div>
                        </div>

                        <!-- Pilihan Es -->
                        <div class="pos-form-group pos-ice-group">
                            <div class="pos-section-label">
                                <span>Jumlah Es Batu (Ice Level)</span>
                                <span class="req">Pilihan</span>
                            </div>
                            <div class="pos-chips-group pos-ice-chips">
                                <div class="pos-chip active" data-ice="normal" onclick="MrCoffeePOS.selectIce('normal')">🧊 Es Normal</div>
                                <div class="pos-chip" data-ice="less" onclick="MrCoffeePOS.selectIce('less')">❄️ Sedikit Es (Less)</div>
                            </div>
                        </div>

                        <!-- Catatan Barista -->
                        <div class="pos-form-group">
                            <div class="pos-section-label">
                                <span>Catatan Khusus untuk Barista</span>
                            </div>
                            <input type="text" class="pos-input-text pos-notes-input" placeholder="Contoh: ekstra sedotan, pisahkan es batu, jangan terlalu panas...">
                        </div>
                    </div>
                </div>
                <div class="pos-modal-footer">
                    <div class="pos-qty-controls">
                        <button class="pos-qty-btn" onclick="MrCoffeePOS.changeQty(-1)">−</button>
                        <span class="pos-qty-val">1</span>
                        <button class="pos-qty-btn" onclick="MrCoffeePOS.changeQty(1)">+</button>
                    </div>
                    <button class="pos-add-to-order-btn" onclick="MrCoffeePOS.submitItem()">
                        <span>+ Tambah ke Pesanan</span>
                        <span class="pos-btn-total-val">• Rp 0</span>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(backdrop);
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) MrCoffeePOS.closeModal();
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') MrCoffeePOS.closeModal();
        });
    },

    openModal(productIdOrName) {
        this.init();
        if (!window.MrCoffeeProducts) return;

        const p = window.MrCoffeeProducts.getById(productIdOrName);
        if (!p) return;

        this.activeProduct = p;
        this.currentQty = 1;
        this.currentOptions = {
            temp: p.defaultTemp || 'hot',
            sugar: '100%',
            milk: 'regular',
            ice: 'normal',
            notes: ''
        };

        const backdrop = document.querySelector('.pos-modal-backdrop');
        backdrop.querySelector('.pos-modal-title').textContent = p.name;
        backdrop.querySelector('.pos-modal-cat').textContent = p.categoryLabel || p.category;
        backdrop.querySelector('.pos-modal-origin').textContent = `${p.origin} • ${p.roastLevel}`;

        const imgEl = backdrop.querySelector('.pos-product-img');
        imgEl.src = window.MrCoffeeProducts.resolveImage(p.image);
        imgEl.alt = p.name;

        backdrop.querySelector('.pos-base-price').textContent = window.MrCoffeeProducts.formatRp(p.price);
        backdrop.querySelector('.pos-desc-paragraph').textContent = p.description;
        backdrop.querySelector('.pos-taste-notes-callout').textContent = `✨ Taste Profile: ${p.notes}`;

        // Configure Temperature chips
        const tempChips = backdrop.querySelectorAll('.pos-temp-chips .pos-chip');
        tempChips.forEach(chip => {
            const t = chip.getAttribute('data-temp');
            const isAllowed = p.allowedTemps.includes(t);
            if (isAllowed) {
                chip.classList.remove('disabled');
                chip.classList.toggle('active', t === this.currentOptions.temp);
            } else {
                chip.classList.add('disabled');
                chip.classList.remove('active');
            }
        });

        // Configure Milk Group
        const milkGroup = backdrop.querySelector('.pos-milk-group');
        if (p.hasMilk) {
            milkGroup.style.display = 'block';
            this.updateMilkChips();
        } else {
            milkGroup.style.display = 'none';
        }

        // Configure Ice Group
        this.updateIceVisibility();
        this.updateSugarChips();

        const notesInput = backdrop.querySelector('.pos-notes-input');
        if (notesInput) notesInput.value = '';

        backdrop.querySelector('.pos-qty-val').textContent = '1';
        this.updateFooterTotal();

        backdrop.classList.add('active');
    },

    closeModal() {
        const backdrop = document.querySelector('.pos-modal-backdrop');
        if (backdrop) backdrop.classList.remove('active');
    },

    selectTemp(temp) {
        if (!this.activeProduct || !this.activeProduct.allowedTemps.includes(temp)) return;
        this.currentOptions.temp = temp;
        const chips = document.querySelectorAll('.pos-temp-chips .pos-chip');
        chips.forEach(c => c.classList.toggle('active', c.getAttribute('data-temp') === temp));
        this.updateIceVisibility();
    },

    updateIceVisibility() {
        const iceGroup = document.querySelector('.pos-ice-group');
        if (!iceGroup) return;
        if (this.currentOptions.temp === 'iced') {
            iceGroup.style.display = 'block';
            const chips = document.querySelectorAll('.pos-ice-chips .pos-chip');
            chips.forEach(c => c.classList.toggle('active', c.getAttribute('data-ice') === this.currentOptions.ice));
        } else {
            iceGroup.style.display = 'none';
        }
    },

    selectSugar(sugar) {
        this.currentOptions.sugar = sugar;
        this.updateSugarChips();
    },

    updateSugarChips() {
        const chips = document.querySelectorAll('.pos-sugar-chips .pos-chip');
        chips.forEach(c => c.classList.toggle('active', c.getAttribute('data-sugar') === this.currentOptions.sugar));
    },

    selectMilk(milk) {
        this.currentOptions.milk = milk;
        this.updateMilkChips();
        this.updateFooterTotal();
    },

    updateMilkChips() {
        const chips = document.querySelectorAll('.pos-milk-chips .pos-chip');
        chips.forEach(c => c.classList.toggle('active', c.getAttribute('data-milk') === this.currentOptions.milk));
    },

    selectIce(ice) {
        this.currentOptions.ice = ice;
        const chips = document.querySelectorAll('.pos-ice-chips .pos-chip');
        chips.forEach(c => c.classList.toggle('active', c.getAttribute('data-ice') === ice));
    },

    changeQty(delta) {
        this.currentQty = Math.max(1, this.currentQty + delta);
        const qtyVal = document.querySelector('.pos-qty-val');
        if (qtyVal) qtyVal.textContent = this.currentQty;
        this.updateFooterTotal();
    },

    getUnitPrice() {
        if (!this.activeProduct) return 0;
        let p = this.activeProduct.price;
        if (this.activeProduct.hasMilk && this.currentOptions.milk === 'oat') {
            p += 8000;
        }
        return p;
    },

    updateFooterTotal() {
        const btnVal = document.querySelector('.pos-btn-total-val');
        if (!btnVal) return;
        const total = this.getUnitPrice() * this.currentQty;
        btnVal.textContent = `• ${MrCoffeeCart.formatRp(total)}`;
    },

    submitItem() {
        if (!this.activeProduct) return;
        const notesInput = document.querySelector('.pos-notes-input');
        if (notesInput) {
            this.currentOptions.notes = notesInput.value.trim();
        }

        const unitPrice = this.getUnitPrice();
        MrCoffeeCart.addItem({
            id: this.activeProduct.id,
            name: this.activeProduct.name,
            category: this.activeProduct.categoryLabel || this.activeProduct.category,
            image: this.activeProduct.image,
            price: unitPrice,
            options: { ...this.currentOptions }
        }, this.currentQty);

        this.closeModal();
    }
};

window.MrCoffeePOS = MrCoffeePOS;

// ==========================================================================
// HOME PAGE: MOST ORDERED CATALOG RENDERER
// ==========================================================================
function renderMostOrdered() {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    const products = window.MrCoffeeProducts ? window.MrCoffeeProducts.getMostOrdered() : [];
    if (products.length === 0) return;

    grid.innerHTML = products.map((p, idx) => `
        <div class="product-card reveal stagger-${(idx % 4) + 1}">
            ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
            <div class="img-container" onclick="MrCoffeePOS.openModal('${p.id}')" style="cursor:pointer;" title="Klik untuk lihat detail & kustomisasi">
                <img src="${p.image}" alt="${p.name}" loading="lazy">
            </div>
            <div class="product-info">
                <span class="product-category-tag">${p.categoryLabel || p.category}</span>
                <h3 onclick="MrCoffeePOS.openModal('${p.id}')" style="cursor:pointer;">${p.name}</h3>
                <p class="product-taste-notes">${p.notes}</p>
                <div class="product-card-footer">
                    <span class="price">${MrCoffeeCart.formatRp(p.price)}</span>
                    <button class="btn-quick-add" onclick="MrCoffeePOS.openModal('${p.id}')">
                        <span>+ Pesan</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Copy Promo Voucher
window.copyPromoCode = function (code) {
    navigator.clipboard.writeText(code).then(() => {
        MrCoffeeCart.showToast(`✨ Kode promo <strong>${code}</strong> berhasil disalin!`);
    }).catch(() => {
        MrCoffeeCart.showToast(`✨ Kode promo: <strong>${code}</strong>`);
    });
};

// ==========================================================================
// QUICK CART DRAWER DOM & ACTIONS
// ==========================================================================
function setupCartDrawer() {
    if (document.querySelector('.cart-drawer')) return;

    const isInsidePages = window.location.pathname.includes('/pages/');
    const orderPageUrl = isInsidePages ? 'order.html' : 'pages/order.html';

    const drawerHTML = `
        <div class="cart-drawer-overlay"></div>
        <div class="cart-drawer">
            <div class="cart-drawer-header">
                <h3>Keranjang Anda</h3>
                <button class="close-drawer-btn" title="Tutup">&times;</button>
            </div>
            <div class="cart-drawer-body">
                <!-- Rendered dynamically -->
            </div>
            <div class="cart-drawer-footer">
                <div class="cart-subtotal-row">
                    <span class="cart-subtotal-label">Total Belanja</span>
                    <span class="cart-subtotal-val">Rp 0</span>
                </div>
                <a href="${orderPageUrl}" class="btn-primary drawer-checkout-btn" style="width:100%; text-align:center;">
                    Lanjut ke Pembayaran →
                </a>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHTML);

    const overlay = document.querySelector('.cart-drawer-overlay');
    const drawer = document.querySelector('.cart-drawer');
    const closeBtn = document.querySelector('.close-drawer-btn');
    const triggers = document.querySelectorAll('.cart-trigger-btn');

    function openDrawer() {
        overlay.classList.add('active');
        drawer.classList.add('active');
        MrCoffeeCart.renderDrawer();
    }

    function closeDrawer() {
        overlay.classList.remove('active');
        drawer.classList.remove('active');
    }

    triggers.forEach(t => t.addEventListener('click', (e) => {
        e.preventDefault();
        openDrawer();
    }));

    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    // Initial render
    MrCoffeeCart.updateBadge();
}

// ==========================================================================
// STORE OPERATIONAL STATUS (07.00 - 22.00 WIB)
// ==========================================================================
function setupStoreStatus() {
    const now = new Date();
    // Jakarta is UTC+7
    const jakartaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const currentHour = jakartaTime.getHours();

    // Operating hours: 07:00 to 22:00 WIB
    const isOpen = currentHour >= 7 && currentHour < 22;

    const badges = document.querySelectorAll('.store-status-badge');
    badges.forEach(badge => {
        if (isOpen) {
            badge.className = 'store-status-badge open';
            badge.setAttribute('title', 'Kafe Sedang Buka (Jam Operasional: 07.00 - 22.00 WIB)');
            badge.innerHTML = `
                <span class="status-indicator-dot open"></span>
                <span>Buka</span>
                <span class="badge-long-text">• 07-22 WIB</span>
            `;
        } else {
            badge.className = 'store-status-badge closed';
            badge.setAttribute('title', 'Kafe Sedang Tutup (Buka besok pukul 07.00 WIB)');
            badge.innerHTML = `
                <span class="status-indicator-dot closed"></span>
                <span>Tutup</span>
                <span class="badge-long-text">• Buka 07.00</span>
            `;
        }
    });
}

// Mobile Hamburger Menu
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close on nav click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// Scroll Navbar Blur and Shrink
function setupNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });
}

// Intersection Observer for Scroll Reveals
function setupScrollReveals() {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.02, rootMargin: '0px 0px 120px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Fallback safeguard so content is never hidden on full-page previews or fast loads
    setTimeout(() => {
        document.querySelectorAll('.reveal:not(.is-revealed)').forEach(el => {
            el.classList.add('is-revealed');
        });
    }, 700);
}

// DOM Ready initialization
document.addEventListener('DOMContentLoaded', () => {
    setupStoreStatus();
    setupNavbarScroll();
    setupMobileMenu();
    setupCartDrawer();
    renderMostOrdered();
    setupScrollReveals();
});
