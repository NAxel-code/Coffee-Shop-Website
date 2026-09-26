/**
 * MR.COFFEE - MENU CATALOG JAVASCRIPT
 * Handles: Live Search, Category Filter Chips, Dynamic Grid Rendering, Direct Add to Cart
 */

const menuItems = [
    { 
        name: 'Americano', 
        price: 35000, 
        image: '../images/product1.jpeg', 
        type: 'espresso', 
        badge: 'Classic',
        description: 'Double shot espresso murni dengan air panas bersuhu presisi. Bold, bersih, dan memancarkan aroma bunga.' 
    },
    { 
        name: 'Cappuccino', 
        price: 40000, 
        image: '../images/product2.jpeg', 
        type: 'espresso', 
        badge: 'Favorite',
        description: 'Paduan harmonis espresso, steamed milk, dan busa mikro selembut sutra dengan sentuhan bubuk cokelat.' 
    },
    { 
        name: 'Caramel Macchiato', 
        price: 45000, 
        image: '../images/product6.jpeg', 
        type: 'espresso', 
        badge: 'Sweet',
        description: 'Steamed milk dengan ekstrak vanila Madagaskar, dituangi ristretto pekat dan saus karamel homemade.' 
    },
    { 
        name: 'Cold Brew', 
        price: 45000, 
        image: '../images/product3.jpeg', 
        type: 'brewed', 
        badge: '16h Steeped',
        description: 'Diseduh dingin selama 16 jam tanpa pemanasan. Asam sangat rendah dengan sentuhan rasa dark chocolate pekat.' 
    },
    { 
        name: 'V60 Pour Over', 
        price: 40000, 
        image: '../images/product 9.jpeg', 
        type: 'brewed', 
        badge: 'Single Origin',
        description: 'Metode seduh manual presisi tinggi. Menghasilkan body yang bersih, aroma floral, dan keasaman buah tropis cerah.' 
    },
    { 
        name: 'French Press', 
        price: 42000, 
        image: '../images/product10.jpeg', 
        type: 'brewed', 
        badge: 'Full Body',
        description: 'Ekstraksi seduh imersi penuh. Menjaga minyak alami biji kopi untuk rasa yang tebal, gurih, dan mantap.' 
    },
    { 
        name: 'Matcha Latte', 
        price: 43000, 
        image: '../images/product11.jpeg', 
        type: 'noncoffee', 
        badge: 'Uji Kyoto',
        description: 'Bubuk matcha ceremonial grade asal Uji, Kyoto dipadukan dengan susu segar yang lembut dan creamy.' 
    },
    { 
        name: 'Choco Mint Milk', 
        price: 40000, 
        image: '../images/product12.jpeg', 
        type: 'noncoffee', 
        badge: 'Signature',
        description: 'Kakao murni Jawa Timur dengan infused daun mint segar dan susu dingin. Menyegarkan dan memanjakan lidah.' 
    },
    { 
        name: 'Japanese Iced Coffee', 
        price: 48000, 
        image: '../images/product8.jpeg', 
        type: 'signature', 
        badge: 'Flash Chilled',
        description: 'Kopi seduh tetes panas yang langsung dikristalkan di atas bongkahan es batu. Rasa cerah dan kaya rasa buah.' 
    },
    { 
        name: 'Espresso Tonic Fusion', 
        price: 50000, 
        image: '../images/product15.webp', 
        type: 'signature', 
        badge: 'Sparkling',
        description: 'Sensasi sparkling water aromatik dipadukan dengan double ristretto dan perasan sitrus segar.' 
    },
    { 
        name: 'Hazelnut Frappuccino', 
        price: 50000, 
        image: '../images/product 5.jpeg', 
        type: 'blended', 
        badge: 'Creamy',
        description: 'Blended coffee dengan pasta hazelnut panggang, whipped cream lembut, dan taburan kacang caramel.' 
    },
    { 
        name: 'Mocha Freeze', 
        price: 48000, 
        image: '../images/product 16.jpeg', 
        type: 'blended', 
        badge: 'Rich Cocoa',
        description: 'Perpaduan cokelat Belgia pekat, espresso shot, dan es yang diblend halus dengan topping whipped cream.' 
    },
    { 
        name: 'Vanilla Cold Crème', 
        price: 47000, 
        image: '../images/product17.jpeg', 
        type: 'blended', 
        badge: 'Silky',
        description: 'Blended vanilla bean dingin dengan krim susu lembut untuk Anda yang menyukai rasa manis menenangkan.' 
    }
];

let activeFilter = 'all';
let searchQuery = '';

function renderFilteredMenu() {
    const grid = document.querySelector('.menu-grid');
    if (!grid) return;

    let items = menuItems;

    // Apply category filter
    if (activeFilter !== 'all') {
        items = items.filter(item => item.type === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        items = items.filter(item => 
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
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

    grid.innerHTML = items.map((item, idx) => `
        <div class="menu-card" style="animation-delay: ${(idx % 8) * 0.05}s">
            <div class="menu-card-img-wrap">
                <span class="menu-card-type-tag">${item.badge || item.type}</span>
                <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400'">
            </div>
            <div class="menu-card-content">
                <h3>${item.name}</h3>
                <div class="menu-card-price">${window.MrCoffeeCart ? window.MrCoffeeCart.formatRp(item.price) : 'Rp ' + item.price.toLocaleString('id-ID')}</div>
                <p class="menu-card-desc">${item.description}</p>
                <div class="menu-card-actions">
                    <button class="btn-add-bag" onclick="handleMenuAdd(this, '${item.name.replace(/'/g, "\\'")}', ${item.price}, '${item.image}', '${item.type}')">
                        <span>+ Keranjang</span>
                    </button>
                    <button class="btn-order-direct" onclick="handleDirectOrder('${item.name.replace(/'/g, "\\'")}', ${item.price}, '${item.image}', '${item.type}')">
                        <span>Beli</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Add to Bag with visual button response
window.handleMenuAdd = function(btn, name, price, image, type) {
    if (window.MrCoffeeCart) {
        window.MrCoffeeCart.addItem({ name, price, image, category: type }, 1);
    }
    const origHTML = btn.innerHTML;
    btn.classList.add('added');
    btn.innerHTML = '<span>✓ Ditambah</span>';
    setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = origHTML;
    }, 1400);
};

// Direct Order: Add and redirect to order page
window.handleDirectOrder = function(name, price, image, type) {
    if (window.MrCoffeeCart) {
        window.MrCoffeeCart.addItem({ name, price, image, category: type }, 1);
    }
    window.location.href = 'order.html';
};

window.resetMenuFilters = function() {
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
