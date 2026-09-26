/**
 * MR.COFFEE - MAIN JAVASCRIPT ENGINE & COMPONENT MOTION
 * Handles: Cart State, Quick Drawer, Toasts, Scroll Reveals, Mobile Nav
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

    addItem(product, qty = 1) {
        const items = this.getItems();
        const existing = items.find(i => i.name.toLowerCase() === product.name.toLowerCase());
        
        // Clean numeric price
        const numPrice = typeof product.price === 'number' 
            ? product.price 
            : parseInt(String(product.price).replace(/[^\d]/g, ''), 10) || 0;

        if (existing) {
            existing.qty += qty;
        } else {
            items.push({
                name: product.name,
                price: numPrice,
                image: product.image || 'images/product1.jpeg',
                category: product.category || 'Espresso',
                qty: qty
            });
        }
        this.saveItems(items);
        this.showToast(`☕ <strong>${product.name}</strong> ditambahkan ke pesanan!`);
        this.triggerBadgePulse();
    },

    updateQty(name, delta) {
        let items = this.getItems();
        const item = items.find(i => i.name.toLowerCase() === name.toLowerCase());
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) {
                items = items.filter(i => i.name.toLowerCase() !== name.toLowerCase());
            }
            this.saveItems(items);
        }
    },

    removeItem(name) {
        let items = this.getItems();
        items = items.filter(i => i.name.toLowerCase() !== name.toLowerCase());
        this.saveItems(items);
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
        return 'Rp ' + Number(amount).toLocaleString('id-ID');
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

    renderDrawer() {
        const drawerBody = document.querySelector('.cart-drawer-body');
        const subtotalEl = document.querySelector('.cart-subtotal-val');
        const checkoutBtn = document.querySelector('.drawer-checkout-btn');
        if (!drawerBody) return;

        const items = this.getItems();
        if (items.length === 0) {
            drawerBody.innerHTML = `
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

        drawerBody.innerHTML = items.map(item => {
            // Fix image path if inside pages/
            let imgSrc = item.image;
            const isInsidePages = window.location.pathname.includes('/pages/');
            if (!isInsidePages && imgSrc.startsWith('../')) {
                imgSrc = imgSrc.replace('../', '');
            } else if (isInsidePages && !imgSrc.startsWith('../') && !imgSrc.startsWith('http')) {
                imgSrc = '../' + imgSrc;
            }

            return `
                <div class="cart-item-row">
                    <img src="${imgSrc}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150'">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">${this.formatRp(item.price)}</div>
                    </div>
                    <div class="cart-item-qty-controls">
                        <button class="qty-btn" onclick="MrCoffeeCart.updateQty('${item.name.replace(/'/g, "\\'")}', -1)">−</button>
                        <span class="qty-number">${item.qty}</span>
                        <button class="qty-btn" onclick="MrCoffeeCart.updateQty('${item.name.replace(/'/g, "\\'")}', 1)">+</button>
                    </div>
                </div>
            `;
        }).join('');

        if (subtotalEl) {
            subtotalEl.textContent = this.formatRp(this.getTotal());
        }
    }
};

// Make accessible on window
window.MrCoffeeCart = MrCoffeeCart;

// Most Ordered Catalog for Home Page
const mostOrderedProducts = [
    {
        name: 'Americano',
        category: 'Signature Espresso',
        price: 35000,
        image: 'images/product1.jpeg',
        notes: 'Rich crema, floral undertones, clean bittersweet finish.',
        badge: 'Staff Pick'
    },
    {
        name: 'Cappuccino',
        category: 'Classic Espresso',
        price: 40000,
        image: 'images/product2.jpeg',
        notes: 'Velvety micro-foam with balanced dark chocolate notes.',
        badge: 'Best Seller'
    },
    {
        name: 'Cold Brew',
        category: 'Slow Dripped',
        price: 45000,
        image: 'images/product3.jpeg',
        notes: 'Steeped 16 hours. Ultra low acidity, bold cacao notes.',
        badge: 'Refreshing'
    },
    {
        name: 'Caramel Macchiato',
        category: 'Sweet Indulgence',
        price: 45000,
        image: 'images/product6.jpeg',
        notes: 'Vanilla steamed milk, bold ristretto & artisanal caramel.',
        badge: 'Popular'
    },
    {
        name: 'Japanese Iced Coffee',
        category: 'Flash Brewed',
        price: 48000,
        image: 'images/product8.jpeg',
        notes: 'Vibrant citrus acidity, flash chilled over crystal ice.',
        badge: 'Artisan'
    },
    {
        name: 'Hazelnut Frappuccino',
        category: 'Ice Blended',
        price: 50000,
        image: 'images/product 5.jpeg',
        notes: 'Roasted hazelnut paste, creamy espresso & whipped foam.',
        badge: 'Sweet Treat'
    }
];

// Initialize Home Most Ordered Grid
function renderMostOrdered() {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    grid.innerHTML = mostOrderedProducts.map((p, idx) => `
        <div class="product-card reveal stagger-${(idx % 4) + 1}">
            ${p.badge ? `<span class="product-badge">${p.badge}</span>` : ''}
            <div class="img-container">
                <img src="${p.image}" alt="${p.name}" loading="lazy">
            </div>
            <div class="product-info">
                <span class="product-category-tag">${p.category}</span>
                <h3>${p.name}</h3>
                <p class="product-taste-notes">${p.notes}</p>
                <div class="product-card-footer">
                    <span class="price">${MrCoffeeCart.formatRp(p.price)}</span>
                    <button class="btn-quick-add" onclick="handleQuickAdd(this, '${p.name.replace(/'/g, "\\'")}', ${p.price}, '${p.image}', '${p.category}')">
                        <span>+ Pesan</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Quick Add button tactile animation
window.handleQuickAdd = function(btn, name, price, image, category) {
    MrCoffeeCart.addItem({ name, price, image, category }, 1);
    
    // Visual feedback on button
    const originalText = btn.innerHTML;
    btn.classList.add('added');
    btn.innerHTML = '<span>✓ Ditambahkan</span>';
    setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = originalText;
    }, 1400);
};

// Copy Promo Voucher
window.copyPromoCode = function(code) {
    navigator.clipboard.writeText(code).then(() => {
        MrCoffeeCart.showToast(`✨ Kode promo <strong>${code}</strong> berhasil disalin!`);
    }).catch(() => {
        MrCoffeeCart.showToast(`✨ Kode promo: <strong>${code}</strong>`);
    });
};

// Setup Quick Cart Drawer DOM
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
    }, { threshold: 0.12 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// DOM Ready initialization
document.addEventListener('DOMContentLoaded', () => {
    setupNavbarScroll();
    setupMobileMenu();
    setupCartDrawer();
    renderMostOrdered();
    setupScrollReveals();
});
