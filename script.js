
// DOM Elements
const pages = {
    home: document.getElementById('home-page'),
    restaurant: document.getElementById('restaurant-page'),
    cart: document.getElementById('cart-page'),
    payment: document.getElementById('payment-page'),
    confirmation: document.getElementById('confirmation-page')
};

const navLinks = document.querySelectorAll('.nav-link');
const menuToggle = document.getElementById('menu-toggle');
const mainNav = document.getElementById('main-nav');
const searchBar = document.getElementById('search-bar');
const restaurantList = document.getElementById('restaurants');
const cartCount = document.getElementById('cart-count');
const toast = document.getElementById('toast');
const checkoutBtn = document.getElementById('checkout-btn');
const completePaymentBtn = document.getElementById('complete-payment');

// App State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentRestaurantIndex = null;

// Sample Data (Combined from both apps)
const restaurants = [
    {
        name: "Burger Palace",
        cuisine: "American • Fast Food",
        rating: "4.5 (250+)",
        deliveryFee: "$2.99",
        deliveryTime: "20-30 min",
        image: "images/restaurant1.jpg",
        menu: [
            { id: 101, name: "Classic Burger", description: "Beef patty with lettuce, tomato, and special sauce", price: 8.99, category: "Burgers", image: "images/burger1.jpg" },
            { id: 102, name: "Cheeseburger", description: "Classic burger with American cheese", price: 9.99, category: "Burgers", image: "images/burger2.jpg" },
            { id: 103, name: "Bacon Burger", description: "Classic burger with crispy bacon", price: 10.99, category: "Burgers", image: "images/burger3.jpg" }
        ]
    },
    {
        name: "Mama's Kitchen",
        cuisine: "African",
        rating: "4.7 (180+)",
        deliveryFee: "$3.49",
        deliveryTime: "25-35 min",
        image: "images/restaurant2.jpg",
        menu: [
            { id: 201, name: "Ugali", description: "Traditional cornmeal dish", price: 5.99, category: "Main", image: "images/ugali.jpg" },
            { id: 202, name: "Sukuma Wiki", description: "Healthy collard greens", price: 4.99, category: "Sides", image: "images/sukuma.jpg" }
        ]
    },
    {
        name: "Pizza Heaven",
        cuisine: "Italian • Pizza",
        rating: "4.8 (320+)",
        deliveryFee: "$2.49",
        deliveryTime: "15-25 min",
        image: "images/restaurant3.jpg",
        menu: [
            { id: 301, name: "Margherita Pizza", description: "Classic tomato and mozzarella", price: 12.99, category: "Pizza", image: "images/pizza1.jpg" },
            { id: 302, name: "Pepperoni Pizza", description: "Tomato sauce, mozzarella and pepperoni", price: 14.99, category: "Pizza", image: "images/pizza2.jpg" }
        ]
    }
];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadRestaurants();
    updateCartCount();
});

// Event Listeners
function setupEventListeners() {
    // Mobile Navigation Toggle
    menuToggle.addEventListener('click', toggleMobileNav);
    
    // Navigation Links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            showPage(page);
            if (mainNav.classList.contains('active')) toggleMobileNav();
        });
    });

    // Back Buttons
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.target.getAttribute('data-page');
            showPage(page);
        });
    });

    // Search Functionality
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            loadRestaurants(e.target.value);
        });
    }

    // Checkout Button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', showPaymentPage);
    }

    // Payment Method Selection
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', selectPaymentMethod);
    });

    // Complete Payment Button
    if (completePaymentBtn) {
        completePaymentBtn.addEventListener('click', processPayment);
    }
}

// Page Navigation
function showPage(pageName) {
    // Hide all pages
    Object.values(pages).forEach(page => {
        if (page) page.classList.remove('active');
    });

    // Show selected page
    if (pages[pageName]) {
        pages[pageName].classList.add('active');
    }

    // Special cases
    if (pageName === 'cart') {
        renderCart();
    } else if (pageName === 'home') {
        loadRestaurants();
    }
}

// Mobile Navigation
function toggleMobileNav() {
    mainNav.classList.toggle('active');
    menuToggle.innerHTML = mainNav.classList.contains('active') ? 
        '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
}

// Restaurant Functions
function loadRestaurants(filter = '') {
    if (!restaurantList) return;

    const filtered = restaurants.filter(restaurant => {
        const searchTerm = filter.toLowerCase();
        return (
            restaurant.name.toLowerCase().includes(searchTerm) ||
            restaurant.cuisine.toLowerCase().includes(searchTerm)
        );
    });

    renderRestaurants(filtered);
}

function renderRestaurants(restaurants) {
    restaurantList.innerHTML = '';

    if (restaurants.length === 0) {
        restaurantList.innerHTML = '<p class="no-results">No restaurants found</p>';
        return;
    }

    restaurants.forEach((restaurant, index) => {
        const card = document.createElement('div');
        card.className = 'restaurant-card';
        card.innerHTML = `
            <div class="restaurant-image">
                <img src="${restaurant.image}" alt="${restaurant.name}">
            </div>
            <div class="restaurant-info">
                <h3>${restaurant.name}</h3>
                <p>${restaurant.cuisine}</p>
                <div class="restaurant-details">
                    <span>⭐ ${restaurant.rating}</span>
                    <span>🛵 ${restaurant.deliveryFee}</span>
                    <span>⏱️ ${restaurant.deliveryTime}</span>
                </div>
                <button class="primary-btn" onclick="viewRestaurant(${index})">View Menu</button>
            </div>
        `;
        restaurantList.appendChild(card);
    });
}

