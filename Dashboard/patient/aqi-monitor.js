// IQAir API for air quality data
const API_KEY = 'be7a42ea-08d7-4791-82f0-20e244575e2e'; // Updated API key
const BASE_URL = 'https://api.airvisual.com/v2';

class AQIMonitor {
    constructor() {
        this.init();
        // Add debug logging
        console.log('AQI Monitor initialized');
    }

    async init() {
        try {
            // Show loading state
            this.showLoading();
            
            const location = await this.getCurrentLocation();
            console.log('Location obtained:', location);

            const data = await this.getAirQuality(location.lat, location.lon);
            console.log('AQI Data received:', data);

            this.updateUI(data);
            this.setupRefreshButton();
            this.startAutoRefresh();

            // Hide loading state
            this.hideLoading();
        } catch (error) {
            console.error('Initialization error:', error);
            this.handleError(error);
        }
    }

    showLoading() {
        const elements = [
            '.aqi-value .value',
            '.location-text',
            '.aqi-info .status',
            '.aqi-info .description'
        ];
        
        elements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.innerHTML = '<span class="loading-placeholder">Loading...</span>';
            }
        });
    }

    hideLoading() {
        document.querySelectorAll('.loading-placeholder').forEach(el => el.remove());
    }

    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                },
                (error) => {
                    reject(error);
                    // Fallback to default location (New York)
                    resolve({ lat: 40.7128, lon: -74.0060 });
                }
            );
        });
    }

    async getAirQuality(lat, lon) {
        try {
            const response = await fetch(
                `${BASE_URL}/nearest_city?lat=${lat}&lon=${lon}&key=${API_KEY}`
            );
            
            if (!response.ok) {
                throw new Error('Air quality data fetch failed');
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching air quality:', error);
            throw error;
        }
    }

    updateUI(data) {
        try {
            console.log('Updating UI with data:', data);

            if (!data || !data.current) {
                throw new Error('Invalid data format');
            }

            const aqi = data.current.pollution.aqius;
            const temp = data.current.weather.tp;
            const humidity = data.current.weather.hu;

            // Debug element existence
            const elements = {
                aqiValue: document.querySelector('.aqi-value .value'),
                location: document.querySelector('.location-text'),
                status: document.querySelector('.aqi-info .status'),
                description: document.querySelector('.aqi-info .description')
            };

            console.log('UI Elements found:', elements);

            // Update values with null checks
            if (elements.aqiValue) elements.aqiValue.textContent = aqi;
            if (elements.location) elements.location.textContent = `${data.city}, ${data.country}`;

            // Update status and recommendations
            this.updateAQIStatus(aqi);

            // Update pollutants with more detailed error handling
            const pollutants = {
                'PM2.5': data.current.pollution.mainus === 'p2' ? data.current.pollution.aqius : '--',
                'PM10': data.current.pollution.mainus === 'p1' ? data.current.pollution.aqius : '--',
                'Temperature': `${temp}°C`,
                'Humidity': `${humidity}%`
            };

            Object.entries(pollutants).forEach(([key, value], index) => {
                const pollutantElement = document.querySelector(`.pollutant:nth-child(${index + 1})`);
                if (pollutantElement) {
                    const nameEl = pollutantElement.querySelector('.name');
                    const valueEl = pollutantElement.querySelector('.value');
                    
                    if (nameEl) nameEl.textContent = key;
                    if (valueEl) valueEl.textContent = value;
                }
            });

            // Update timestamp
            const timestampEl = document.querySelector('.last-updated');
            if (timestampEl) {
                timestampEl.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
            }

            console.log('UI update completed successfully');
        } catch (error) {
            console.error('Error updating UI:', error);
            this.handleError(error);
        }
    }

    updateAQIStatus(aqi) {
        const { status, description, recommendations } = this.getAQIInfo(aqi);
        
        const statusElement = document.querySelector('.aqi-info .status');
        const descElement = document.querySelector('.aqi-info .description');
        
        statusElement.className = `status ${status.toLowerCase()}`;
        statusElement.textContent = status;
        descElement.textContent = description;

        // Update recommendations
        const recommendationList = document.querySelector('.recommendation-list');
        recommendationList.innerHTML = recommendations
            .map(rec => `<li>${rec}</li>`)
            .join('');
    }

    getAQIInfo(aqi) {
        if (aqi <= 50) {
            return {
                status: 'Good',
                description: 'Air quality is satisfactory',
                recommendations: [
                    'Enjoy outdoor activities',
                    'Open windows to ventilate',
                    'Perfect for outdoor exercise'
                ]
            };
        } else if (aqi <= 100) {
            return {
                status: 'Moderate',
                description: 'Air quality is acceptable',
                recommendations: [
                    'Consider reducing prolonged outdoor activities',
                    'Keep monitoring air quality',
                    'Close windows during peak pollution hours'
                ]
            };
        } else if (aqi <= 150) {
            return {
                status: 'Unhealthy',
                description: 'Members of sensitive groups may experience health effects',
                recommendations: [
                    'Wear a mask outdoors',
                    'Run air purifiers indoors',
                    'Avoid prolonged outdoor activities'
                ]
            };
        } else {
            return {
                status: 'Very Unhealthy',
                description: 'Health warnings of emergency conditions',
                recommendations: [
                    'Stay indoors',
                    'Wear N95 masks if going outside',
                    'Seek medical attention if experiencing symptoms',
                    'Keep all windows closed'
                ]
            };
        }
    }

    setupRefreshButton() {
        const refreshBtn = document.querySelector('.refresh-btn');
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.classList.add('rotating');
            try {
                const location = await this.getCurrentLocation();
                const data = await this.getAirQuality(location.lat, location.lon);
                this.updateUI(data);
            } catch (error) {
                this.handleError(error);
            } finally {
                setTimeout(() => refreshBtn.classList.remove('rotating'), 1000);
            }
        });
    }

    startAutoRefresh() {
        // Refresh every 30 minutes
        setInterval(async () => {
            try {
                const location = await this.getCurrentLocation();
                const data = await this.getAirQuality(location.lat, location.lon);
                this.updateUI(data);
            } catch (error) {
                this.handleError(error);
            }
        }, 30 * 60 * 1000);
    }

    handleError(error) {
        console.error('AQI Monitor Error:', error);
        
        // Create error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'aqi-error';
        errorMsg.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>Unable to fetch air quality data. Please try again later.</span>
            </div>
            <button class="retry-btn">Retry</button>
        `;
        
        // Add retry functionality
        const retryBtn = errorMsg.querySelector('.retry-btn');
        retryBtn?.addEventListener('click', async () => {
            errorMsg.remove();
            await this.init();
        });
        
        // Show error in the card
        const card = document.querySelector('.aqi-card');
        if (card) {
            const existingError = card.querySelector('.aqi-error');
            if (existingError) {
                existingError.remove();
            }
            card.appendChild(errorMsg);
        }
    }
}

// Initialize with error handling
document.addEventListener('DOMContentLoaded', () => {
    try {
        new AQIMonitor();
    } catch (error) {
        console.error('Failed to initialize AQI Monitor:', error);
        // Show error message in the UI
        const container = document.querySelector('.air-quality-section');
        if (container) {
            container.innerHTML = `
                <div class="aqi-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to initialize air quality monitoring. Please refresh the page.</p>
                </div>
            `;
        }
    }
});
