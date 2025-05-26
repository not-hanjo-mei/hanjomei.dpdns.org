// Wishlist Page JavaScript
class WishlistManager {
    constructor() {
        this.wishlistData = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.loadWishlistData();
            this.setupEventListeners();
        });
    }

    // Load wishlist data
    async loadWishlistData() {
        try {
            const response = await fetch('wishlist-data.json');
            const data = await response.json();
            this.wishlistData = data.items;
            this.updateStats();
            this.renderWishlist();
        } catch (error) {
            console.error('Error loading wishlist data:', error);
            document.getElementById('wishlistGrid').innerHTML = 
                '<div class="no-items"><h3>Error loading wishlist data</h3></div>';
        }
    }

    // Update statistics
    updateStats() {
        const total = this.wishlistData.length;
        const fulfilled = this.wishlistData.filter(item => item.fulfilled).length;
        const pending = total - fulfilled;
        const highPriority = this.wishlistData.filter(item => item.priority === 'high' && !item.fulfilled).length;
        
        // Calculate total price for pending items
        const pendingItems = this.wishlistData.filter(item => !item.fulfilled);
        const totalPendingPrice = pendingItems.reduce((sum, item) => {
            // Extract numeric value from price string (e.g., "$1200" -> 1200)
            const price = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
            return sum + price;
        }, 0);

        const statsHtml = `
            <div class="stat-card">
                <div class="stat-number">${total}</div>
                <div class="stat-label" i18n="stat_total">Total Items</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${pending}</div>
                <div class="stat-label" i18n="stat_pending">Pending</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${fulfilled}</div>
                <div class="stat-label" i18n="stat_fulfilled">Fulfilled</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$${totalPendingPrice.toLocaleString()}</div>
                <div class="stat-label" i18n="stat_total_price">Total Price</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${highPriority}</div>
                <div class="stat-label" i18n="stat_high_priority">High Priority</div>
            </div>
        `;

        document.getElementById('wishlistStats').innerHTML = statsHtml;
    }

    // Filter and sort wishlist items
    filterItems() {
        const filtered = this.wishlistData.filter(item => {
            switch (this.currentFilter) {
                case 'all':
                    return true;
                case 'pending':
                    return !item.fulfilled;
                case 'fulfilled':
                    return item.fulfilled;
                case 'high':
                    return item.priority === 'high';
                default:
                    return true;
            }
        });

        // Sort by: 1. Fulfilled status (pending first), 2. Priority (high > medium > low), 3. Alphabetically by title
        return filtered.sort((a, b) => {
            // First sort by fulfilled status (pending items first)
            if (a.fulfilled !== b.fulfilled) {
                return a.fulfilled ? 1 : -1;
            }

            // Then sort by priority
            const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
            const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
            if (priorityDiff !== 0) {
                return priorityDiff;
            }

            // Finally sort alphabetically by title
            return a.title.localeCompare(b.title);
        });
    }

    // Render wishlist items
    renderWishlist() {
        const filteredItems = this.filterItems();
        const grid = document.getElementById('wishlistGrid');
        const noItems = document.getElementById('noItems');

        if (filteredItems.length === 0) {
            grid.style.display = 'none';
            noItems.style.display = 'block';
            return;
        }

        grid.style.display = 'grid';
        noItems.style.display = 'none';

        const itemsHtml = filteredItems.map(item => `
            <div class="wishlist-item ${item.fulfilled ? 'fulfilled' : ''}">
                <div class="item-header">
                    <h3 class="item-title">${this.escapeHtml(item.title)}</h3>
                    <div class="item-status">
                        <span class="priority-badge priority-${item.priority}">${item.priority}</span>
                        ${item.fulfilled ? '<span class="fulfilled-badge"><i class="material-icons" style="font-size: 0.8rem;">check</i>Done</span>' : ''}
                    </div>
                </div>
                <p class="item-description">${this.escapeHtml(item.description)}</p>
                <div class="item-details">
                    <span class="item-price">${this.escapeHtml(item.price)}</span>
                </div>
                <div class="item-footer">
                    <span class="item-date">Added: ${this.formatDate(item.added_date)}</span>
                    ${item.link ? `<a href="${this.escapeHtml(item.link)}" target="_blank" class="item-link">
                        <i class="material-icons" style="font-size: 1rem;">open_in_new</i>
                        View
                    </a>` : ''}
                </div>
            </div>
        `).join('');

        grid.innerHTML = itemsHtml;
    }

    // Setup event listeners
    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-button').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-button').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderWishlist();
            });
        });
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }
}

// Initialize wishlist manager
const wishlistManager = new WishlistManager();
