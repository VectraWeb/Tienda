// Sistema de pagos seguro para Gaming Club
class SecurePaymentSystem {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.paymentData = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStepDisplay();
        this.loadOrderSummary();
    }

    // Configurar event listeners
    setupEventListeners() {
        const nextStepBtn = document.getElementById('next-step');
        const prevStepBtn = document.getElementById('prev-step');
        const submitPaymentBtn = document.getElementById('submit-payment');
        const paymentForm = document.getElementById('payment-form');

        if (nextStepBtn) {
            nextStepBtn.addEventListener('click', () => this.nextStep());
        }

        if (prevStepBtn) {
            prevStepBtn.addEventListener('click', () => this.previousStep());
        }

        if (submitPaymentBtn) {
            submitPaymentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.processPayment();
            });
        }

        // Validación en tiempo real
        this.setupRealTimeValidation();
    }

    // Siguiente paso
    nextStep() {
        if (!this.validateCurrentStep()) {
            return;
        }

        this.saveStepData();
        
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStepDisplay();
        }
    }

    // Paso anterior
    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    // Validar paso actual
    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.validateShippingInfo();
            case 2:
                return this.validatePaymentInfo();
            case 3:
                return true; // El paso 3 es solo confirmación
            default:
                return true;
        }
    }

    // Validar información de envío
    validateShippingInfo() {
        const requiredFields = [
            'shipping-name', 'shipping-email', 'shipping-phone',
            'shipping-address', 'shipping-city', 'shipping-zip'
        ];

        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const value = field.value.trim();

            if (!value) {
                this.showFieldError(field, 'Este campo es obligatorio');
                isValid = false;
            } else {
                this.clearFieldError(field);
                
                // Validaciones específicas
                switch (fieldId) {
                    case 'shipping-email':
                        if (!this.isValidEmail(value)) {
                            this.showFieldError(field, 'Email inválido');
                            isValid = false;
                        }
                        break;
                    case 'shipping-phone':
                        if (!this.isValidPhone(value)) {
                            this.showFieldError(field, 'Teléfono inválido');
                            isValid = false;
                        }
                        break;
                }
            }
        });

        return isValid;
    }

    // Validar información de pago
    validatePaymentInfo() {
        const cardName = document.getElementById('card-name').value.trim();
        const cardNumber = document.getElementById('card-number').value.trim();
        const cardExpiry = document.getElementById('card-expiry').value.trim();
        const cardCvc = document.getElementById('card-cvc').value.trim();

        let isValid = true;

        if (!cardName) {
            this.showFieldError(document.getElementById('card-name'), 'Nombre obligatorio');
            isValid = false;
        } else {
            this.clearFieldError(document.getElementById('card-name'));
        }

        if (!this.isValidCardNumber(cardNumber)) {
            this.showFieldError(document.getElementById('card-number'), 'Número de tarjeta inválido');
            isValid = false;
        } else {
            this.clearFieldError(document.getElementById('card-number'));
        }

        if (!this.isValidExpiryDate(cardExpiry)) {
            this.showFieldError(document.getElementById('card-expiry'), 'Fecha de expiración inválida');
            isValid = false;
        } else {
            this.clearFieldError(document.getElementById('card-expiry'));
        }

        if (!this.isValidCVC(cardCvc)) {
            this.showFieldError(document.getElementById('card-cvc'), 'CVC inválido');
            isValid = false;
        } else {
            this.clearFieldError(document.getElementById('card-cvc'));
        }

        return isValid;
    }

    // Validaciones
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    isValidCardNumber(number) {
        // Algoritmo de Luhn simplificado para demo
        const cleaned = number.replace(/\s/g, '');
        return cleaned.length >= 13 && cleaned.length <= 19 && /^\d+$/.test(cleaned);
    }

    isValidExpiryDate(expiry) {
        const match = expiry.match(/^(\d{2})\/(\d{2})$/);
        if (!match) return false;

        const month = parseInt(match[1]);
        const year = parseInt('20' + match[2]);
        
        if (month < 1 || month > 12) return false;

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        if (year < currentYear) return false;
        if (year === currentYear && month < currentMonth) return false;

        return true;
    }

    isValidCVC(cvc) {
        return /^\d{3,4}$/.test(cvc);
    }

    // Mostrar error en campo
    showFieldError(field, message) {
        field.style.borderColor = 'var(--error)';
        
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: var(--error);
            font-size: 0.75rem;
            margin-top: 0.25rem;
        `;
    }

    // Limpiar error de campo
    clearFieldError(field) {
        field.style.borderColor = '';
        
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    // Configurar validación en tiempo real
    setupRealTimeValidation() {
        const fields = document.querySelectorAll('.form-input');
        
        fields.forEach(field => {
            field.addEventListener('blur', () => {
                if (this.currentStep === 1 || this.currentStep === 2) {
                    this.validateCurrentStep();
                }
            });

            field.addEventListener('input', () => {
                this.clearFieldError(field);
            });
        });

        // Formatear número de tarjeta
        const cardNumberInput = document.getElementById('card-number');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '');
                if (value.length > 16) value = value.substr(0, 16);
                
                // Agregar espacios cada 4 dígitos
                value = value.replace(/(\d{4})/g, '$1 ').trim();
                e.target.value = value;
            });
        }

        // Formatear fecha de expiración
        const expiryInput = document.getElementById('card-expiry');
        if (expiryInput) {
            expiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substr(0, 2) + '/' + value.substr(2, 2);
                }
                e.target.value = value;
            });
        }
    }

    // Actualizar visualización de pasos
    updateStepDisplay() {
        // Actualizar steps
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = parseInt(step.dataset.step);
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Mostrar/ocultar formularios
        document.querySelectorAll('.form-step').forEach(step => {
            const stepNumber = parseInt(step.dataset.step);
            if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Actualizar botones
        const prevBtn = document.getElementById('prev-step');
        const nextBtn = document.getElementById('next-step');
        const submitBtn = document.getElementById('submit-payment');

        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 1 ? 'inline-block' : 'none';
        }

        if (nextBtn) {
            nextBtn.style.display = this.currentStep < this.totalSteps ? 'inline-block' : 'none';
        }

        if (submitBtn) {
            submitBtn.style.display = this.currentStep === this.totalSteps ? 'inline-block' : 'none';
        }

        // Actualizar resumen en el paso 3
        if (this.currentStep === 3) {
            this.loadOrderSummary();
        }
    }

    // Guardar datos del paso actual
    saveStepData() {
        switch (this.currentStep) {
            case 1:
                this.paymentData.shipping = {
                    name: document.getElementById('shipping-name').value,
                    email: document.getElementById('shipping-email').value,
                    phone: document.getElementById('shipping-phone').value,
                    address: document.getElementById('shipping-address').value,
                    city: document.getElementById('shipping-city').value,
                    zip: document.getElementById('shipping-zip').value
                };
                break;
            case 2:
                this.paymentData.payment = {
                    method: 'card',
                    cardName: document.getElementById('card-name').value,
                    // Nota: En producción, nunca almacenar datos de tarjeta sin encriptación
                };
                break;
        }
    }

    // Cargar resumen del pedido
    loadOrderSummary() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const orderItems = document.getElementById('order-items');
        const orderSubtotal = document.getElementById('order-subtotal');
        const orderTotal = document.getElementById('order-total');

        if (!orderItems) return;

        orderItems.innerHTML = '';

        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <div class="order-item-info">
                    <div class="order-item-image">
                        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/300x200?text=Imagen+No+Disponible'">
                    </div>
                    <div>
                        <h4>${item.name}</h4>
                        <p class="order-item-price">$${item.price.toFixed(2)} x ${item.quantity}</p>
                    </div>
                </div>
                <div class="order-item-total">
                    $${itemTotal.toFixed(2)}
                </div>
            `;
            orderItems.appendChild(orderItem);
        });

        const shipping = 5.99;
        const total = subtotal + shipping;

        if (orderSubtotal) orderSubtotal.textContent = subtotal.toFixed(2);
        if (orderTotal) orderTotal.textContent = total.toFixed(2);
    }

    // Procesar pago
    async processPayment() {
        const submitBtn = document.getElementById('submit-payment');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnSpinner = submitBtn.querySelector('.btn-spinner');

        try {
            // Mostrar estado de carga
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnSpinner.style.display = 'block';

            // Simular procesamiento de pago seguro
            await this.simulateSecurePayment();

            // Mostrar éxito
            this.showPaymentSuccess();

        } catch (error) {
            this.showPaymentError(error.message);
        } finally {
            // Restaurar botón
            submitBtn.disabled = false;
            btnText.style.display = 'block';
            btnSpinner.style.display = 'none';
        }
    }

    // Simular pago seguro
    async simulateSecurePayment() {
        return new Promise((resolve, reject) => {
            // Simular comunicación con servidor seguro
            setTimeout(() => {
                // 90% de éxito para la demo
                if (Math.random() > 0.1) {
                    resolve({
                        success: true,
                        transactionId: 'GAMING_' + Date.now(),
                        amount: this.calculateTotal(),
                        timestamp: new Date().toISOString()
                    });
                } else {
                    reject(new Error('El pago fue rechazado por el banco. Por favor, intente con otro método de pago.'));
                }
            }, 3000);
        });
    }

    // Calcular total
    calculateTotal() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return subtotal + 5.99; // shipping
    }

    // Mostrar éxito de pago
    showPaymentSuccess() {
        // Limpiar carrito
        localStorage.removeItem('cart');
        
        // Actualizar interfaz
        if (typeof updateCart === 'function') {
            updateCart();
        }

        // Mostrar confirmación
        const paymentModal = document.getElementById('payment-modal');
        const modalBody = paymentModal.querySelector('.modal-body');
        
        modalBody.innerHTML = `
            <div class="payment-success" style="text-align: center; padding: 2rem;">
                <div class="success-icon" style="margin-bottom: 1.5rem;">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" style="color: var(--success);">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h3 style="color: var(--success); margin-bottom: 1rem;">¡Pago Exitoso!</h3>
                <p style="color: var(--gray-600); margin-bottom: 2rem;">Tu pedido gaming ha sido procesado correctamente. Recibirás un email de confirmación.</p>
                <div class="order-details" style="background: var(--gray-50); padding: 1.5rem; border-radius: var(--radius-md); margin-bottom: 2rem;">
                    <p style="margin-bottom: 0.5rem;"><strong>Número de transacción:</strong> GAMING_${Date.now()}</p>
                    <p style="margin-bottom: 0.5rem;"><strong>Total:</strong> $${this.calculateTotal().toFixed(2)}</p>
                    <p style="margin-bottom: 0;"><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                <button class="btn btn-primary" onclick="window.location.reload()">Continuar Comprando</button>
            </div>
        `;

        // Ocultar footer del modal
        paymentModal.querySelector('.modal-footer').style.display = 'none';
    }

    // Mostrar error de pago
    showPaymentError(message) {
        // Crear alerta de error
        const alert = document.createElement('div');
        alert.className = 'alert alert-error';
        alert.innerHTML = `
            <div class="alert-icon">❌</div>
            <div class="alert-content">
                <div class="alert-title">Error de Pago</div>
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

        container.appendChild(alert);

        // Auto-remover
        setTimeout(() => {
            if (alert.parentNode) {
                alert.style.animation = 'slideInRight 0.3s ease reverse';
                setTimeout(() => alert.remove(), 300);
            }
        }, 5000);

        // Cerrar manualmente
        alert.querySelector('.alert-close').addEventListener('click', () => {
            alert.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => alert.remove(), 300);
        });
    }
}

// Inicializar sistema de pagos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('payment-modal')) {
        window.paymentSystem = new SecurePaymentSystem();
    }
});