function viewRestaurant(index) {
    currentRestaurantIndex = index;
    const restaurant = restaurants[index];

    document.getElementById('restaurant-name').textContent = restaurant.name;
    document.getElementById('restaurant-cuisine').textContent = restaurant.cuisine;
    document.getElementById('restaurant-cover').src = restaurant.image;

    const menuList = document.getElementById('restaurant-menu-list');
    menuList.innerHTML = '';
    
    restaurant.menu.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <div class="menu-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="menu-item-info">
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <div class="menu-item-price">
                    <span class="price">$${item.price.toFixed(2)}</span>
                    <button class="primary-btn" onclick="addToCart(${index}, ${JSON.stringify(item).replace(/"/g, '&quot;')})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
        menuList.appendChild(menuItem);
    });

    showPage('restaurant');
}

// Cart Functions
function addToCart(restaurantIndex, item) {
    const parsedItem = JSON.parse(item.replace(/&quot;/g, '"'));
    parsedItem.restaurantIndex = restaurantIndex;
    cart.push(parsedItem);
    saveCart();
    updateCartCount();
    showToast(`${parsedItem.name} added to cart`);
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    
    if (!cartItems) return;
    
    cartItems.innerHTML = '';

    const itemGroups = {};
    cart.forEach(item => {
        const key = `${item.name}-${item.restaurantIndex}`;
        if (!itemGroups[key]) {
            itemGroups[key] = { ...item, quantity: 0 };
        }
        itemGroups[key].quantity += 1;
    });

    let subtotal = 0;
    Object.values(itemGroups).forEach(group => {
        const itemTotal = group.price * group.quantity;
        subtotal += itemTotal;

        const li = document.createElement('li');
        li.innerHTML = `
            <div class="cart-item-info">
                <span>${group.name} x${group.quantity}</span>
                <span>$${itemTotal.toFixed(2)}</span>
            </div>
            <button class="remove-btn" onclick="removeFromCart('${group.name}', ${group.restaurantIndex})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(li);
    });

    // Calculate totals
    const deliveryFee = 2.99;
    const total = subtotal + deliveryFee;

    // Update UI
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    totalEl.textContent = `$${total.toFixed(2)}`;
}

function removeFromCart(name, restaurantIndex) {
    // Find the index of the first matching item
    const index = cart.findIndex(item => 
        item.name === name && item.restaurantIndex === restaurantIndex
    );
    
    if (index !== -1) {
        cart.splice(index, 1);
        saveCart();
        updateCartCount();
        renderCart();
        showToast(`${name} removed from cart`);
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// Payment Functions
function showPaymentPage() {
    if (cart.length === 0) {
        showToast('Your cart is empty!');
        return;
    }
    showPage('payment');
    // Reset payment method selection
    document.querySelector('.payment-method[data-method="card"]').click();
}

function selectPaymentMethod(e) {
    const method = e.currentTarget;
    document.querySelectorAll('.payment-method').forEach(m => {
        m.classList.remove('selected');
    });
    method.classList.add('selected');
    
    document.querySelectorAll('.payment-form').forEach(form => {
        form.classList.remove('active');
    });
    
    const paymentForm = document.getElementById(`${method.dataset.method}-payment`);
    paymentForm.classList.add('active');
    
    if (method.dataset.method === 'paypal') {
        showToast('You will be redirected to PayPal to complete your payment');
    }
}

function processPayment() {
    const selectedMethod = document.querySelector('.payment-method.selected').dataset.method;
    
    if (selectedMethod === 'card') {
        const cardNumber = document.getElementById('card-number').value;
        const cardName = document.getElementById('card-name').value;
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCvv = document.getElementById('card-cvv').value;
        
        if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
            showToast('Please fill all card details');
            return;
        }
        
        // Validate card number (simple check)
        if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
            showToast('Please enter a valid 16-digit card number');
            return;
        }
        
        // Validate expiry date (simple check)
        if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
            showToast('Please enter expiry date in MM/YY format');
            return;
        }
        
        // Validate CVV (simple check)
        if (!/^\d{3,4}$/.test(cardCvv)) {
            showToast('Please enter a valid CVV (3 or 4 digits)');
            return;
        }
        
        // Process card payment
        showToast(`Processing payment...`);
        setTimeout(() => {
            completePayment();
        }, 2000);
    } else if (selectedMethod === 'paypal') {
        // In a real app, this would redirect to PayPal
        showToast('Redirecting to PayPal...');
        setTimeout(() => {
            completePayment();
        }, 1500);
    }
}

function completePayment() {
    // Generate random order ID
    const orderId = 'DL-' + Math.floor(Math.random() * 1000000);
    document.getElementById('order-id').textContent = orderId;
    
    // Clear the cart
    cart = [];
    saveCart();
    updateCartCount();
    
    // Show confirmation
    showPage('confirmation');
    showToast('Payment successful! Your order is on the way.');
}

// UI Helpers
function showToast(message) {
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Make functions available globally
window.viewRestaurant = viewRestaurant;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.showPage = showPage;
window.selectPaymentMethod = selectPaymentMethod;
window.processPayment = processPayment;
