// Datos de ejemplo para productos gaming
let products = JSON.parse(localStorage.getItem('products')) || [
    {
        id: 1,
        name: "Teclado Mecánico RGB Pro",
        description: "Teclado mecánico con switches azules y iluminación RGB personalizable",
        price: 00,
        category: "perifericos",
        image: ""
    },
    {
        id: 2,
        name: "Mouse Gaming Elite",
        description: "Mouse ergonómico con sensor de 16000 DPI y 8 botones programables",
        price: 00,
        category: "perifericos",
        image: ""
    },
    {
        id: 3,
        name: "Auriculares 7.1 Surround",
        description: "Auriculares con sonido surround 7.1 y micrófono retráctil con cancelación de ruido",
        price: 00,
        category: "audio",
        image: "0"
    },
    {
        id: 4,
        name: "Monitor Curvo 144Hz",
        description: "Monitor gaming curvo de 27 pulgadas con tasa de refresco de 144Hz",
        price: 00,
        category: "monitores",
        image: ""
    },
    {
        id: 5,
        name: "Silla Gaming Ergonómica",
        description: "Silla gaming con soporte lumbar, reposacabezas y ajuste de altura",
        price: 00,
        category: "sillas",
        image: ""
    },
    {
        id: 6,
        name: "RTX 4070 Gaming OC",
        description: "Tarjeta gráfica NVIDIA RTX 4070 con 12GB GDDR6 para gaming en 4K",
        price: 00,
        category: "componentes",
        image: ""
    },
    {
        id: 7,
        name: "Mousepad RGB XL",
        description: "Mousepad gaming extra grande con iluminación RGB en los bordes",
        price: 00,
        category: "accesorios",
        image: ""
    },
    {
        id: 8,
        name: "Stream Deck Mini",
        description: "Controlador personalizable para streamers con 6 teclas LCD",
        price: 00,
        category: "accesorios",
        image: ""
    }
];

// Categorías gaming
const categories = [
    { id: "all", name: "Todos" },
    { id: "perifericos", name: "Periféricos" },
    { id: "componentes", name: "Componentes PC" },
    { id: "sillas", name: "Sillas Gaming" },
    { id: "audio", name: "Audio" },
    { id: "monitores", name: "Monitores" },
    { id: "accesorios", name: "Accesorios" }
];

// Carrito de compras
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Elementos del DOM
const categoryList = document.getElementById('category-list');
const productGrid = document.getElementById('product-grid');
const categoryFilter = document.getElementById('category-filter');
const productSearch = document.getElementById('product-search');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const cartIcon = document.querySelector('.cart-icon');
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const checkoutBtn = document.getElementById('checkout-btn');
const paymentModal = document.getElementById('payment-modal');
const paymentTotal = document.getElementById('payment-total');
const paymentForm = document.getElementById('payment-form');
const closeButtons = document.querySelectorAll('.close');
const continueShopping = document.getElementById('continue-shopping');

// Inicializar la tienda
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadProducts();
    updateCart();
    createParticles('hero-particles');
    
    // Event listeners
    cartIcon.addEventListener('click', openCart);
    checkoutBtn.addEventListener('click', openPayment);
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });
    productSearch.addEventListener('input', filterProducts);
    categoryFilter.addEventListener('change', filterProducts);
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            cartModal.style.display = 'none';
            paymentModal.style.display = 'none';
        });
    });
    
    if (continueShopping) {
        continueShopping.addEventListener('click', function() {
            cartModal.style.display = 'none';
        });
    }
    
    // Cerrar modales al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
        if (e.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
    });
    
    // Navegación suave
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            document.getElementById(section).scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
    });
    
    // Animaciones al hacer scroll
    initScrollAnimations();
});

