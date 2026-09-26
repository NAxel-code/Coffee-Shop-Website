/**
 * MR.COFFEE - ORDER & CHECKOUT LOGIC ENGINE
 * Handles: Two-Way Cart Sync, Visual Picker, Add-ons Calculation, Promo Vouchers, Dynamic Receipt
 */

const orderCatalog = [
    { name: 'Americano', price: 35000, image: '../images/product1.jpeg', category: 'Espresso' },
    { name: 'Cappuccino', price: 40000, image: '../images/product2.jpeg', category: 'Espresso' },
    { name: 'Caramel Macchiato', price: 45000, image: '../images/product6.jpeg', category: 'Espresso' },
    { name: 'Cold Brew', price: 45000, image: '../images/product3.jpeg', category: 'Brewed' },
    { name: 'V60 Pour Over', price: 40000, image: '../images/product 9.jpeg', category: 'Brewed' },
    { name: 'Japanese Iced Coffee', price: 48000, image: '../images/product8.jpeg', category: 'Signature' },
    { name: 'Hazelnut Frappuccino', price: 50000, image: '../images/product 5.jpeg', category: 'Blended' },
    { name: 'Matcha Latte', price: 43000, image: '../images/product11.jpeg', category: 'Non-Coffee' }
];

const availableAddons = [
    { id: 'extra-espresso', name: 'Extra Espresso Shot', price: 8000 },
    { id: 'oat-milk', name: 'Oat Milk Substitution', price: 8000 },
    { id: 'whipped-cream', name: 'Whipped Cream Topping', price: 5000 },
    { id: 'caramel-sauce', name: 'Caramel Drizzle', price: 5000 },
    { id: 'vanilla-syrup', name: 'Madagascar Vanilla Syrup', price: 5000 }
];

let selectedAddons = [];
let fulfillmentType = 'dine-in';
let paymentMethod = 'qris';
let appliedPromo = null; // { code: 'COFFEEDUO', discountRate: 0.5 }

// Format Rupiah
function formatRp(val) {
    return 'Rp ' + Number(val).toLocaleString('id-ID');
}

// Initialize Quick Picker Grid
function renderPickerGrid() {
    const grid = document.querySelector('.order-item-picker');
    if (!grid) return;

    const cartItems = window.MrCoffeeCart ? window.MrCoffeeCart.getItems() : [];

    grid.innerHTML = orderCatalog.map(item => {
        const inCart = cartItems.find(c => c.name.toLowerCase() === item.name.toLowerCase());
        const isSelected = !!inCart;
        const qty = inCart ? inCart.qty : 0;

        return `
            <div class="picker-card ${isSelected ? 'selected' : ''}" onclick="togglePickerItem('${item.name.replace(/'/g, "\\'")}', ${item.price}, '${item.image}', '${item.category}')">
                ${qty > 0 ? `<span class="picker-card-badge">${qty}</span>` : ''}
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150'">
                <div class="picker-card-info">
                    <div class="picker-card-title">${item.name}</div>
                    <div class="picker-card-price">${formatRp(item.price)}</div>
                </div>
            </div>
        `;
    }).join('');
}

// Toggle or Add Item from Picker
window.togglePickerItem = function(name, price, image, category) {
    if (!window.MrCoffeeCart) return;

    const items = window.MrCoffeeCart.getItems();
    const existing = items.find(i => i.name.toLowerCase() === name.toLowerCase());

    if (existing) {
        // Increment quantity
        window.MrCoffeeCart.updateQty(name, 1);
    } else {
        window.MrCoffeeCart.addItem({ name, price, image, category }, 1);
    }

    renderPickerGrid();
    updateReceiptSummary();
};

// Render Add-ons Pills
function renderAddonsPills() {
    const container = document.querySelector('.addons-grid');
    if (!container) return;

    container.innerHTML = availableAddons.map(addon => {
        const isChecked = selectedAddons.some(a => a.id === addon.id);
        return `
            <label class="addon-pill ${isChecked ? 'active' : ''}">
                <div class="addon-left">
                    <input type="checkbox" value="${addon.id}" ${isChecked ? 'checked' : ''} onchange="handleAddonToggle('${addon.id}')">
                    <span>${addon.name}</span>
                </div>
                <span class="addon-price-tag">+${formatRp(addon.price)}</span>
            </label>
        `;
    }).join('');
}

window.handleAddonToggle = function(addonId) {
    const addon = availableAddons.find(a => a.id === addonId);
    if (!addon) return;

    const idx = selectedAddons.findIndex(a => a.id === addonId);
    if (idx > -1) {
        selectedAddons.splice(idx, 1);
    } else {
        selectedAddons.push(addon);
    }

    renderAddonsPills();
    updateReceiptSummary();
};

