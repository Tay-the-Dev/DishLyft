// Sample data for restaurants
const restaurants = [
    {
        id: 1,
        name: "Burger Palace",
        cuisine: "American • Fast Food",
        rating: 4.5,
        deliveryTime: "20-30 min",
        deliveryFee: "$2.99",
        image: "images/restaurant1.jpg",
        category: "Fast Food"
    },
    {
        id: 2,
        name: "Pizza Heaven",
        cuisine: "Italian • Pizza",
        rating: 4.7,
        deliveryTime: "25-35 min",
        deliveryFee: "$3.49",
        image: "images/restaurant2.jpg",
        category: "Fast Food"
    },
    {
        id: 3,
        name: "Sushi Express",
        cuisine: "Japanese • Sushi",
        rating: 4.8,
        deliveryTime: "30-40 min",
        deliveryFee: "$4.99",
        image: "images/restaurant3.jpg",
        category: "Local"
    },
    {
        id: 4,
        name: "Taco Fiesta",
        cuisine: "Mexican • Tacos",
        rating: 4.3,
        deliveryTime: "15-25 min",
        deliveryFee: "$2.49",
        image: "images/restaurant4.jpg",
        category: "Fast Food"
    },
    {
        id: 5,
        name: "Green Bowl",
        cuisine: "Healthy • Salads",
        rating: 4.6,
        deliveryTime: "20-30 min",
        deliveryFee: "$3.99",
        image: "images/restaurant5.jpg",
        category: "Healthy"
    },
    {
        id: 6,
        name: "Sweet Dreams",
        cuisine: "Desserts • Bakery",
        rating: 4.9,
        deliveryTime: "15-25 min",
        deliveryFee: "$1.99",
        image: "images/restaurant6.jpg",
        category: "Desserts"
    }
];

// Sample menu items for restaurants
const menuItems = {
    1: [
        { id: 101, name: "Classic Burger", description: "Beef patty with lettuce, tomato, and special sauce", price: 8.99, category: "Burgers", image: "images/burger1.jpg" },
        { id: 102, name: "Cheeseburger", description: "Classic burger with American cheese", price: 9.99, category: "Burgers", image: "images/burger2.jpg" },
        { id: 103, name: "Bacon Burger", description: "Classic burger with crispy bacon", price: 10.99, category: "Burgers", image: "images/burger3.jpg" },
        { id: 104, name: "French Fries", description: "Crispy golden fries with sea salt", price: 3.99, category: "Sides", image: "images/fries1.jpg" },
        { id: 105, name: "Onion Rings", description: "Crispy battered onion rings", price: 4.99, category: "Sides", image: "images/onion-rings.jpg" },
        { id: 106, name: "Soda", description: "Choice of Coke, Pepsi, Sprite or Dr. Pepper", price: 2.49, category: "Drinks", image: "images/soda.jpg" },
        { id: 107, name: "Chocolate Shake", description: "Creamy chocolate milkshake", price: 5.99, category: "Desserts", image: "images/shake.jpg" }
    ],
    2: [
        { id: 201, name: "Margherita Pizza", description: "Classic tomato and mozzarella", price: 12.99, category: "Pizzas", image: "images/pizza1.jpg" },
        { id: 202, name: "Pepperoni Pizza", description: "Tomato sauce, mozzarella and pepperoni", price: 14.99, category: "Pizzas", image: "images/pizza2.jpg" }
    ]
    // Add more menus for other restaurants as needed
};

