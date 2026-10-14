/**
 * MR.COFFEE - MENU CATALOG JAVASCRIPT
 * Handles: Live Search, Category Filter Chips, Dynamic Grid from MrCoffeeProducts,
 *          POS Customization Modal trigger, Direct Add to Cart
 */

let activeFilter = 'all';
let searchQuery = '';

function getMenuItems() {
    if (window.MrCoffeeProducts) {
        return window.MrCoffeeProducts.getAll();
    }
    return [];
}

function renderFilteredMenu() {
    const grid = document.querySelector('.menu-grid');
    if (!grid) return;

    let items = getMenuItems();

    // Apply category filter
    if (activeFilter !== 'all') {
        items = items.filter(item => item.type === activeFilter || item.category === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        items = items.filter(item =>
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            (item.notes && item.notes.toLowerCase().includes(query)) ||
            (item.origin && item.origin.toLowerCase().includes(query)) ||
            item.type.toLowerCase().includes(query)
        );
    }

    if (items.length === 0) {
        grid.innerHTML = `
            <div class="menu-empty-message">
                <div style="font-size: 3rem; margin-bottom: 0.8rem;">🔍</div>
                <h4>Menu Tidak Ditemukan</h4>
                <p style="color: var(--text-muted); font-size: 0.95rem;">Coba cari dengan kata kunci lain atau pilih kategori yang berbeda.</p>
                <button class="btn-secondary" style="margin-top: 1.5rem;" onclick="resetMenuFilters()">
                    Reset Pencarian
                </button>
            </div>
        `;
        return;
    }

    grid.innerHTML = items.map((item, idx) => {
        const imgSrc = window.MrCoffeeProducts ? window.MrCoffeeProducts.resolveImage(item.image) : item.image;
        const formattedPrice = window.MrCoffeeProducts ? window.MrCoffeeProducts.formatRp(item.price) : 'Rp ' + item.price.toLocaleString('id-ID');

        return `
            <div class="menu-card" style="animation-delay: ${(idx % 8) * 0.05}s">
                <div class="menu-card-img-wrap" onclick="MrCoffeePOS.openModal('${item.id}')" style="cursor:pointer;" title="Lihat Detail POS & Kustomisasi">
                    <span class="menu-card-type-tag">${item.badge || item.type}</span>
                    <img src="${imgSrc}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400'">
                </div>
                <div class="menu-card-content">
                    <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
                        <h3 onclick="MrCoffeePOS.openModal('${item.id}')" style="cursor:pointer;">${item.name}</h3>
                        <div class="menu-card-price">${formattedPrice}</div>
                    </div>
                    ${item.origin ? `<div style="font-size:0.75rem; color:var(--text-light); margin-bottom:4px; font-weight:500;">📍 ${item.origin}</div>` : ''}
                    <p class="menu-card-desc">${item.description}</p>
                    <div class="menu-card-actions">
                        <button class="btn-add-bag" onclick="MrCoffeePOS.openModal('${item.id}')">
                            <span>⚙️ Kustomisasi</span>
                        </button>
                        <button class="btn-order-direct" onclick="handleQuickAddDirect('${item.id}')">
                            <span>+ Pesan Cepat</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Quick Add with default options
window.handleQuickAddDirect = function (id) {
    if (!window.MrCoffeeProducts || !window.MrCoffeeCart) return;
    const item = window.MrCoffeeProducts.getById(id);
    if (!item) return;

    window.MrCoffeeCart.addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.categoryLabel || item.category,
        options: {
            temp: item.defaultTemp || 'hot',
            sugar: '100%',
            milk: 'regular',
            ice: 'normal',
            notes: ''
        }
    }, 1);
};

window.resetMenuFilters = function () {
    activeFilter = 'all';
    searchQuery = '';
    const searchInput = document.querySelector('.menu-search-input');
    if (searchInput) searchInput.value = '';

    document.querySelectorAll('.filter-chip-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === 'all');
    });

    renderFilteredMenu();
};

function setupCategoryFilterChips() {
    const buttons = document.querySelectorAll('.filter-chip-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeFilter = btn.getAttribute('data-filter') || 'all';
            renderFilteredMenu();
        });
    });

    const searchInput = document.querySelector('.menu-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderFilteredMenu();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    setupCategoryFilterChips();
    renderFilteredMenu();
});
