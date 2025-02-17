class MedicineShop {
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
                image: "../assets/medicines/ventolin.jpg",
                stock: 50
            },
            {
                id: 2,
                name: "Vitamin C 1000mg",
                description: "Immune system support",
                price: 15.99,
                category: "supplements",
                requiresPrescription: false,
                image: "../assets/medicines/vitaminc.jpg",
                stock: 100
            },
            // Add more medicines
        ];

        this.init();
    }

    init() {
        this.renderMedicines();
        this.setupEventListeners();
    }

    renderMedicines(category = 'all') {
        const container = document.querySelector('.medicines-grid');
        const filteredMedicines = category === 'all' 
            ? this.medicines 
            : this.medicines.filter(m => m.category === category);

        container.innerHTML = filteredMedicines.map(medicine => this.createMedicineCard(medicine)).join('');
    }

    setupEventListeners() {
        // Category filter
        document.querySelector('.category-filters').addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                document.querySelectorAll('.category-filters button').forEach(btn => 
                    btn.classList.remove('active'));
                e.target.classList.add('active');
                this.renderMedicines(e.target.dataset.category);
            }
        });

        // Search functionality
        document.querySelector('.search-box input').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const medicines = document.querySelectorAll('.medicine-card');
            
            medicines.forEach(card => {
                const name = card.querySelector('h3').textContent.toLowerCase();
                card.style.display = name.includes(searchTerm) ? 'block' : 'none';
            });
        });

        // Cart icon
        document.querySelector('.cart-icon').addEventListener('click', () => 
            this.showCart());
    }

    // ... Add more methods for cart management, checkout, etc.
}

// Initialize the shop
document.addEventListener('DOMContentLoaded', () => {
    new MedicineShop();
});
