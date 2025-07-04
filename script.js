// DOM Elements
const views = {
  home: document.getElementById('home-view'),
  restaurant: document.getElementById('restaurant-view'),
  admin: document.getElementById('admin-panel'),
  cart: document.getElementById('cart-view'),
  payment: document.getElementById('payment-view'),
  confirmation: document.getElementById('confirmation-view')
};

const modal = document.getElementById('login-modal');
const menuToggle = document.getElementById('menu-toggle');
const nav = document.getElementById('main-nav');
const searchBar = document.getElementById('search-bar');
const restaurantList = document.getElementById('restaurant-list');
const cartCount = document.getElementById('cart-count');
const toast = document.getElementById('toast');

// App State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let userRole = null;
let selectedImageBase64 = '';
let currentRestaurantIndex = null;
let currentUser = null;

// Sample Data with DishLyft branding
const defaultRestaurants = [
  {
    name: "Burger Palace",
    cuisine: "American • Fast Food",
    image: "images/restaurant1.jpg",
    rating: 4.5,
    deliveryFee: 2.99,
    deliveryTime: "20-30 min",
    menu: [
      { id: 101, name: "Classic Burger", description: "Beef patty with lettuce, tomato, and special sauce", price: 8.99, category: "Burgers", image: "images/burger1.jpg" },
      { id: 102, name: "Cheeseburger", description: "Classic burger with American cheese", price: 9.99, category: "Burgers", image: "images/burger2.jpg" },
      { id: 103, name: "Bacon Burger", description: "Classic burger with crispy bacon", price: 10.99, category: "Burgers", image: "images/burger3.jpg" }
    ]
  },
  {
    name: "Pizza Heaven",
    cuisine: "Italian • Pizza",
    image: "images/restaurant2.jpg",
    rating: 4.7,
    deliveryFee: 3.49,
    deliveryTime: "25-35 min",
    menu: [
      { id: 201, name: "Margherita Pizza", description: "Classic tomato and mozzarella", price: 12.99, category: "Pizzas", image: "images/pizza1.jpg" },
      { id: 202, name: "Pepperoni Pizza", description: "Tomato sauce, mozzarella and pepperoni", price: 14.99, category: "Pizzas", image: "images/pizza2.jpg" }
    ]
  },
  {
    name: "Green Bowl",
    cuisine: "Healthy • Salads",
    image: "images/restaurant5.jpg",
    rating: 4.6,
    deliveryFee: 3.99,
    deliveryTime: "20-30 min",
    menu: [
      { id: 301, name: "Avocado Salad", description: "Fresh greens with avocado and nuts", price: 9.99, category: "Salads", image: "images/salad1.jpg" },
      { id: 302, name: "Quinoa Bowl", description: "Quinoa with roasted vegetables", price: 11.99, category: "Healthy", image: "images/bowl1.jpg" }
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
  const navList = document.querySelector('.nav-list');
  
  // Remove existing profile link if any
  const existingProfile = document.querySelector('.nav-profile');
  if (existingProfile) {
    existingProfile.remove();
  }
  
  if (currentUser) {
    const profileItem = document.createElement('li');
    profileItem.className = 'nav-profile';
    
    if (userRole === 'owner') {
      profileItem.innerHTML = `
        <a href="#" class="nav-link" data-view="admin">
          <i class="fas fa-user-circle"></i> Manage Restaurant
        </a>
      `;
    } else {
      profileItem.innerHTML = `
        <a href="#" class="nav-link" data-view="account">
          <i class="fas fa-user-circle"></i> My Account
        </a>
      `;
    }
    
    navList.insertBefore(profileItem, navList.lastElementChild);
    
    // Replace login with logout
    const loginItem = document.querySelector('[data-view="login"]').parentElement;
    loginItem.innerHTML = `
      <a href="#" class="nav-link" onclick="logout()">
        <i class="fas fa-sign-out-alt"></i> Logout
      </a>
    `;
  }
}

// Event Listeners
function setupEventListeners() {
  // Mobile Navigation Toggle
  menuToggle.addEventListener('click', toggleMobileNav);
  
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
      if (nav.classList.contains('active')) toggleMobileNav();
    });
  });

  // Back Buttons
  document.querySelectorAll('.back-button').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const view = e.target.getAttribute('data-view');
      showView(view);
    });
  });

  // Search Functionality
  searchBar.addEventListener('input', (e) => {
    loadRestaurants(e.target.value);
  });

  // Category Filters
  document.querySelectorAll('.category-list button').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.category-list button').forEach(btn => {
        btn.classList.remove('active');
      });
      button.classList.add('active');
      loadRestaurants(searchBar.value, button.textContent);
    });
  });

  // Image Upload
  document.getElementById('res-image-file').addEventListener('change', handleImageUpload);

  // Payment Method Selection
  document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', selectPaymentMethod);
  });

  // Close Modal Button
  document.querySelector('.close-modal').addEventListener('click', () => {
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
    view.classList.remove('active');
  });

  // Show selected view
  if (views[viewName]) {
    views[viewName].classList.add('active');
  }

  // Special cases
  if (viewName === 'cart') {
    renderCart();
  }
}

function showModal(modalId) {
  document.getElementById(modalId).classList.add('active');
}

function hideModal(modalId) {
  document.getElementById(modalId).classList.remove('active');
}

