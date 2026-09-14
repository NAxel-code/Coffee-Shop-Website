// menu.js
const menuItems = [
    { name: 'Americano', price: '35000 IDR', image: '../images/product1.jpeg', type: 'espresso', description: 'Smooth shots of espresso mellowed with hot water. Bold, yet clean.' },
    { name: 'Cappuccino', price: '40000 IDR', image: '../images/product2.jpeg', type: 'espresso', description: 'Classic comfort in a cup — rich espresso, steamed milk, and a blanket of foam.' },
    { name: 'Caramel Macchiato', price: '45000 IDR', image: '../images/product6.jpeg', type: 'espresso', description: 'Vanilla-infused milk topped with espresso and luscious caramel drizzle.' },
    { name: 'Cold Brew', price: '45000 IDR', image: '../images/product3.jpeg', type: 'brewed', description: 'Brewed for hours, served over ice — low acidity, high energy.' },
    { name: 'V60 Pour Over', price: '40000 IDR', image: '../images/product 9.jpeg', type: 'brewed', description: 'Hand-brewed precision — clean, bright, and aromatic.' },
    { name: 'French Press', price: '42000 IDR', image: '../images/product10.jpeg', type: 'brewed', description: 'Full-bodied and robust, with bold natural oils intact.' },
    { name: 'Matcha Latte', price: '43000 IDR', image: '../images/product11.jpeg', type: 'noncoffee', description: 'Earthy Uji matcha balanced with creamy milk, iced or hot.' },
    { name: 'Choco Mint Milk', price: '40000 IDR', image: '../images/product12.jpeg', type: 'noncoffee', description: 'Dark cocoa, fresh mint, and a smooth milky blend.' },
    { name: 'Japanese Iced Coffee', price: '48000 IDR', image: '../images/product8.jpeg', type: 'signature', description: 'Flash-brewed for intense flavor with a refreshing finish.' },
    { name: 'Espresso Tonic Fusion', price: '50000 IDR', image: '../images/product15.webp', type: 'signature', description: 'Bubbly tonic water meets citrus and double espresso for a vibrant kick.' },
    { name: 'Hazelnut Frappuccino', price: '50000 IDR', image: '../images/product 5.jpeg', type: 'blended', description: 'Nutty, creamy, and caffeinated. Your guilty pleasure in a cup.' },
    { name: 'Mocha Freeze', price: '48000 IDR', image: '../images/product 16.jpeg', type: 'blended', description: 'Blended chocolate and coffee with whipped cream on top.' },
    { name: 'Vanilla Cold Crème', price: '47000 IDR', image: '../images/product17.jpeg', type: 'blended', description: 'A smooth vanilla blend for those who like it mellow and frosty.' }
];

// Load and render menu items based on filter
function loadMenuItems(filter = 'all') {
    const menuGrid = document.querySelector('.menu-grid');
    menuGrid.innerHTML = '';

    const filteredItems = filter === 'all'
        ? menuItems
        : menuItems.filter(item => item.type === filter);

    filteredItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="menu-item-content">
                <h3>${item.name}</h3>
                <p class="price">${item.price}</p>
                <p class="description">${item.description}</p>
                <a href="order.html" class="order-btn">Order Now</a>
            </div>
        `;
        menuGrid.appendChild(menuItem);
    });
}

// Filter menu
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const filter = button.getAttribute('data-filter');
        loadMenuItems(filter);
    });
});

// Load menu items on page load
document.addEventListener('DOMContentLoaded', () => {
    loadMenuItems();
});