// Setup Fulfillment Type (Dine-in / Takeaway / Delivery)
function setupFulfillment() {
    const cards = document.querySelectorAll('.fulfillment-card');
    const dynamicLabel = document.getElementById('locationLabel');
    const dynamicInput = document.getElementById('locationInput');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            fulfillmentType = card.getAttribute('data-type');

            if (fulfillmentType === 'dine-in') {
                if (dynamicLabel) dynamicLabel.textContent = 'Nomor Meja Kafe';
                if (dynamicInput) dynamicInput.placeholder = 'Contoh: Meja 04 atau Meja Bar';
            } else if (fulfillmentType === 'takeaway') {
                if (dynamicLabel) dynamicLabel.textContent = 'Nama Panggilan Struk';
                if (dynamicInput) dynamicInput.placeholder = 'Contoh: Siap diambil 15 menit lagi';
            } else {
                if (dynamicLabel) dynamicLabel.textContent = 'Alamat Pengantaran Lengkap';
                if (dynamicInput) dynamicInput.placeholder = 'Masukkan alamat lengkap, patokan & nomor unit...';
            }

            updateReceiptSummary();
        });
    });
}

// Setup Payment Method Selection
function setupPaymentMethods() {
    const cards = document.querySelectorAll('.payment-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            paymentMethod = card.getAttribute('data-method');
        });
    });
}

// Promo Code Application
window.applyPromoCode = function() {
    const input = document.getElementById('promoInput');
    if (!input) return;

    const code = input.value.trim().toUpperCase();
    if (!code) return;

    if (code === 'COFFEEDUO') {
        appliedPromo = { code: 'COFFEEDUO', discountRate: 0.5, desc: 'Diskon 50% (Buy 1 Get 1 Promo)' };
        if (window.MrCoffeeCart) window.MrCoffeeCart.showToast('🎉 Promo COFFEEDUO berhasil dipasang! Diskon 50% diterapkan.');
    } else if (code === 'WELCOME10') {
        appliedPromo = { code: 'WELCOME10', discountRate: 0.1, desc: 'Diskon 10% Pelanggan Baru' };
        if (window.MrCoffeeCart) window.MrCoffeeCart.showToast('🎉 Promo WELCOME10 berhasil dipasang! Diskon 10% diterapkan.');
    } else {
        if (window.MrCoffeeCart) window.MrCoffeeCart.showToast('❌ Kode promo tidak valid atau telah kedaluwarsa.');
        return;
    }

    updateReceiptSummary();
};

// Update Live Receipt & Calculations
function updateReceiptSummary() {
    const itemsList = document.querySelector('.receipt-items-list');
    const calcContainer = document.querySelector('.receipt-calculations');
    const submitBtnText = document.querySelector('.submit-btn-total-text');
    if (!itemsList || !calcContainer) return;

    const cartItems = window.MrCoffeeCart ? window.MrCoffeeCart.getItems() : [];

    // Render Items
    if (cartItems.length === 0 && selectedAddons.length === 0) {
        itemsList.innerHTML = `
            <div style="text-align:center; padding: 1.5rem 0; color:var(--text-muted); font-size:0.88rem;">
                Belum ada menu yang dipilih.<br>Silakan klik varian kopi di atas.
            </div>
        `;
    } else {
        let html = cartItems.map(item => `
            <div class="receipt-item-row">
                <div class="receipt-item-info">
                    <div class="receipt-item-name">${item.name}</div>
                    <div class="receipt-item-meta">${item.qty}x @ ${formatRp(item.price)}</div>
                </div>
                <div class="receipt-item-price">${formatRp(item.price * item.qty)}</div>
            </div>
        `).join('');

        if (selectedAddons.length > 0) {
            html += selectedAddons.map(addon => `
                <div class="receipt-item-row" style="color:var(--accent-color);">
                    <div class="receipt-item-info">
                        <div class="receipt-item-name">+ ${addon.name}</div>
                        <div class="receipt-item-meta">Add-on Kustomisasi</div>
                    </div>
                    <div class="receipt-item-price">+ ${formatRp(addon.price)}</div>
                </div>
            `).join('');
        }

        itemsList.innerHTML = html;
    }

    // Math Calculations
    const itemsTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    const subtotal = itemsTotal + addonsTotal;

    let discount = 0;
    if (appliedPromo && subtotal > 0) {
        discount = Math.round(itemsTotal * appliedPromo.discountRate);
    }

    const netSubtotal = Math.max(0, subtotal - discount);
    const tax = Math.round(netSubtotal * 0.1); // PPN 10%
    const deliveryFee = fulfillmentType === 'delivery' && subtotal > 0 ? 10000 : 0;
    const grandTotal = netSubtotal + tax + deliveryFee;

    // Render Calculation Rows
    calcContainer.innerHTML = `
        <div class="calc-row">
            <span>Subtotal Menu</span>
            <span>${formatRp(subtotal)}</span>
        </div>
        ${discount > 0 ? `
            <div class="calc-row discount-row">
                <span>Voucher (${appliedPromo.code})</span>
                <span>- ${formatRp(discount)}</span>
            </div>
        ` : ''}
        <div class="calc-row">
            <span>Pajak Restoran (10%)</span>
            <span>${formatRp(tax)}</span>
        </div>
        ${fulfillmentType === 'delivery' ? `
            <div class="calc-row">
                <span>Ongkos Kirim Kurir</span>
                <span>${formatRp(deliveryFee)}</span>
            </div>
        ` : ''}
        <div class="calc-row grand-total-row">
            <span>Grand Total</span>
            <span>${formatRp(grandTotal)}</span>
        </div>
    `;

    if (submitBtnText) {
        submitBtnText.textContent = `Pesan Sekarang • ${formatRp(grandTotal)}`;
    }
}

