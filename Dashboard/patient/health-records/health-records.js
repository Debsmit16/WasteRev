class HealthRecords {
    constructor() {
        this.records = [];
        this.categories = {
            'prescriptions': 'Prescriptions',
            'lab-reports': 'Lab Reports',
            'scans': 'Scans & X-Rays',
            'discharge': 'Discharge Summaries',
            'others': 'Other Documents'
        };
        this.currentPage = 1;
        this.recordsPerPage = 9;
        this.stats = {
            totalRecords: 0,
            lastUpload: null,
            categories: new Set()
        };
        this.currentView = 'grid';
        this.scannerActive = false;
        this.init();
    }

    init() {
        this.loadRecords();
        this.setupEventListeners();
        this.setupViewerModal();
        this.setupShareModal();
        this.setupPagination();
        this.updateStats();
        this.setupViewToggle();
        this.setupQuickActions();
        this.setupReturnNavigation();
    }

    setupEventListeners() {
        // Upload button handler
        document.getElementById('uploadRecord').addEventListener('click', () => {
            this.showUploadModal();
        });

        // Category filter handler
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.filterRecords(e.target.value);
        });

        // Search handler
        document.getElementById('searchRecords').addEventListener('input', (e) => {
            this.searchRecords(e.target.value);
        });
    }

    showUploadModal(predefinedData = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Upload Health Record</h2>
                    <span class="close-modal">&times;</span>
                </div>
                <form id="uploadForm" class="upload-form">
                    <div class="form-group">
                        <label for="recordTitle">Title</label>
                        <input type="text" id="recordTitle" required placeholder="e.g., Blood Test Report" value="${predefinedData.title || ''}">
                    </div>
                    <div class="form-group">
                        <label for="recordCategory">Category</label>
                        <select id="recordCategory" required>
                            ${Object.entries(this.categories).map(([value, label]) => 
                                `<option value="${value}">${label}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="recordDate">Date</label>
                        <input type="date" id="recordDate" required value="${predefinedData.date || new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label for="recordNotes">Notes (Optional)</label>
                        <textarea id="recordNotes" rows="3"></textarea>
                    </div>
                    <div class="upload-area">
                        <input type="file" id="recordFile" accept=".pdf,.jpg,.jpeg,.png" required>
                        <div class="drop-zone">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Drag & drop files here or click to browse</p>
                            <span class="supported-files">Supported: PDF, JPG, PNG (Max 10MB)</span>
                        </div>
                    </div>
                    <div class="upload-progress">
                        <div class="upload-progress-bar"></div>
                        <span class="upload-progress-text">0%</span>
                    </div>
                    <div class="upload-error"></div>
                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Upload Record</button>
                        <button type="button" class="btn-secondary" id="cancelUpload">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupModalHandlers(modal);

        // Show file preview when selected
        const fileInput = modal.querySelector('#recordFile');
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const dropZone = modal.querySelector('.drop-zone');
                dropZone.innerHTML = `
                    <div class="file-preview">
                        <i class="fas ${this.getFileIcon(file.type)}"></i>
                        <div class="file-info">
                            <div class="file-name">${file.name}</div>
                            <div class="file-size">${this.formatFileSize(file.size)}</div>
                        </div>
                    </div>
                `;
            }
        });

        // Pre-fill file input if predefined data is provided
        if (predefinedData.file) {
            document.getElementById('recordFile').files = predefinedData.file;
        }
    }

    setupModalHandlers(modal) {
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('#cancelUpload');
        const form = modal.querySelector('#uploadForm');
        const dropZone = modal.querySelector('.drop-zone');

        // Close handlers
        [closeBtn, cancelBtn].forEach(btn => {
            btn.addEventListener('click', () => modal.remove());
        });

        // Drag and drop handlers
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length) {
                document.getElementById('recordFile').files = files;
            }
        });

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRecordUpload(form);
            modal.remove();
        });
    }

    handleRecordUpload(form) {
        try {
            const fileInput = form.querySelector('#recordFile');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('Please select a file');
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const record = {
                    id: Date.now(),
                    title: form.querySelector('#recordTitle').value,
                    category: form.querySelector('#recordCategory').value,
                    date: form.querySelector('#recordDate').value,
                    notes: form.querySelector('#recordNotes').value,
                    file: {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: reader.result
                    },
                    uploadDate: new Date().toISOString()
                };

                // Add to records array
                this.records.push(record);
                
                // Save to localStorage
                localStorage.setItem('healthRecords', JSON.stringify(this.records));
                
                // Update UI
                this.renderRecords();
                this.updateStats();
                
                // Show success message and close modal
                alert('Record uploaded successfully!');
                form.closest('.modal').remove();
            };

            reader.onerror = () => {
                alert('Error reading file');
            };

            reader.readAsDataURL(file);
        } catch (error) {
            alert('Upload failed: ' + error.message);
        }
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    renderRecords() {
        const start = (this.currentPage - 1) * this.recordsPerPage;
        const end = start + this.recordsPerPage;
        const recordsToShow = this.records.slice(start, end);

        const container = document.querySelector('.records-grid');
        if (!container) return;

        container.innerHTML = recordsToShow.map(record => `
            <div class="record-card" data-category="${record.category}">
                <div class="record-icon">
                    <i class="fas ${this.getCategoryIcon(record.category)}"></i>
                </div>
                <div class="record-info">
                    <h3>${record.title}</h3>
                    <p class="date">${new Date(record.date).toLocaleDateString()}</p>
                    ${record.notes ? `<p class="notes">${record.notes}</p>` : ''}
                </div>
                <div class="record-actions">
                    <button class="view-record" data-id="${record.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="download-record" data-id="${record.id}">
                        <i class="fas fa-download"></i>
                    </button>
                    <button class="delete-record" data-id="${record.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        this.setupRecordActions();
    }

    getCategoryIcon(category) {
        const icons = {
            'prescriptions': 'fa-prescription',
            'lab-reports': 'fa-flask',
            'scans': 'fa-x-ray',
            'discharge': 'fa-file-medical',
            'others': 'fa-folder-open'
        };
        return icons[category] || 'fa-file-medical';
    }

    setupRecordActions() {
        document.querySelectorAll('.view-record').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recordId = e.currentTarget.dataset.id;
                this.viewRecord(recordId);
            });
        });

        document.querySelectorAll('.delete-record').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recordId = e.currentTarget.dataset.id;
                this.deleteRecord(recordId);
            });
        });
    }

    filterRecords(category) {
        const records = document.querySelectorAll('.record-card');
        records.forEach(record => {
            if (category === 'all' || record.dataset.category === category) {
                record.style.display = 'flex';
            } else {
                record.style.display = 'none';
            }
        });
    }

    searchRecords(query) {
        const records = document.querySelectorAll('.record-card');
        records.forEach(record => {
            const title = record.querySelector('h3').textContent.toLowerCase();
            const notes = record.querySelector('.notes')?.textContent.toLowerCase() || '';
            if (title.includes(query.toLowerCase()) || notes.includes(query.toLowerCase())) {
                record.style.display = 'flex';
            } else {
                record.style.display = 'none';
            }
        });
    }

    loadRecords() {
        const saved = localStorage.getItem('healthRecords');
        this.records = saved ? JSON.parse(saved) : [];
        this.renderRecords();
    }

    saveRecords() {
        localStorage.setItem('healthRecords', JSON.stringify(this.records));
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    setupViewerModal() {
        const modal = document.getElementById('recordViewerModal');
        if (!modal) return;

        // Close modal handler
        modal.querySelector('.close-modal').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Download handler
        modal.querySelector('.download-btn').addEventListener('click', (e) => {
            const recordId = e.target.closest('.modal').dataset.recordId;
            this.downloadRecord(recordId);
        });

        // Share handler
        modal.querySelector('.share-btn').addEventListener('click', (e) => {
            const recordId = e.target.closest('.modal').dataset.recordId;
            this.showShareModal(recordId);
        });
    }

    async viewRecord(recordId) {
        const record = this.records.find(r => r.id === parseInt(recordId));
        if (!record) return;

        const modal = document.getElementById('recordViewerModal');
        modal.dataset.recordId = recordId;

        // Update modal content
        modal.querySelector('.record-title').textContent = record.title;
        modal.querySelector('.record-date').textContent = new Date(record.date).toLocaleDateString();
        modal.querySelector('.record-category').textContent = this.categories[record.category];
        modal.querySelector('.notes-content').textContent = record.notes || 'No notes available';

        // Preview file based on type
        const preview = modal.querySelector('.record-preview');
        if (record.file.type.startsWith('image/')) {
            preview.innerHTML = `<img src="${record.file.data}" alt="${record.title}">`;
        } else if (record.file.type === 'application/pdf') {
            preview.innerHTML = `<embed src="${record.file.data}" type="application/pdf" width="100%" height="600px">`;
        } else {
            preview.innerHTML = `<div class="file-icon"><i class="fas fa-file"></i>${record.file.name}</div>`;
        }

        modal.style.display = 'flex';
    }

    async downloadRecord(recordId) {
        const record = this.records.find(r => r.id === parseInt(recordId));
        if (!record) return;

        try {
            const a = document.createElement('a');
            a.href = record.file.data;
            a.download = record.file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (error) {
            this.showNotification('Failed to download file', 'error');
        }
    }

    showShareModal(recordId) {
        const modal = document.getElementById('shareRecordModal');
        modal.dataset.recordId = recordId;
        modal.style.display = 'flex';

        // Populate doctors list (in real app, fetch from API)
        const doctorList = modal.querySelector('#doctorList');
        doctorList.innerHTML = `
            <option value="">Select a healthcare provider</option>
            <option value="1">Dr. John Smith</option>
            <option value="2">Dr. Sarah Johnson</option>
        `;
    }

    updateStats() {
        this.stats.totalRecords = this.records.length;
        this.stats.lastUpload = this.records.length > 0 ? 
            new Date(Math.max(...this.records.map(r => new Date(r.uploadDate)))) : null;
        this.stats.categories = new Set(this.records.map(r => r.category));

        // Update UI
        document.querySelector('.stat-value:nth-child(1)').textContent = this.stats.totalRecords;
        document.querySelector('.stat-value:nth-child(2)').textContent = 
            this.stats.lastUpload ? this.stats.lastUpload.toLocaleDateString() : 'Never';
        document.querySelector('.stat-value:nth-child(3)').textContent = this.stats.categories.size;
    }

    setupPagination() {
        const totalPages = Math.ceil(this.records.length / this.recordsPerPage);
        const pagination = document.querySelector('.pagination');
        const pageNumbers = pagination.querySelector('.page-numbers');
        
        // Clear existing page numbers
        pageNumbers.innerHTML = '';
        
        // Create page buttons with smart pagination
        const pages = this.getPageNumbers(this.currentPage, totalPages);
        
        pages.forEach(page => {
            if (page === '...') {
                const span = document.createElement('span');
                span.className = 'page-ellipsis';
                span.textContent = '...';
                pageNumbers.appendChild(span);
            } else {
                const button = document.createElement('button');
                button.textContent = page;
                button.classList.toggle('active', page === this.currentPage);
                
                if (typeof page === 'number') {
                    button.addEventListener('click', () => this.goToPage(page));
                }
                
                pageNumbers.appendChild(button);
            }
        });

        // Update prev/next buttons
        const prevBtn = pagination.querySelector('.prev-page');
        const nextBtn = pagination.querySelector('.next-page');
        
        prevBtn.disabled = this.currentPage === 1;
        nextBtn.disabled = this.currentPage === totalPages;
        
        // Add event listeners for prev/next
        prevBtn.onclick = () => this.currentPage > 1 && this.goToPage(this.currentPage - 1);
        nextBtn.onclick = () => this.currentPage < totalPages && this.goToPage(this.currentPage + 1);
        
        // Add keyboard navigation
        this.setupKeyboardNavigation(totalPages);
    }

    getPageNumbers(current, total) {
        const pages = [];
        
        if (total <= 7) {
            // Show all pages if total is 7 or less
            for (let i = 1; i <= total; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);
            
            if (current > 3) {
                pages.push('...');
            }
            
            // Show pages around current page
            for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
                pages.push(i);
            }
            
            if (current < total - 2) {
                pages.push('...');
            }
            
            // Always show last page
            pages.push(total);
        }
        
        return pages;
    }

    setupKeyboardNavigation(totalPages) {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && this.currentPage > 1) {
                this.goToPage(this.currentPage - 1);
            } else if (e.key === 'ArrowRight' && this.currentPage < totalPages) {
                this.goToPage(this.currentPage + 1);
            }
        });
    }

    goToPage(page) {
        if (page === this.currentPage) return;
        
        // Add animation class to records grid
        const container = document.querySelector('.records-grid');
        container.style.opacity = '0';
        
        setTimeout(() => {
            this.currentPage = page;
            this.renderRecords();
            this.setupPagination();
            container.style.opacity = '1';
        }, 300);
        
        // Scroll to top of records
        container.scrollIntoView({ behavior: 'smooth' });
    }

    setupQuickActions() {
        document.querySelector('.scan-document').addEventListener('click', () => this.startDocumentScanner());
        document.querySelector('.import-records').addEventListener('click', () => this.showImportModal());
        document.querySelector('.generate-summary').addEventListener('click', () => this.generateHealthSummary());
        document.querySelector('.request-records').addEventListener('click', () => this.showRequestModal());
    }

    setupViewToggle() {
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.switchView(view);
                document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    switchView(view) {
        this.currentView = view;
        const container = document.querySelector('.records-grid');
        container.className = view === 'grid' ? 'records-grid' : 'timeline-view';
        this.renderRecords();
    }

    startDocumentScanner() {
        if (!this.scannerActive) {
            // Create scanner UI
            const scannerUI = document.createElement('div');
            scannerUI.className = 'scanner-overlay';
            scannerUI.innerHTML = `
                <div class="scanner-container">
                    <video id="scanner-preview"></video>
                    <div class="scanner-frame"></div>
                    <div class="scanner-actions">
                        <button class="capture-btn">Capture</button>
                        <button class="cancel-btn">Cancel</button>
                    </div>
                </div>
            `;
            document.body.appendChild(scannerUI);

            // Initialize camera
            this.initializeCamera();
        }
    }

    async initializeCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            const video = document.getElementById('scanner-preview');
            video.srcObject = stream;
            video.play();
            this.scannerActive = true;

            // Add capture handler
            document.querySelector('.capture-btn').addEventListener('click', () => {
                this.captureDocument(video);
            });

            // Add cancel handler
            document.querySelector('.cancel-btn').addEventListener('click', () => {
                this.stopScanner();
            });
        } catch (error) {
            console.error('Camera access error:', error);
            this.showNotification('Camera access denied', 'error');
        }
    }

    captureDocument(video) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        
        // Convert to file
        canvas.toBlob(blob => {
            const file = new File([blob], 'scanned-document.jpg', { type: 'image/jpeg' });
            this.handleScannedDocument(file);
        }, 'image/jpeg');

        this.stopScanner();
    }

    stopScanner() {
        const scanner = document.querySelector('.scanner-overlay');
        if (scanner) {
            const video = scanner.querySelector('video');
            const stream = video.srcObject;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            scanner.remove();
            this.scannerActive = false;
        }
    }

    handleScannedDocument(file) {
        this.showUploadModal({
            title: 'Scanned Document',
            file: file,
            date: new Date().toISOString().split('T')[0]
        });
    }

    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return 'fa-file-image';
        if (fileType === 'application/pdf') return 'fa-file-pdf';
        return 'fa-file';
    }

    formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    setupReturnNavigation() {
        const returnBtn = document.getElementById('returnToDashboard');
        if (returnBtn) {
            returnBtn.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Check if there are unsaved changes
                if (this.hasUnsavedChanges()) {
                    if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                        window.location.href = returnBtn.href;
                    }
                } else {
                    window.location.href = returnBtn.href;
                }
            });
        }
    }

    hasUnsavedChanges() {
        // Implement your logic to check for unsaved changes
        return false;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.healthRecords = new HealthRecords();
});
