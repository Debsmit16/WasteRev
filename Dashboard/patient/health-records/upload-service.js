class UploadService {
    constructor() {
        this.uploadQueue = [];
        this.isUploading = false;
    }

    async uploadDocument(file, metadata) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async () => {
                try {
                    // Simulate server upload with progress
                    const progress = this.simulateUploadProgress();
                    
                    // Store in localStorage (in production, this would be a server upload)
                    const documentData = {
                        id: Date.now(),
                        file: {
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            data: reader.result
                        },
                        metadata: {
                            ...metadata,
                            uploadDate: new Date().toISOString()
                        }
                    };

                    // Wait for progress simulation
                    await progress;

                    // Save to localStorage
                    this.saveToStorage(documentData);
                    resolve(documentData);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('File reading failed'));
            reader.readAsDataURL(file);
        });
    }

    simulateUploadProgress() {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 30;
                if (progress >= 100) {
                    clearInterval(interval);
                    this.updateProgress(100);
                    resolve();
                } else {
                    this.updateProgress(Math.min(progress, 99));
                }
            }, 500);
        });
    }

    updateProgress(percentage) {
        const progressBar = document.querySelector('.upload-progress-bar');
        const progressText = document.querySelector('.upload-progress-text');
        
        if (progressBar && progressText) {
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${Math.round(percentage)}%`;
        }
    }

    saveToStorage(documentData) {
        const records = JSON.parse(localStorage.getItem('healthRecords') || '[]');
        records.push(documentData);
        localStorage.setItem('healthRecords', JSON.stringify(records));
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

        if (!allowedTypes.includes(file.type)) {
            throw new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.');
        }

        if (file.size > maxSize) {
            throw new Error('File size exceeds 10MB limit.');
        }

        return true;
    }
}

export default UploadService;
