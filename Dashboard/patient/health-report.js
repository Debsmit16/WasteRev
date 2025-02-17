import AIHealthAdvisor from './ai-health-advisor.js';

class HealthReport {
    constructor() {
        this.setupEventListeners();
        console.log('HealthReport initialized');
    }

    setupEventListeners() {
        const generateBtn = document.querySelector('.generate-report-btn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                console.log('Generate button clicked');
                this.generateReport();
            });
        } else {
            console.error('Generate report button not found');
        }

        // Add modal close handlers
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('healthReportModal').style.display = 'none';
            });
        });
    }

    async generateReport() {
        try {
            console.log('Generating report...');
            const healthMetrics = this.gatherHealthMetrics();
            const aqiData = this.getAQIData();
            const symptoms = this.getRecentSymptoms();

            console.log('Gathered data:', { healthMetrics, aqiData, symptoms });

            // Simplified direct analysis without API call
            const report = {
                summary: this.generateSummary(healthMetrics, aqiData),
                risks: this.assessRisks(healthMetrics, aqiData),
                recommendations: this.generateRecommendations(healthMetrics, aqiData),
                lifestyle: {
                    exercise: this.getExerciseRecommendations(healthMetrics, aqiData),
                    diet: this.getDietaryRecommendations(healthMetrics),
                    sleep: this.getSleepRecommendations(healthMetrics)
                },
                urgentCare: this.checkUrgentCare(healthMetrics)
            };

            console.log('Generated report:', report);
            this.displayEnhancedReport(report);
            
        } catch (error) {
            console.error('Error generating report:', error);
            this.showError('Failed to generate health report: ' + error.message);
        }
    }

    gatherHealthMetrics() {
        return {
            respiratory: {
                value: parseFloat(document.querySelector('.health-card[data-type="respiratory"] .value').textContent),
                trend: document.querySelector('.health-card[data-type="respiratory"] .trend').textContent
            },
            heart: {
                value: parseFloat(document.querySelector('.health-card[data-type="heart"] .value').textContent),
                trend: document.querySelector('.health-card[data-type="heart"] .trend').textContent
            },
            oxygen: {
                value: parseFloat(document.querySelector('.health-card[data-type="oxygen"] .value').textContent),
                trend: document.querySelector('.health-card[data-type="oxygen"] .trend').textContent
            },
            temperature: {
                value: parseFloat(document.querySelector('.health-card[data-type="temperature"] .value').textContent),
                trend: document.querySelector('.health-card[data-type="temperature"] .trend').textContent
            }
        };
    }

    getAQIData() {
        return {
            aqi: parseInt(document.querySelector('.aqi-value .value').textContent),
            pollutants: {
                pm25: document.querySelector('.pollutant:nth-child(1) .value').textContent,
                pm10: document.querySelector('.pollutant:nth-child(2) .value').textContent
            }
        };
    }

    getRecentSymptoms() {
        const symptoms = [];
        document.querySelectorAll('.symptom-entry').forEach(entry => {
            symptoms.push({
                type: entry.querySelector('h4').textContent,
                severity: parseInt(entry.querySelector('p').textContent.match(/\d+/)[0]),
                timestamp: entry.querySelector('.timestamp').textContent
            });
        });
        return symptoms;
    }

    analyzeData(healthMetrics, aqiData) {
        const report = {
            summary: this.generateSummary(healthMetrics, aqiData),
            risks: this.assessRisks(healthMetrics, aqiData),
            recommendations: this.generateRecommendations(healthMetrics, aqiData),
            lifestyle: this.getLifestyleSuggestions(healthMetrics, aqiData),
            medications: this.getMedicationSuggestions(healthMetrics),
            urgentCare: this.checkUrgentCare(healthMetrics)
        };

        return report;
    }

    generateSummary(metrics, aqi) {
        let summary = "Health Status Summary:\n";
        
        // Analyze respiratory health
        if (metrics.respiratory.value > 20) {
            summary += "⚠️ Elevated respiratory rate indicates potential respiratory stress.\n";
        }

        // Analyze heart rate
        if (metrics.heart.value > 100) {
            summary += "⚠️ Elevated heart rate detected.\n";
        }

        // Analyze oxygen levels
        if (metrics.oxygen.value < 95) {
            summary += "⚠️ Oxygen levels are below optimal range.\n";
        }

        // Analyze air quality impact
        if (aqi.aqi > 100) {
            summary += "⚠️ Poor air quality may be affecting your health.\n";
        }

        return summary;
    }

    assessRisks(metrics, aqi) {
        const risks = [];

        // Respiratory risks
        if (metrics.respiratory.value > 20 && aqi.aqi > 100) {
            risks.push({
                level: 'High',
                type: 'Respiratory',
                description: 'High risk of respiratory issues due to elevated breathing rate and poor air quality'
            });
        }

        // Cardiovascular risks
        if (metrics.heart.value > 100 || metrics.oxygen.value < 95) {
            risks.push({
                level: 'Moderate',
                type: 'Cardiovascular',
                description: 'Potential cardiovascular strain detected'
            });
        }

        return risks;
    }

    generateRecommendations(metrics, aqi) {
        const recommendations = [];

        // Air quality recommendations
        if (aqi.aqi > 100) {
            recommendations.push({
                category: 'Environment',
                items: [
                    'Use air purifiers indoors',
                    'Keep windows closed during high pollution hours',
                    'Wear N95 mask when outdoors'
                ]
            });
        }

        // Health recommendations
        if (metrics.respiratory.value > 20 || metrics.oxygen.value < 95) {
            recommendations.push({
                category: 'Breathing',
                items: [
                    'Practice deep breathing exercises',
                    'Consider using a pulse oximeter for monitoring',
                    'Schedule a pulmonologist consultation'
                ]
            });
        }

        return recommendations;
    }

    getLifestyleSuggestions(metrics, aqi) {
        return {
            exercise: this.getExerciseRecommendations(metrics, aqi),
            diet: this.getDietaryRecommendations(metrics),
            sleep: this.getSleepRecommendations(metrics)
        };
    }

    getExerciseRecommendations(metrics, aqi) {
        if (aqi.aqi > 150) {
            return 'Indoor exercises recommended. Avoid outdoor activities.';
        } else if (metrics.heart.value > 100) {
            return 'Light exercises recommended. Monitor heart rate during activity.';
        }
        return 'Regular moderate exercise is safe. Maintain 30 minutes daily activity.';
    }

    getDietaryRecommendations(metrics) {
        const recommendations = [];
        
        if (metrics.heart.value > 100) {
            recommendations.push('Reduce sodium intake');
            recommendations.push('Increase potassium-rich foods');
        }
        
        if (metrics.oxygen.value < 95) {
            recommendations.push('Iron-rich foods recommended');
            recommendations.push('Consider vitamin C supplements');
        }

        return recommendations;
    }

    getSleepRecommendations(metrics) {
        return {
            duration: '7-9 hours',
            position: metrics.respiratory.value > 20 ? 'Elevated head position recommended' : 'Normal',
            environment: 'Keep room well-ventilated'
        };
    }

    getMedicationSuggestions(metrics) {
        const suggestions = [];

        if (metrics.respiratory.value > 20) {
            suggestions.push({
                type: 'Bronchodilator',
                timing: 'As prescribed',
                note: 'Consult doctor if symptoms persist'
            });
        }

        return suggestions;
    }

    checkUrgentCare(metrics) {
        const urgentConditions = [];

        if (metrics.oxygen.value < 90) {
            urgentConditions.push({
                condition: 'Low Oxygen Saturation',
                action: 'Seek immediate medical attention'
            });
        }

        if (metrics.heart.value > 120 || metrics.heart.value < 50) {
            urgentConditions.push({
                condition: 'Abnormal Heart Rate',
                action: 'Contact your healthcare provider immediately'
            });
        }

        return urgentConditions;
    }

    displayEnhancedReport(report) {
        const modal = document.getElementById('healthReportModal');
        if (!modal) {
            console.error('Health report modal not found');
            return;
        }

        const content = modal.querySelector('.report-content');
        if (!content) {
            console.error('Report content container not found');
            return;
        }

        content.innerHTML = `
            <div class="report-section summary">
                <h3>Summary</h3>
                <p>${report.summary}</p>
            </div>
            
            <div class="report-section risks">
                <h3>Risk Assessment</h3>
                ${report.risks.map(risk => `
                    <div class="risk-item ${risk.level.toLowerCase()}">
                        <span class="risk-level">${risk.level}</span>
                        <h4>${risk.type}</h4>
                        <p>${risk.description}</p>
                    </div>
                `).join('')}
            </div>

            <div class="report-section recommendations">
                <h3>Recommendations</h3>
                ${report.recommendations.map(rec => `
                    <div class="recommendation-category">
                        <h4>${rec.category}</h4>
                        <ul>
                            ${rec.items.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>

            <div class="report-section lifestyle">
                <h3>Lifestyle Suggestions</h3>
                <div class="lifestyle-grid">
                    <div class="lifestyle-item">
                        <h4>Exercise</h4>
                        <p>${report.lifestyle.exercise}</p>
                    </div>
                    <div class="lifestyle-item">
                        <h4>Diet</h4>
                        <ul>
                            ${report.lifestyle.diet.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="lifestyle-item">
                        <h4>Sleep</h4>
                        <p>Duration: ${report.lifestyle.sleep.duration}</p>
                        <p>Position: ${report.lifestyle.sleep.position}</p>
                        <p>Environment: ${report.lifestyle.sleep.environment}</p>
                    </div>
                </div>
            </div>

            ${report.urgentCare.length ? `
                <div class="report-section urgent-care alert">
                    <h3>⚠️ Urgent Care Needed</h3>
                    ${report.urgentCare.map(urgent => `
                        <div class="urgent-item">
                            <h4>${urgent.condition}</h4>
                            <p>${urgent.action}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;

        modal.style.display = 'flex';
        console.log('Report displayed successfully');
    }

    renderAIExecutiveSummary(summary) {
        return `
            <div class="ai-summary">
                ${summary.map(section => `
                    <div class="summary-section ${section.type}">
                        <h4>${section.title}</h4>
                        <ul>
                            ${section.points.map(point => `<li>${point}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderRiskPredictions(risks) {
        return `
            <div class="risk-predictions">
                ${risks.map(risk => `
                    <div class="risk-prediction-item">
                        <div class="risk-header">
                            <h5>${risk.condition}</h5>
                            <span class="risk-probability ${this.getRiskClass(risk.probability)}">
                                ${risk.probability}% Risk
                            </span>
                        </div>
                        <p class="risk-timeframe">Timeframe: ${risk.timeframe}</p>
                        <ul class="risk-actions">
                            ${risk.preventiveActions.map(action => `
                                <li>${action}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getRiskClass(probability) {
        if (probability > 70) return 'high-risk';
        if (probability > 40) return 'medium-risk';
        return 'low-risk';
    }

    renderActionPlan(plan) {
        return `
            <div class="action-plan">
                ${Object.entries(plan).map(([timeframe, actions]) => `
                    <div class="action-timeframe">
                        <h5>${this.formatTimeframe(timeframe)}</h5>
                        <ul>
                            ${actions.map(action => `
                                <li>
                                    <span class="action-time">${action.timeframe}</span>
                                    <ul>
                                        ${action.actions.map(a => `<li>${a}</li>`).join('')}
                                    </ul>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
    }

    formatTimeframe(timeframe) {
        const formats = {
            immediate: 'Immediate Actions',
            shortTerm: 'Next 24-48 Hours',
            longTerm: 'Long-term Plan',
            monitoring: 'Ongoing Monitoring'
        };
        return formats[timeframe] || timeframe;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        const healthOverview = document.querySelector('.health-overview');
        if (healthOverview) {
            healthOverview.insertBefore(errorDiv, healthOverview.firstChild);
            setTimeout(() => errorDiv.remove(), 5000);
        } else {
            console.error('Health overview section not found');
            alert(message);
        }
    }
}

// Initialize after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    window.healthReport = new HealthReport();
    console.log('Health Report module loaded');
});

export default HealthReport;
