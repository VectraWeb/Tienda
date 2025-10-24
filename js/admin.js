// Sistema de administración seguro para Gaming Club
class AdminSystem {
    constructor() {
        this.currentUser = null;
        this.editingProductId = null;
        this.init();
    }

    async init() {
        // Verificar autenticación primero
        await this.checkAuthentication();
        
        if (this.currentUser) {
            this.setupAdmin();
            this.loadAdminData();
            this.setupEventListeners();
        }
    }

    // Verificar autenticación
    async checkAuthentication() {
        const preloader = document.getElementById('admin-preloader');
        const adminContent = document.getElementById('admin-content');
        const unauthorizedMessage = document.getElementById('unauthorized-message');

        try {
            // Esperar a que el sistema de auth esté listo
            if (!window.authSystem) {
                setTimeout(() => this.checkAuthentication(), 100);
                return;
            }

            // Verificar si hay usuario autenticado
            if (window.authSystem.currentUser && window.authSystem.currentUser.role === 'admin') {
                this.currentUser = window.authSystem.currentUser;
                
                // Mostrar contenido de admin
                preloader.style.display = 'none';
                adminContent.style.display = 'block';
                
                // Actualizar interfaz con info del usuario
                this.updateUserInterface();
            } else {
                // Redirigir a login
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
        } catch (error) {
            console.error('Error de autenticación:', error);
            preloader.style.display = 'none';
            unauthorizedMessage.style.display = 'block';
        }
    }

    // Actualizar interfaz con info del usuario
    updateUserInterface() {
        const usernameElement = document.getElementById('admin-username');
        const welcomeElement = document.getElementById('admin-welcome');
        
        if (usernameElement) {
            usernameElement.textContent = this.currentUser.username;
        }
        
        if (welcomeElement) {
            welcomeElement.textContent = `Bienvenido, ${this.currentUser.username}`;
        }
    }

    setupAdmin() {
        console.log('Admin system initialized for user:', this.currentUser.username);
    }

    loadAdminData() {
        this.loadProducts();
        this.updateStats();
        this.loadCategoryFilter();
    }

    setupEventListeners() {
        // Formulario de productos
        const productForm = document.getElementById('product-form');
        if (productForm) {
            productForm.addEventListener('submit', (e) => this.saveProduct(e));
        }

        // Botones de acción
        const cancelEditBtn = document.getElementById('cancel-edit');
        const clearFormBtn = document.getElementById('clear-form');
        const refreshBtn = document.getElementById('refresh-products');
        const logoutBtn = document.getElementById('logout-btn');

        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => this.cancelEdit());
        }

        if (clearFormBtn) {
            clearFormBtn.addEventListener('click', () => this.clearForm());
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadProducts());
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Búsqueda y filtros
        const adminSearch = document.getElementById('admin-search');
        const categoryFilter = document.getElementById('admin-category-filter');

