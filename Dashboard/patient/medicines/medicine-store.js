class MedicineStore {
    constructor() {
        this.cart = [];
        this.medicines = [
            {
                id: 1,
                name: "Ventolin Inhaler",
                description: "Bronchodilator for asthma relief",
                price: 25.99,
                category: "prescription",
                requiresPrescription: true,
                image: "https://via.placeholder.com/200x200?text=Ventolin+Inhaler",
                stock: 50
            },
            {
                id: 2,
                name: "Vitamin C 1000mg",
                description: "Immune system support",
                price: 15.99,
                category: "supplements",
                requiresPrescription: false,
                image: "https://via.placeholder.com/200x200?text=Vitamin+C",
                stock: 100
            },
            {
                id: 3,
                name: "Paracetamol 500mg",
                description: "Pain and fever relief",
                price: 5.99,
                category: "otc",
                requiresPrescription: false,
                image: "https://www.drugs.com/images/pills/paracetamol.jpg",
                stock: 200
            },
            {
                id: 4,
                name: "Blood Pressure Monitor",
                description: "Digital BP monitoring device",
                price: 45.99,
                category: "equipment",
                requiresPrescription: false,
                image: "https://via.placeholder.com/200x200?text=BP+Monitor",
                stock: 30
            },
            {
                id: 5,
                name: "Insulin Pen",
                description: "Diabetes management",
                price: 75.99,
                category: "prescription",
                requiresPrescription: true,
                image: "https://www.drugs.com/images/pills/insulin-pen.jpg",
                stock: 40
            },
            {
                id: 6,
                name: "First Aid Kit",
                description: "Complete emergency kit",
                price: 35.99,
                category: "equipment",
                requiresPrescription: false,
                image: "https://m.media-amazon.com/images/I/81ZStS2c4kL._AC_SL1500_.jpg",
                stock: 60
            },
            {
                id: 7,
                name: "Multivitamin Complex",
                description: "Daily nutritional support",
                price: 19.99,
                category: "supplements",
                requiresPrescription: false,
                image: "https://m.media-amazon.com/images/I/71dp5f24TyL._AC_SL1500_.jpg",
                stock: 150
            },
            {
                id: 8,
                name: "Antibacterial Cream",
                description: "Topical infection treatment",
                price: 12.99,
                category: "otc",
                requiresPrescription: false,
                image: "https://m.media-amazon.com/images/I/61QS7yhwH1L._AC_SL1500_.jpg",
                stock: 80
            },
            {
                id: 9,
                name: "Digital Thermometer",
                description: "Accurate temperature measurement",
                price: 15.99,
                category: "equipment",
                requiresPrescription: false,
                image: "https://m.media-amazon.com/images/I/61KlXjqZHAL._AC_SL1500_.jpg",
                stock: 45
            },
            {
                id: 10,
                name: "Omega-3 Fish Oil",
                description: "Heart and brain health support",
                price: 22.99,
                category: "supplements",
                requiresPrescription: false,
                image: "https://m.media-amazon.com/images/I/71LZxj7kIkL._AC_SL1500_.jpg",
                stock: 120
            },
            {
                id: 11,
                name: "Blood Glucose Meter",
                description: "Diabetes monitoring device",
                price: 29.99,
                category: "equipment",
                requiresPrescription: false,
                image: "https://i.imgur.com/R6TWkLH.jpg",
                stock: 25
            },
            {
                id: 12,
                name: "Medical Face Masks",
                description: "3-ply protective masks",
                price: 9.99,
                category: "equipment",
                requiresPrescription: false,
                image: "https://i.imgur.com/2MG9HYX.jpg",
                stock: 1000
            }
        ];

        this.init();
    }

    init() {
        this.renderMedicines();
        this.setupEventListeners();
    }

    renderMedicines() {
        const container = document.querySelector('.medicines-grid');
        if (!container) return;

        container.innerHTML = this.medicines.map(medicine => this.createMedicineCard(medicine)).join('');
    }

    createMedicineCard(medicine) {
        return `
            <div class="medicine-card" data-id="${medicine.id}">
                <div class="medicine-image">
                    <img src="${medicine.image}" alt="${medicine.name}">
                    ${medicine.requiresPrescription ? '<span class="prescription-badge">Prescription Required</span>' : ''}
                </div>
                <div class="medicine-info">
                    <h3>${medicine.name}</h3>
                    <p>${medicine.description}</p>
                    <div class="medicine-details">
                        <span class="price">$${medicine.price.toFixed(2)}</span>
                        <span class="stock">${medicine.stock} in stock</span>
                    </div>
                    <div class="medicine-actions">
                        <button class="add-to-cart" ${medicine.requiresPrescription ? 'data-prescription="required"' : ''}>
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Add to cart handlers
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const card = e.target.closest('.medicine-card');
                const medicineId = parseInt(card.dataset.id);
                this.addToCart(medicineId);
            });
        });

        // Cart icon handler
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.addEventListener('click', () => this.showCart());
        }
    }

    addToCart(medicineId) {
        const medicine = this.medicines.find(m => m.id === medicineId);
        
        if (medicine.requiresPrescription) {
            this.showPrescriptionUpload(medicine);
            return;
        }

        this.cart.push({
            ...medicine,
            quantity: 1
        });

        this.updateCartBadge();
        this.showNotification('Added to cart!');
    }

    showPrescriptionUpload(medicine) {
        const modal = document.createElement('div');
        modal.className = 'modal prescription-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Upload Prescription</h2>
                <p>Please upload a valid prescription for ${medicine.name}</p>
                <form id="prescription-form">
                    <input type="file" accept="image/*,.pdf" required>
                    <button type="submit" class="btn-primary">Submit</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        const form = modal.querySelector('form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            // Here you would handle the prescription upload
            this.cart.push({
                ...medicine,
                quantity: 1,
                prescriptionPending: true
            });
            this.updateCartBadge();
            modal.remove();
            this.showNotification('Added to cart! Prescription will be verified.');
        });
    }

    updateCartBadge() {
        const badge = document.querySelector('.cart-badge');
        if (badge) {
            badge.textContent = this.cart.length;
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 3000);
    }

    showCart() {
        const modal = document.createElement('div');
        modal.className = 'modal cart-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Your Cart</h2>
                <div class="cart-items">
                    ${this.cart.length === 0 ? '<p>Your cart is empty</p>' : 
                    this.cart.map(item => `
                        <div class="cart-item">
                            <img src="${item.image}" alt="${item.name}">
                            <div class="item-details">
                                <h3>${item.name}</h3>
                                <p>$${item.price.toFixed(2)}</p>
                                <div class="quantity-controls">
                                    <button class="decrease">-</button>
                                    <span>${item.quantity}</span>
                                    <button class="increase">+</button>
                                </div>
                            </div>
                            <button class="remove-item" data-id="${item.id}">×</button>
                        </div>
                    `).join('')}
                </div>
                <div class="cart-summary">
                    <div class="total">
                        <span>Total:</span>
                        <span>$${this.getCartTotal().toFixed(2)}</span>
                    </div>
                    <button class="checkout-btn" ${this.cart.length === 0 ? 'disabled' : ''}>
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
}

// Initialize the shop
document.addEventListener('DOMContentLoaded', () => {
    new MedicineStore();
});