// Cart functionality
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count in header
function updateCartCount() {
    const countElements = document.querySelectorAll('#cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    countElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// Add to cart
function addToCart(itemId, restaurantId) {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    const menu = menuItems[restaurantId];
    const item = menu.find(i => i.id === itemId);
    
    const existingItem = cart.find(i => i.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            restaurant: restaurant.name,
            image: item.image
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // Show a quick confirmation (you could enhance this with a proper toast notification)
    alert(`${item.name} added to cart!`);
}

// Remove from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartItems();
}

// Update quantity in cart
function updateQuantity(itemId, newQuantity) {
    const item = cart.find(i => i.id === itemId);
    
    if (item) {
        if (newQuantity < 1) {
            removeFromCart(itemId);
        } else {
            item.quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            renderCartItems();
        }
    }
}

// Calculate cart totals
function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = 2.99;
    const total = subtotal + deliveryFee;
    
    return { subtotal, deliveryFee, total };
}

// Render cart items
function renderCartItems() {
    const cartItemsElement = document.getElementById('cart-items');
    
    if (cartItemsElement) {
        if (cart.length === 0) {
            cartItemsElement.innerHTML = '<p>Your cart is empty.</p>';
        } else {
            cartItemsElement.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.restaurant}</p>
                        <div class="cart-item-controls">
                            <div class="quantity-control">
                                <button class="quantity-btn minus" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                                <span>${item.quantity}</span>
                                <button class="quantity-btn plus" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                            </div>
                            <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                        </div>
                    </div>
                    <div class="cart-item-price">
                        $${(item.price * item.quantity).toFixed(2)}
                    </div>
                </div>
            `).join('');
        }
        
        const totals = calculateTotals();
        document.getElementById('subtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
        document.getElementById('total').textContent = `$${totals.total.toFixed(2)}`;
        
        // Update modal total if it exists
        const modalTotal = document.getElementById('modal-total');
        if (modalTotal) {
            modalTotal.textContent = `$${totals.total.toFixed(2)}`;
        }
    }
}

// Render restaurants on homepage
function renderRestaurants(filter = 'All') {
    const restaurantsElement = document.getElementById('restaurants');
    
    if (restaurantsElement) {
        const filtered = filter === 'All' ? restaurants : restaurants.filter(r => r.category === filter);
        
        restaurantsElement.innerHTML = filtered.map(restaurant => `
            <div class="restaurant-card" onclick="window.location.href='restaurant.html?id=${restaurant.id}'">
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
                </div>
            </div>
        `).join('');
    }
}

// Render restaurant details page
function renderRestaurantDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = parseInt(urlParams.get('id'));
    
    if (restaurantId) {
        const restaurant = restaurants.find(r => r.id === restaurantId);
        const menu = menuItems[restaurantId];
        
        if (restaurant && menu) {
            // Update restaurant info
            document.querySelector('.restaurant-info h1').textContent = restaurant.name;
            document.querySelector('.restaurant-info .cuisine').textContent = restaurant.cuisine;
            document.querySelector('.restaurant-image img').src = restaurant.image;
            
            // Render menu items
            const menuGrid = document.querySelector('.menu-grid');
            if (menuGrid) {
                menuGrid.innerHTML = menu.map(item => `
                    <div class="menu-item">
                        <div class="menu-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                        <div class="menu-item-info">
                            <h4>${item.name}</h4>
                            <p>${item.description}</p>
                            <div class="menu-item-price">
                                <span class="price">$${item.price.toFixed(2)}</span>
                                <button class="add-to-cart" onclick="addToCart(${item.id}, ${restaurant.id})">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        }
    }
}

// Handle category filtering
function setupCategoryFilters() {
    const categoryButtons = document.querySelectorAll('.category-list button');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const filter = button.textContent;
            renderRestaurants(filter);
        });
    });
}

// Handle search functionality
function setupSearch() {
    const searchInput = document.getElementById('search');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            
            const filtered = restaurants.filter(restaurant => 
                restaurant.name.toLowerCase().includes(searchTerm) || 
                restaurant.cuisine.toLowerCase().includes(searchTerm)
            );
            
            renderFilteredRestaurants(filtered);
        });
    }
}

// Render filtered restaurants
function renderFilteredRestaurants(filteredRestaurants) {
    const restaurantsElement = document.getElementById('restaurants');
    
    if (restaurantsElement) {
        restaurantsElement.innerHTML = filteredRestaurants.map(restaurant => `
            <div class="restaurant-card" onclick="window.location.href='restaurant.html?id=${restaurant.id}'">
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
                </div>
            </div>
        `).join('');
    }
}

// Handle checkout modal
function setupCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    const checkoutBtn = document.getElementById('checkout-btn');
    const closeBtns = document.querySelectorAll('.close, .close-modal');
    const confirmOrderBtn = document.getElementById('confirm-order');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                modal.style.display = 'flex';
            } else {
                alert('Your cart is empty!');
            }
        });
    }
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    });
    
    if (confirmOrderBtn) {
        confirmOrderBtn.addEventListener('click', () => {
            // Generate a random order ID
            const orderId = 'DL-' + Math.floor(Math.random() * 1000000);
            
            // Clear the cart
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            
            // Redirect to confirmation page
            window.location.href = `confirmation.html?order=${orderId}`;
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Set up order confirmation page
function setupOrderConfirmation() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order');
    
    if (orderId) {
        document.getElementById('order-id').textContent = orderId;
    }
}

// Initialize the appropriate page
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    if (document.getElementById('restaurants')) {
        // Homepage
        renderRestaurants();
        setupCategoryFilters();
        setupSearch();
    } else if (document.querySelector('.menu-grid')) {
        // Restaurant page
        renderRestaurantDetails();
    } else if (document.getElementById('cart-items')) {
        // Cart page
        renderCartItems();
        setupCheckoutModal();
    } else if (document.querySelector('.confirmation-card')) {
        // Confirmation page
        setup
