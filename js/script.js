// DOM Elements
const views = {
  home: document.getElementById('home-view'),
  restaurant: document.getElementById('restaurant-view'),
  orders: document.getElementById('orders-view'),
  cart: document.getElementById('cart-view'),
  payment: document.getElementById('payment-view'),
  confirmation: document.getElementById('confirmation-view')
};

const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menu-toggle');
const searchBar = document.getElementById('search-bar');
const restaurantList = document.getElementById('restaurant-list');
const cartCount = document.getElementById('cart-count');
const toast = document.getElementById('toast');
const loginModal = document.getElementById('login-modal');

// App State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let userRole = null;
let currentUser = null;
let currentRestaurantIndex = null;

// Sample Data
const defaultRestaurants = [
  {
    id: 'restaurant1',
    name: "Burger Palace",
    cuisine: "American • Burgers • Fast Food",
    image: "images/restaurants/burger-place.jpg",
    rating: 4.5,
    reviewCount: 250,
    deliveryFee: 2.99,
    deliveryTime: "20-30 min",
    menu: [
      { id: 101, name: "Classic Burger", description: "Beef patty with lettuce, tomato, and special sauce", price: 8.99, category: "Burgers" },
      { id: 102, name: "Cheeseburger", description: "Classic burger with American cheese", price: 9.99, category: "Burgers" },
      { id: 103, name: "Bacon Burger", description: "Classic burger with crispy bacon", price: 10.99, category: "Burgers" }
    ]
  },
  {
    id: 'restaurant2',
    name: "Pizza Heaven",
    cuisine: "Italian • Pizza • Pasta",
    image: "images/restaurants/pizza-place.jpg",
    rating: 4.7,
    reviewCount: 320,
    deliveryFee: 1.99,
    deliveryTime: "25-35 min",
    menu: [
      { id: 201, name: "Margherita Pizza", description: "Classic tomato and mozzarella", price: 12.99, category: "Pizzas" },
      { id: 202, name: "Pepperoni Pizza", description: "Tomato sauce, mozzarella and pepperoni", price: 14.99, category: "Pizzas" }
    ]
  },
  {
    id: 'restaurant3',
    name: "Sushi World",
    cuisine: "Japanese • Sushi • Asian",
    image: "images/restaurants/sushi-place.jpg",
    rating: 4.8,
    reviewCount: 180,
    deliveryFee: 3.99,
    deliveryTime: "20-30 min",
    menu: [
      { id: 301, name: "California Roll", description: "Crab, avocado and cucumber", price: 8.99, category: "Sushi" },
      { id: 302, name: "Spicy Tuna Roll", description: "Fresh tuna with spicy mayo", price: 10.99, category: "Sushi" }
    ]
  },
  {
    id: 'restaurant4',
    name: "Mexican Fiesta",
    cuisine: "Mexican • Tacos • Burritos",
    image: "images/restaurants/mexican-place.jpg",
    rating: 4.4,
    reviewCount: 210,
    deliveryFee: 2.49,
    deliveryTime: "15-25 min",
    menu: [
      { id: 401, name: "Beef Tacos", description: "Three soft tacos with seasoned beef", price: 9.99, category: "Tacos" },
      { id: 402, name: "Chicken Burrito", description: "Large burrito with rice, beans and chicken", price: 11.99, category: "Burritos" }
    ]
  }
];

// Initialize App
function init() {
  setupEventListeners();
  loadRestaurants();
  updateCartCount();
  showView('home');
  checkLoginStatus();
}

// Check if user is logged in
function checkLoginStatus() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if (user) {
    currentUser = user;
    userRole = user.role;
    updateNavForLoggedInUser();
  }
}

// Update navigation for logged in users
function updateNavForLoggedInUser() {
  const loginLink = document.querySelector('[data-view="login"]');
  
  if (currentUser) {
    if (loginLink) {
      loginLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
      loginLink.onclick = logout;
    }
  } else {
    if (loginLink) {
      loginLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
      loginLink.onclick = () => showModal('login-modal');
    }
  }
}

// Event Listeners
function setupEventListeners() {
  // Mobile Navigation Toggle
  menuToggle.addEventListener('click', toggleSidebar);
  
  // Close Sidebar Button
  document.querySelector('.close-sidebar')?.addEventListener('click', closeSidebar);
  
  // Navigation Links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = e.target.getAttribute('data-view');
      if (view === 'login') {
        showModal('login-modal');
      } else {
        showView(view);
      }
    });
  });

  // Sidebar Links
  document.querySelectorAll('.sidebar-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
      const view = e.target.getAttribute('data-view');
      if (view === 'login') {
        showModal('login-modal');
      } else if (view) {
        showView(view);
      }
      closeSidebar();
    });
  });

  // Search Functionality
  searchBar?.addEventListener('input', (e) => {
    loadRestaurants(e.target.value);
  });

  // Back Buttons
  document.querySelectorAll('.back-button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const view = e.target.getAttribute('data-view');
      showView(view);
    });
  });

  // Payment Method Selection
  document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', selectPaymentMethod);
  });

  // Close Modal Button
  document.querySelector('.close-modal')?.addEventListener('click', () => {
    hideModal('login-modal');
  });

  // Flip Card Button
  document.querySelectorAll('.flip-btn').forEach(btn => {
    btn.addEventListener('click', flipCard);
  });
}

