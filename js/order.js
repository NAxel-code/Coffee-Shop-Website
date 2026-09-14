// Menu items data
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


//Add ons
let selectedItems = [];
let selectedAddons = [];

function loadMenuItems() {
    const itemsGrid = document.querySelector('.items-grid');
    menuItems.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h4>${item.name}</h4>
            <p class="price">Rp ${item.price.toLocaleString()}</p>
        `;
        itemCard.addEventListener('click', (event) => toggleItemSelection(event, item));
        itemsGrid.appendChild(itemCard);
    });
}

function toggleItemSelection(event, item) {
    const itemCard = event.currentTarget;
    const index = selectedItems.findIndex(i => i.name === item.name);

    if (index === -1) {
        selectedItems.push(item);
        itemCard.classList.add('selected');
    } else {
        selectedItems.splice(index, 1);
        itemCard.classList.remove('selected');
    }

    updateOrderSummary();
}

function updateOrderSummary() {
  const summaryItems = document.querySelector('.summary-items');
  const totalPrice = document.getElementById('totalPrice');
  let total = 0;

  summaryItems.innerHTML = '';

  selectedItems.forEach(item => {
    const itemPrice = parseInt(item.price.replace(/[^\d]/g, '')); // Ambil angka dari string
    const summaryItem = document.createElement('div');
    summaryItem.className = 'summary-item';
    summaryItem.innerHTML = `
      <span>${item.name}</span>
      <span>Rp ${itemPrice.toLocaleString('id-ID')}</span>
    `;
    summaryItems.appendChild(summaryItem);
    total += itemPrice;
  });

  selectedAddons.forEach(addon => {
    const addonPrice = parseInt(addon.price.replace(/[^\d]/g, ''));
    const summaryItem = document.createElement('div');
    summaryItem.className = 'summary-item';
    summaryItem.innerHTML = `
      <span>${addon.name}</span>
      <span>Rp ${addonPrice.toLocaleString('id-ID')}</span>
    `;
    summaryItems.appendChild(summaryItem);
    total += addonPrice;
  });

  totalPrice.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}


function validateForm() {
    let isValid = true;
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const address = document.getElementById('address');

    if (name.value.trim().length < 2) {
        showError(name, 'Name must be at least 2 characters long');
        isValid = false;
    } else {
        hideError(name);
    }

    if (!isValidEmail(email.value)) {
        showError(email, 'Please enter a valid email address');
        isValid = false;
    } else {
        hideError(email);
    }

    if (!isValidPhone(phone.value)) {
        showError(phone, 'Please enter a valid phone number');
        isValid = false;
    } else {
        hideError(phone);
    }

    if (address.value.trim().length < 10) {
        showError(address, 'Please enter a complete address');
        isValid = false;
    } else {
        hideError(address);
    }

    if (selectedItems.length === 0) {
        alert('Please select at least one item');
        isValid = false;
    }

    return isValid;
}

function isValidEmail(email) {
    const atIndex = email.indexOf('@');
    const dotIndex = email.lastIndexOf('.');
    return atIndex > 0 && dotIndex > atIndex + 1 && dotIndex < email.length - 1;
}

function isValidPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
}

function showError(input, message) {
    const formGroup = input.parentElement;
    const errorMessage = formGroup.querySelector('.error-message');
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    input.style.borderColor = '#dc3545';
}

function hideError(input) {
    const formGroup = input.parentElement;
    const errorMessage = formGroup.querySelector('.error-message');
    errorMessage.classList.remove('show');
    input.style.borderColor = '#ddd';
}

document.addEventListener('DOMContentLoaded', () => {
    loadMenuItems();

    document.querySelectorAll('input[name="addons"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const addon = addOns.find(a => a.name === e.target.value);
            if (e.target.checked) {
                selectedAddons.push(addon);
            } else {
                selectedAddons = selectedAddons.filter(a => a.name !== addon.name);
            }
            updateOrderSummary();
        });
    });

    document.getElementById('orderForm').addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm()) {
            alert('Order placed successfully!');
            e.target.reset();
            selectedItems = [];
            selectedAddons = [];
            document.querySelectorAll('.item-card').forEach(card => {
                card.classList.remove('selected');
            });
            updateOrderSummary();
        }
    });
});