// Form Submission & Success Receipt Modal
function setupOrderForm() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const cartItems = window.MrCoffeeCart ? window.MrCoffeeCart.getItems() : [];
        if (cartItems.length === 0) {
            if (window.MrCoffeeCart) window.MrCoffeeCart.showToast('⚠️ Silakan pilih minimal 1 menu kopi!');
            return;
        }

        const name = document.getElementById('custName').value.trim();
        const phone = document.getElementById('custPhone').value.trim();
        const location = document.getElementById('locationInput').value.trim();
        const notes = document.getElementById('custNotes').value.trim();

        if (name.length < 2 || phone.length < 8) {
            if (window.MrCoffeeCart) window.MrCoffeeCart.showToast('⚠️ Mohon lengkapi nama dan nomor telepon Anda.');
            return;
        }

        // Generate simulated Order ID
        const orderId = '#MRC-' + Math.floor(1000 + Math.random() * 9000);
        const modalBackdrop = document.querySelector('.order-modal-backdrop');
        const modalContent = document.querySelector('.order-modal-content');

        const itemsTotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
        const subtotal = itemsTotal + addonsTotal;
        const discount = appliedPromo ? Math.round(itemsTotal * appliedPromo.discountRate) : 0;
        const tax = Math.round((subtotal - discount) * 0.1);
        const deliveryFee = fulfillmentType === 'delivery' ? 10000 : 0;
        const grandTotal = (subtotal - discount) + tax + deliveryFee;

        modalContent.innerHTML = `
            <div class="modal-success-badge">✓</div>
            <h3 style="color:var(--primary-color);">Pesanan Diterima!</h3>
            <p style="color:var(--text-muted);">Terima kasih, <strong>${name}</strong>. Barista kami sedang menyiapkan racikan kopi Anda.</p>
            
            <div class="ticket-receipt-preview">
                <div class="ticket-preview-row">
                    <span style="color:var(--text-light);">No. Order:</span>
                    <strong style="color:var(--primary-color);">${orderId}</strong>
                </div>
                <div class="ticket-preview-row">
                    <span style="color:var(--text-light);">Layanan:</span>
                    <span style="text-transform: capitalize; font-weight:600;">${fulfillmentType} (${location || 'Kafe'})</span>
                </div>
                <div class="ticket-preview-row">
                    <span style="color:var(--text-light);">Pembayaran:</span>
                    <span style="text-transform: uppercase; font-weight:600; color:var(--accent-color);">${paymentMethod}</span>
                </div>
                <div class="ticket-preview-row">
                    <span style="color:var(--text-light);">Estimasi Selesai:</span>
                    <strong>10 - 15 Menit</strong>
                </div>
                <div class="ticket-preview-row" style="margin-top:8px; padding-top:6px; border-top:1px dashed var(--border-subtle); font-size:1rem;">
                    <span>Total Pembayaran:</span>
                    <strong style="color:var(--primary-color);">${formatRp(grandTotal)}</strong>
                </div>
            </div>

            <div style="display:flex; gap:10px; justify-content:center;">
                <button class="btn-primary" onclick="closeOrderSuccessModal()" style="width:100%;">
                    Selesai & Pesan Lagi
                </button>
            </div>
        `;

        modalBackdrop.classList.add('active');

        // Reset cart and form
        if (window.MrCoffeeCart) window.MrCoffeeCart.clearCart();
        selectedAddons = [];
        appliedPromo = null;
        form.reset();
        renderAddonsPills();
        renderPickerGrid();
        updateReceiptSummary();
    });
}

window.closeOrderSuccessModal = function() {
    const modalBackdrop = document.querySelector('.order-modal-backdrop');
    if (modalBackdrop) modalBackdrop.classList.remove('active');
};

document.addEventListener('DOMContentLoaded', () => {
    // If cart is empty on first arrival, seed with 1 default recommendation
    if (window.MrCoffeeCart && window.MrCoffeeCart.getItems().length === 0) {
        window.MrCoffeeCart.addItem({
            name: 'Cappuccino',
            price: 40000,
            image: '../images/product2.jpeg',
            category: 'Espresso'
        }, 1);
    }

    renderPickerGrid();
    renderAddonsPills();
    setupFulfillment();
    setupPaymentMethods();
    updateReceiptSummary();
    setupOrderForm();

    // Subscribe to cart updates
    if (window.MrCoffeeCart) {
        window.MrCoffeeCart.subscribe(() => {
            renderPickerGrid();
            updateReceiptSummary();
        });
    }
});