// Crear partículas para el fondo
function createParticles(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${2 + Math.random() * 3}px;
            height: ${2 + Math.random() * 3}px;
            background: var(--neon-blue);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${6 + Math.random() * 6}s ease-in-out infinite;
            animation-delay: ${Math.random() * 5}s;
            opacity: ${0.3 + Math.random() * 0.4};
        `;
        container.appendChild(particle);
    }
}

// Inicializar animaciones al hacer scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, observerOptions);

    // Observar elementos con animaciones
    document.querySelectorAll('.animate-fade-up').forEach(el => {
        observer.observe(el);
    });
}

// Cargar categorías
function loadCategories() {
    categoryList.innerHTML = '';
    categories.forEach(category => {
        const categoryElement = document.createElement('div');
        categoryElement.className = 'category-card';
        categoryElement.innerHTML = `
            <div class="category-icon">🎮</div>
            <div class="category-name">${category.name}</div>
            <div class="category-count">${getProductCountByCategory(category.id)} productos</div>
        `;
        categoryElement.addEventListener('click', function() {
            document.querySelectorAll('.category-card').forEach(item => {
                item.style.borderColor = 'var(--gray-700)';
            });
            this.style.borderColor = 'var(--neon-blue)';
            filterProductsByCategory(category.id);
        });
        categoryList.appendChild(categoryElement);
    });
    
    // Cargar categorías en el filtro
    categoryFilter.innerHTML = '<option value="all">Todas las categorías</option>';
    categories.filter(cat => cat.id !== 'all').forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categoryFilter.appendChild(option);
    });
}

// Obtener conteo de productos por categoría
function getProductCountByCategory(categoryId) {
    if (categoryId === 'all') return products.length;
    return products.filter(product => product.category === categoryId).length;
}

// Cargar productos
function loadProducts() {
    productGrid.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+No+Disponible'">
                <div class="product-overlay">
                    <button class="quick-view-btn">Vista Rápida</button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    <div class="price">$${product.price.toFixed(2)}</div>
                    <button class="add-to-cart" data-id="${product.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.1 15.9 4.5 17 5.4 17H17M17 17C16.5 17 16 17.5 16 18C16 18.5 16.5 19 17 19C17.5 19 18 18.5 18 18C18 17.5 17.5 17 17 17ZM9 18C9 18.5 8.5 19 8 19C7.5 19 7 18.5 7 18C7 17.5 7.5 17 8 17C8.5 17 9 17.5 9 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Añadir
                    </button>
                </div>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
    
    // Event listeners para botones "Añadir al Carrito"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            addToCart(productId);
        });
    });
}

// Obtener nombre de categoría
function getCategoryName(categoryId) {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
}

// Filtrar productos por categoría
function filterProductsByCategory(categoryId) {
    const filteredProducts = categoryId === 'all' 
        ? products 
        : products.filter(product => product.category === categoryId);
    
    renderFilteredProducts(filteredProducts);
}

// Filtrar productos por búsqueda y categoría
function filterProducts() {
    const searchTerm = productSearch.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    
    let filteredProducts = products;
    
    // Filtrar por categoría
    if (selectedCategory !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.description.toLowerCase().includes(searchTerm)
        );
    }
    
    renderFilteredProducts(filteredProducts);
}

// Renderizar productos filtrados
function renderFilteredProducts(filteredProducts) {
    productGrid.innerHTML = '';
    
    if (filteredProducts.length === 0) {
        productGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <h3>No se encontraron productos</h3>
                <p>Intenta con otros términos de búsqueda</p>
            </div>
        `;
        return;
    }
    
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+No+Disponible'">
                <div class="product-overlay">
                    <button class="quick-view-btn">Vista Rápida</button>
                </div>
            </div>
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    <div class="price">$${product.price.toFixed(2)}</div>
                    <button class="add-to-cart" data-id="${product.id}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.1 15.9 4.5 17 5.4 17H17M17 17C16.5 17 16 17.5 16 18C16 18.5 16.5 19 17 19C17.5 19 18 18.5 18 18C18 17.5 17.5 17 17 17ZM9 18C9 18.5 8.5 19 8 19C7.5 19 7 18.5 7 18C7 17.5 7.5 17 8 17C8.5 17 9 17.5 9 18Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Añadir
                    </button>
                </div>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
    
    // Reasignar event listeners para los nuevos botones
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            addToCart(productId);
        });
    });
}

// Realizar búsqueda desde el header
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    if (!searchTerm) return;
    
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        product.description.toLowerCase().includes(searchTerm)
    );
    
    renderFilteredProducts(filteredProducts);
    searchInput.value = '';
    
    // Scroll a la sección de productos
    document.getElementById('products').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Añadir producto al carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCart();
    showNotification(`${product.name} añadido al carrito`, 'success');
    
    // Animación del icono del carrito
    cartIcon.classList.add('animate-bounce');
    setTimeout(() => {
        cartIcon.classList.remove('animate-bounce');
    }, 1000);
}

// Actualizar carrito
function updateCart() {
    // Guardar carrito en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Actualizar contador
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Actualizar contenido del carrito
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        document.getElementById('cart-empty').style.display = 'block';
        cartItems.style.display = 'none';
        cartTotal.textContent = '0.00';
        return;
    }
    
    document.getElementById('cart-empty').style.display = 'none';
    cartItems.style.display = 'block';
    
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+No+Disponible'">
            </div>
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-controls">
                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn plus" data-id="${item.id}">+</button>
                <button class="remove-item" data-id="${item.id}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = total.toFixed(2);
    
    // Event listeners para controles del carrito
    document.querySelectorAll('.quantity-btn.minus').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            updateCartItemQuantity(productId, -1);
        });
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            updateCartItemQuantity(productId, 1);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.dataset.id);
            removeFromCart(productId);
        });
    });
}

// Actualizar cantidad de un producto en el carrito
function updateCartItemQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCart();
    }
}

// Eliminar producto del carrito
function removeFromCart(productId) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        cart = cart.filter(item => item.id !== productId);
        updateCart();
        showNotification(`${item.name} eliminado del carrito`, 'warning');
    }
}

// Abrir carrito
function openCart() {
    cartModal.style.display = 'block';
}

// Abrir pasarela de pagos
function openPayment() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío', 'warning');
        return;
    }
    
    paymentTotal.textContent = cartTotal.textContent;
    paymentModal.style.display = 'block';
    cartModal.style.display = 'none';
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    notification.innerHTML = `
        <div class="alert-icon">${icons[type]}</div>
        <div class="alert-content">
            <div class="alert-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="alert-message">${message}</div>
        </div>
        <button class="alert-close">✕</button>
    `;
    
    // Crear contenedor si no existe
    let container = document.getElementById('alert-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'alert-container';
        container.style.cssText = `
            position: fixed;
            top: 2rem;
            right: 2rem;
            z-index: 3000;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);

    // Cerrar manualmente
    notification.querySelector('.alert-close').addEventListener('click', () => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    });
}

// Sincronizar productos desde localStorage (si se actualizaron desde el admin)
function syncProducts() {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
        loadProducts();
        loadCategories();
    }
}

// Sincronizar productos cada 2 segundos (para demo)

setInterval(syncProducts, 2000);