        if (adminSearch) {
            adminSearch.addEventListener('input', () => this.filterProducts());
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.filterProducts());
        }

        // Preview de imagen
        const imageInput = document.getElementById('product-image');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => this.previewImage(e));
        }
    }

    // Cerrar sesión
    logout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            try {
                // Mostrar mensaje de despedida
                this.showNotification('Sesión cerrada correctamente', 'success');
                
                // Limpiar datos de sesión
                localStorage.removeItem('gamingclub_session');
                sessionStorage.removeItem('gamingclub_session');
                
                // Redirigir después de un breve delay
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
                
            } catch (error) {
                console.error('Error al cerrar sesión:', error);
                // Redirigir de todas formas
                window.location.href = 'index.html';
            }
        }
    }

    // Cargar productos
    loadProducts() {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        this.renderProducts(products);
        this.updateStats();
    }

    // Renderizar productos en la lista
    renderProducts(products) {
        const container = document.getElementById('admin-products');
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                        <path d="M3 3h18v18H3V3z" stroke="currentColor" stroke-width="2"/>
                        <path d="M9 9h6v6H9z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <h3>No hay productos</h3>
                    <p>Comienza agregando tu primer producto gaming</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="admin-product-card" data-id="${product.id}">
                <div class="product-header">
                    <h4>${product.name}</h4>
                    <span class="product-category-badge">${this.getCategoryName(product.category)}</span>
                </div>
                <div class="product-image-preview">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+No+Disponible'">
                </div>
                <div class="product-details">
                    <p><strong>Descripción:</strong> ${product.description}</p>
                    <p><strong>Precio:</strong> $${product.price.toFixed(2)}</p>
                    <p><strong>ID:</strong> ${product.id}</p>
                </div>
                <div class="admin-product-actions">
                    <button class="edit-btn" onclick="adminSystem.editProduct(${product.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Editar
                    </button>
                    <button class="delete-btn" onclick="adminSystem.deleteProduct(${product.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        Eliminar
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Método auxiliar para obtener nombre de categoría
    getCategoryName(categoryId) {
        const categories = {
            'perifericos': 'Periféricos',
            'componentes': 'Componentes PC',
            'sillas': 'Sillas Gaming',
            'audio': 'Audio',
            'monitores': 'Monitores',
            'accesorios': 'Accesorios'
        };
        return categories[categoryId] || categoryId;
    }

    // Actualizar estadísticas
    updateStats() {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const totalProducts = document.getElementById('total-products');
        const totalCategories = document.getElementById('total-categories');
        const totalValue = document.getElementById('total-value');

        if (totalProducts) {
            totalProducts.textContent = products.length;
        }

        if (totalCategories) {
            const uniqueCategories = new Set(products.map(p => p.category));
            totalCategories.textContent = uniqueCategories.size;
        }

        if (totalValue) {
            const total = products.reduce((sum, product) => sum + product.price, 0);
            totalValue.textContent = `$${total.toFixed(2)}`;
        }
    }

    // Cargar filtro de categorías
    loadCategoryFilter() {
        const filter = document.getElementById('admin-category-filter');
        if (!filter) return;

        const categories = {
            'all': 'Todas las categorías',
            'perifericos': 'Periféricos',
            'componentes': 'Componentes PC',
            'sillas': 'Sillas Gaming',
            'audio': 'Audio',
            'monitores': 'Monitores',
            'accesorios': 'Accesorios'
        };

        filter.innerHTML = Object.entries(categories)
            .map(([id, name]) => `<option value="${id}">${name}</option>`)
            .join('');
    }

    // Filtrar productos
    filterProducts() {
        const searchTerm = document.getElementById('admin-search').value.toLowerCase();
        const categoryFilter = document.getElementById('admin-category-filter').value;
        
        let products = JSON.parse(localStorage.getItem('products')) || [];

        // Filtrar por categoría
        if (categoryFilter !== 'all') {
            products = products.filter(product => product.category === categoryFilter);
        }

        // Filtrar por búsqueda
        if (searchTerm) {
            products = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }

        this.renderProducts(products);
    }

    // Guardar producto (crear o actualizar)
    saveProduct(e) {
        e.preventDefault();

        const productId = document.getElementById('product-id').value;
        const name = document.getElementById('product-name').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const category = document.getElementById('product-category').value;
        const description = document.getElementById('product-description').value;
        const imageInput = document.getElementById('product-image');

        // Validaciones básicas
        if (!name || !price || !category || !description) {
            this.showNotification('Por favor, completa todos los campos obligatorios', 'error');
            return;
        }

        let products = JSON.parse(localStorage.getItem('products')) || [];
        let productData = {
            name,
            price,
            category,
            description,
            image: 'https://via.placeholder.com/300x200?text=Gaming+Product'
        };

        // Procesar imagen si se subió una nueva
        if (imageInput.files.length > 0) {
            const file = imageInput.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                productData.image = e.target.result;
                completeSave();
            };
            
            reader.readAsDataURL(file);
        } else {
            // Mantener imagen existente si estamos editando
            if (productId) {
                const existingProduct = products.find(p => p.id === parseInt(productId));
                if (existingProduct) {
                    productData.image = existingProduct.image;
                }
            }
            completeSave();
        }

        const completeSave = () => {
            if (productId) {
                // Actualizar producto existente
                const id = parseInt(productId);
                const index = products.findIndex(p => p.id === id);
                
                if (index !== -1) {
                    products[index] = { ...products[index], ...productData };
                    this.showNotification('Producto actualizado correctamente', 'success');
                }
            } else {
                // Crear nuevo producto
                const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
                productData.id = newId;
                products.push(productData);
                this.showNotification('Producto creado correctamente', 'success');
            }

            // Guardar en localStorage
            localStorage.setItem('products', JSON.stringify(products));
            
            // Recargar datos
            this.loadProducts();
            this.clearForm();
        };
    }

    // Editar producto
    editProduct(id) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const product = products.find(p => p.id === id);
        
        if (!product) {
            this.showNotification('Producto no encontrado', 'error');
            return;
        }

        // Llenar formulario
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-description').value = product.description;
        
        // Mostrar imagen actual
        const imagePreview = document.getElementById('image-preview');
        imagePreview.innerHTML = `<img src="${product.image}" alt="Vista previa">`;

        // Cambiar texto del formulario
        document.getElementById('form-title').textContent = 'Editar Producto';
        document.getElementById('save-product').querySelector('.btn-text').textContent = 'Actualizar Producto';
        document.getElementById('cancel-edit').style.display = 'inline-block';

        this.editingProductId = id;
        
        // Scroll al formulario
        document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
    }

    // Eliminar producto
    deleteProduct(id) {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            return;
        }

        let products = JSON.parse(localStorage.getItem('products')) || [];
        products = products.filter(p => p.id !== id);
        
        localStorage.setItem('products', JSON.stringify(products));
        this.loadProducts();
        this.showNotification('Producto eliminado correctamente', 'success');
    }

    // Cancelar edición
    cancelEdit() {
        this.clearForm();
        this.showNotification('Edición cancelada', 'warning');
    }

    // Limpiar formulario
    clearForm() {
        document.getElementById('product-form').reset();
        document.getElementById('product-id').value = '';
        document.getElementById('image-preview').innerHTML = '';
        document.getElementById('form-title').textContent = 'Agregar Nuevo Producto';
        document.getElementById('save-product').querySelector('.btn-text').textContent = 'Guardar Producto';
        document.getElementById('cancel-edit').style.display = 'none';
        this.editingProductId = null;
    }

    // Vista previa de imagen
    previewImage(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('image-preview');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '';
        }
    }

    // Mostrar notificación en admin
    showNotification(message, type = 'success') {
        const container = document.getElementById('admin-notifications');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `admin-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        container.appendChild(notification);

        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Inicializar sistema de administración cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.adminSystem = new AdminSystem();
});