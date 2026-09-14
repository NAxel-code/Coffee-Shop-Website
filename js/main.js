// Mobile Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Most Ordered Products
const products = [
    {
        name: 'Americano',
        price: '35K IDR',
        image: 'images/product1.jpeg',
        type: 'Espresso'
    },
    {
        name: 'Cappuccino',
        price: '40K IDR',
        image: 'images/product2.jpeg',
        type: 'Espresso'
    },
    {
        name: 'Cold Brew',
        price: '45K IDR',
        image: 'images/product3.jpeg',
        type: 'Brewed'
    },
    {
        name: 'Japanese Iced Coffee',
        price: '48K IDR',
        image: 'images/product8.jpeg',
        type: 'Signature'
    },
    {
        name: 'Hazelnut Frappuccino',
        price: '50K IDR',
        image: 'images/product 5.jpeg',
        type: 'Blended'
    }
];

// Load most ordered products
function loadMostOrdered() {
    const productGrid = document.querySelector('.product-grid');
    if (!productGrid) return;

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="img-container">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <h3>${product.name}</h3>
            <p class="price">${product.price}</p>
            <a href="pages/menu.html" class="cta-button">View Details</a>
        `;
        productGrid.appendChild(productCard);
    });
}

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    loadMostOrdered();
});

window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    } else {
        navbar.style.backgroundColor = '#fff';
    }
}); 
// Intersection Observer for Scroll Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('section').forEach((section) => {
        section.classList.add('fade-in-section');
        observer.observe(section);
    });
});