// Restaurant Functions
function loadRestaurants(filter = '', category = 'All') {
  const savedRestaurants = JSON.parse(localStorage.getItem('restaurants')) || [];
  const restaurants = [...defaultRestaurants, ...savedRestaurants];
  
  const filtered = restaurants.filter(restaurant => {
    const searchTerm = filter.toLowerCase();
    const matchesSearch = (
      restaurant.name.toLowerCase().includes(searchTerm) ||
      restaurant.cuisine.toLowerCase().includes(searchTerm)
    );
    const matchesCategory = category === 'All' || restaurant.cuisine.includes(category);
    return matchesSearch && matchesCategory;
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
      <img src="${restaurant.image}" alt="${restaurant.name}" class="restaurant-image">
      <div class="restaurant-info">
        <h3>${restaurant.name}</h3>
        <p>${restaurant.cuisine}</p>
        <div class="restaurant-details">
          <span>⭐ ${restaurant.rating}</span>
          <span>🛵 $${restaurant.deliveryFee.toFixed(2)}</span>
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
  const savedRestaurants = JSON.parse(localStorage.getItem('restaurants')) || [];
  const restaurants = [...defaultRestaurants, ...savedRestaurants];
  const restaurant = restaurants[index];

  document.getElementById('restaurant-name').textContent = restaurant.name;
  document.getElementById('restaurant-cuisine').textContent = restaurant.cuisine;
  document.getElementById('restaurant-cover').src = restaurant.image;
  document.getElementById('restaurant-rating').textContent = `⭐ ${restaurant.rating}`;
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
          <button class="add-to-cart" onclick="addToCart(${index}, ${JSON.stringify(item).replace(/"/g, '&quot;')})">
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
function addToCart(restaurantIndex, item) {
  // Convert string back to object if needed
  if (typeof item === 'string') {
    item = JSON.parse(item.replace(/&quot;/g, '"'));
  }
  
  item.restaurantIndex = restaurantIndex;
  cart.push(item);
  saveCart();
  updateCartCount();
  showToast(`${item.name} added to cart`);
}

function renderCart() {
  const cartItems = document.getElementById('cart-items');
  const subtotalElement = document.getElementById('subtotal');
  const cartTotalElement = document.getElementById('cart-total');
  cartItems.innerHTML = '';

  const itemGroups = {};
  const restaurants = [...defaultRestaurants, ...(JSON.parse(localStorage.getItem('restaurants')) || [])];
  
  cart.forEach(item => {
    const restaurant = restaurants[item.restaurantIndex];
    const key = `${item.id}-${item.restaurantIndex}`;
    if (!itemGroups[key]) {
      itemGroups[key] = { 
        ...item, 
        quantity: 0,
        restaurantName: restaurant.name
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
      <button class="remove-btn" onclick="removeFromCart(${group.id}, ${group.restaurantIndex})">
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

function removeFromCart(itemId, restaurantIndex) {
  // Find the index of the item to remove
  const index = cart.findIndex(item => 
    item.id === itemId && item.restaurantIndex === restaurantIndex
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
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
  cartCount.textContent = cart.length;
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

// Admin Functions
function addMenuItem() {
  const container = document.getElementById('menu-items-container');
  const newItem = document.createElement('div');
  newItem.className = 'menu-item-input';
  newItem.innerHTML = `
    <input type="text" class="menu-item-name" placeholder="Item Name">
    <input type="number" class="menu-item-price" placeholder="Price" min="0" step="0.01">
    <button class="remove-item-btn" onclick="this.parentElement.remove()">×</button>
  `;
  container.appendChild(newItem);
}

function addRestaurant() {
  const name = document.getElementById('res-name').value.trim();
  const cuisine = document.getElementById('res-cuisine').value.trim();
  
  const menu = [];
  document.querySelectorAll('.menu-item-input').forEach(item => {
    const name = item.querySelector('.menu-item-name').value.trim();
    const price = parseFloat(item.querySelector('.menu-item-price').value);
    if (name && !isNaN(price)) {
      menu.push({ 
        id: Math.floor(Math.random() * 1000),
        name, 
        price,
        description: "",
        category: "Main",
        image: "" 
      });
    }
  });

  if (!name || !cuisine || menu.length === 0 || !selectedImageBase64) {
    showToast('Please fill in all fields');
    return;
  }

  const savedRestaurants = JSON.parse(localStorage.getItem('restaurants')) || [];
  savedRestaurants.push({
    name,
    cuisine,
    menu,
    image: selectedImageBase64,
    rating: 4.5,
    deliveryFee: 2.99,
    deliveryTime: "20-30 min"
  });
  localStorage.setItem('restaurants', JSON.stringify(savedRestaurants));

  // Reset form
  document.getElementById('res-name').value = '';
  document.getElementById('res-cuisine').value = '';
  document.getElementById('menu-items-container').innerHTML = `
    <div class="menu-item-input">
      <input type="text" class="menu-item-name" placeholder="Item Name">
      <input type="number" class="menu-item-price" placeholder="Price" min="0" step="0.01">
      <button class="remove-item-btn">×</button>
    </div>
  `;
  document.getElementById('res-image-file').value = '';
  document.getElementById('image-preview').src = '';
  selectedImageBase64 = '';

  showToast('Restaurant added successfully!');
  loadRestaurants();
  showView('home');
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  const preview = document.getElementById('image-preview');
  
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      selectedImageBase64 = event.target.result;
      preview.src = selectedImageBase64;
    };
    reader.readAsDataURL(file);
  }
}

// Login Functions
function flipCard() {
  const flipCard = document.querySelector('.flip-card');
  flipCard.classList.toggle('flipped');
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
  const username = document.getElementById('owner-username').value;
  const password = document.getElementById('owner-password').value;
  
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
    showView('admin');
  } else {
    document.getElementById('login-error').textContent = 'Invalid credentials';
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
function toggleMobileNav() {
  nav.classList.toggle('active');
  document.body.classList.toggle('nav-active');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.querySelector('.toast-message').textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