// View Management
function showView(viewName) {
  // Hide all views
  Object.values(views).forEach(view => {
    view?.classList.remove('active');
  });

  // Show selected view
  if (views[viewName]) {
    views[viewName].classList.add('active');
  }

  // Special cases
  if (viewName === 'cart') {
    renderCart();
  } else if (viewName === 'orders') {
    renderOrders();
  }
}

function showModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Sidebar Functions
function toggleSidebar() {
  sidebar.classList.toggle('active');
  document.body.classList.toggle('sidebar-active');
}

function closeSidebar() {
  sidebar.classList.remove('active');
  document.body.classList.remove('sidebar-active');
}

// Restaurant Functions
function loadRestaurants(filter = '') {
  const savedRestaurants = JSON.parse(localStorage.getItem('restaurants')) || [];
  const restaurants = [...defaultRestaurants, ...savedRestaurants];
  
  const filtered = restaurants.filter(restaurant => {
    const searchTerm = filter.toLowerCase();
    return (
      restaurant.name.toLowerCase().includes(searchTerm) ||
      restaurant.cuisine.toLowerCase().includes(searchTerm);
  });

  renderRestaurants(filtered);
}

function renderRestaurants(restaurants) {
  if (!restaurantList) return;
  
  restaurantList.innerHTML = '';

  if (restaurants.length === 0) {
    restaurantList.innerHTML = '<p class="no-results">No restaurants found</p>';
    return;
  }

  restaurants.forEach((restaurant, index) => {
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.innerHTML = `
      <img src="${restaurant.image}" alt="${restaurant.name}" class="restaurant-image">
      <div class="restaurant-info">
        <h3>${restaurant.name}</h3>
        <div class="rating-delivery">
          <span class="rating">⭐ ${restaurant.rating} (${restaurant.reviewCount}+)</span>
          <span class="delivery">$${restaurant.deliveryFee} delivery</span>
        </div>
        <p class="cuisine">${restaurant.cuisine}</p>
      </div>
    `;
    card.addEventListener('click', () => showRestaurant(restaurant.id));
    restaurantList.appendChild(card);
  });
}

function showRestaurant(restaurantId) {
  const savedRestaurants = JSON.parse(localStorage.getItem('restaurants')) || [];
  const restaurants = [...defaultRestaurants, ...savedRestaurants];
  const restaurant = restaurants.find(r => r.id === restaurantId);
  
  if (!restaurant) return;

  document.getElementById('restaurant-name').textContent = restaurant.name;
  document.getElementById('restaurant-cuisine').textContent = restaurant.cuisine;
  document.getElementById('restaurant-cover').src = restaurant.image;
  document.getElementById('restaurant-rating').textContent = `⭐ ${restaurant.rating} (${restaurant.reviewCount}+)`;
  document.getElementById('restaurant-delivery').textContent = `🛵 $${restaurant.deliveryFee.toFixed(2)} delivery`;
  document.getElementById('restaurant-time').textContent = `⏱️ ${restaurant.deliveryTime}`;

  const menuList = document.getElementById('restaurant-menu-list');
  menuList.innerHTML = '';
  
  restaurant.menu.forEach(item => {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.innerHTML = `
      <div class="menu-item-info">
        <h4>${item.name}</h4>
        <p>${item.description}</p>
        <div class="menu-item-price">
          <span class="price">$${item.price.toFixed(2)}</span>
          <button class="add-to-cart" onclick="addToCart('${restaurant.id}', ${JSON.stringify(item).replace(/"/g, '&quot;')})">
            Add to Cart
          </button>
        </div>
      </div>
    `;
    menuList.appendChild(menuItem);
  });

  showView('restaurant');
}

// Cart Functions
function addToCart(restaurantId, item) {
  // Convert string back to object if needed
  if (typeof item === 'string') {
    item = JSON.parse(item.replace(/&quot;/g, '"'));
  }
  
  item.restaurantId = restaurantId;
  cart.push(item);
  saveCart();
  updateCartCount();
  showToast(`${item.name} added to cart`);
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const subtotalElement = document.getElementById('subtotal');
  const cartTotalElement = document.getElementById('cart-total');
  if (!cartItems || !subtotalElement || !cartTotalElement) return;
  
  cartItems.innerHTML = '';

  const itemGroups = {};
  const restaurants = [...defaultRestaurants, ...(JSON.parse(localStorage.getItem('restaurants')) || [])];
  
  cart.forEach(item => {
    const restaurant = restaurants.find(r => r.id === item.restaurantId);
    const key = `${item.id}-${item.restaurantId}`;
    if (!itemGroups[key]) {
      itemGroups[key] = { 
        ...item, 
        quantity: 0,
        restaurantName: restaurant?.name || 'Unknown Restaurant'
      };
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
        <div>
          <span class="item-name">${group.name} x${group.quantity}</span>
          <span class="restaurant-name">${group.restaurantName}</span>
        </div>
        <span>$${itemTotal.toFixed(2)}</span>
      </div>
      <button class="remove-btn" onclick="removeFromCart(${group.id}, '${group.restaurantId}')">
        <i class="fas fa-trash"></i>
      </button>
    `;
    cartItems.appendChild(li);
  });

  const deliveryFee = 2.99;
  const total = subtotal + deliveryFee;
  
  subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
  cartTotalElement.textContent = `$${total.toFixed(2)}`;
}

function removeFromCart(itemId, restaurantId) {
  // Find the index of the item to remove
  const index = cart.findIndex(item => 
    item.id === itemId && item.restaurantId === restaurantId
  );
  
  if (index !== -1) {
    // Remove just one instance of the item
    cart.splice(index, 1);
    saveCart();
    updateCartCount();
    renderCart();
    showToast(`Item removed from cart`);
  }
}

function saveCart() {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (e) {
    console.error("Failed to save cart:", e);
  }
}

function updateCartCount() {
  if (cartCount) {
    cartCount.textContent = cart.length;
  }
}

// Orders Functions
function renderOrders() {
  const ordersList = document.getElementById('orders-list');
  if (!ordersList) return;
  
  // In a real app, this would fetch from backend
  ordersList.innerHTML = `
    <div class="order-card">
      <div class="order-header">
        <span class="order-date">Delivered on July 1, 2025</span>
        <span class="order-total">$24.97</span>
      </div>
      <div class="order-restaurant">Burger Palace</div>
      <div class="order-items">
        <span>Classic Burger x1</span>
        <span>Cheeseburger x2</span>
      </div>
      <button class="reorder-btn">Reorder</button>
    </div>
    <div class="order-card">
      <div class="order-header">
        <span class="order-date">Delivered on June 28, 2025</span>
        <span class="order-total">$18.98</span>
      </div>
      <div class="order-restaurant">Pizza Heaven</div>
      <div class="order-items">
        <span>Margherita Pizza x1</span>
      </div>
      <button class="reorder-btn">Reorder</button>
    </div>
  `;
}

// Payment Functions
function showPayment() {
  if (cart.length === 0) {
    showToast('Your cart is empty!');
    return;
  }
  showView('payment');
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
  if (paymentForm) {
    paymentForm.classList.add('active');
  }
  
  if (method.dataset.method === 'paypal') {
    showToast('You will be redirected to PayPal to complete your payment');
  }
}

function processPayment() {
  const selectedMethod = document.querySelector('.payment-method.selected')?.dataset.method;
  
  if (selectedMethod === 'card') {
    const cardNumber = document.getElementById('card-number')?.value;
    const cardName = document.getElementById('card-name')?.value;
    const cardExpiry = document.getElementById('card-expiry')?.value;
    const cardCvv = document.getElementById('card-cvv')?.value;
    
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      showToast('Please fill all card details');
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
  
  // Show order confirmation
  document.getElementById('order-id').textContent = orderId;
  
  // Clear cart
  cart = [];
  saveCart();
  updateCartCount();
  
  // Show confirmation view
  showView('confirmation');
}

// Login Functions
function flipCard() {
  const flipCard = document.querySelector('.flip-card');
  if (flipCard) {
    flipCard.classList.toggle('flipped');
  }
}

function socialLogin(provider) {
  showToast(`Logging in with ${provider}...`);
  
  // Simulate social login
  setTimeout(() => {
    currentUser = {
      name: "Social User",
      email: `user@${provider}.com`,
      role: "customer",
      provider: provider
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    userRole = 'customer';
    hideModal('login-modal');
    updateNavForLoggedInUser();
    showToast('Logged in successfully!');
  }, 1500);
}

function ownerLogin() {
  const username = document.getElementById('owner-username')?.value;
  const password = document.getElementById('owner-password')?.value;
  
  if (username === 'admin' && password === 'admin123') {
    currentUser = {
      name: "Restaurant Owner",
      email: "owner@dishlyft.com",
      role: "owner"
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    userRole = 'owner';
    hideModal('login-modal');
    updateNavForLoggedInUser();
    showToast('Logged in as restaurant owner');
  } else {
    const errorElement = document.getElementById('login-error');
    if (errorElement) {
      errorElement.textContent = 'Invalid credentials';
    }
  }
}

function logout() {
  currentUser = null;
  userRole = null;
  localStorage.removeItem('currentUser');
  updateNavForLoggedInUser();
  showToast('Logged out successfully');
  showView('home');
}

// UI Helpers
function showToast(message) {
  if (!toast) return;
  
  toast.querySelector('.toast-message').textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
