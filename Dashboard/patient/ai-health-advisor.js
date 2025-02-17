class AIHealthAdvisor {
    constructor() {
        this.healthHistory = [];
        this.symptoms = [];
        this.vitalTrends = {};
    }

    async analyzeHealthData(healthMetrics, aqiData, symptoms = []) {
        try {
            const response = await fetch('/api/health-analysis/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    healthMetrics,
                    aqiData,
                    symptoms
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get AI analysis');
            }

            const analysis = await response.json();
            return this.formatAnalysis(analysis);

        } catch (error) {
            console.error('AI Analysis error:', error);
            // Return fallback analysis if API fails
            return this.getFallbackAnalysis(healthMetrics, aqiData, symptoms);
        }
    }

    getFallbackAnalysis(healthMetrics, aqiData, symptoms) {
        // Basic analysis based on thresholds
        const urgentCare = [];
        const recommendations = [];

        if (healthMetrics.oxygen.value < 92) {
            urgentCare.push({
                condition: 'Low Oxygen',
                action: 'Seek immediate medical attention'
            });
        }

        if (aqiData.aqi > 150) {
            recommendations.push('Stay indoors due to poor air quality');
        }

        return {
            summary: [{
                type: 'status',
                title: 'Current Status',
                points: [
                    `Oxygen: ${healthMetrics.oxygen.value}%`,
                    `Heart Rate: ${healthMetrics.heart.value} BPM`,
                    `AQI: ${aqiData.aqi}`
                ]
            }],
            detailedReport: {
                riskPrediction: [{
                    condition: 'General Health',
                    probability: 50,
                    timeframe: '24 hours',
                    preventiveActions: recommendations
                }],
                lifestyleRecommendations: ['Monitor symptoms', 'Stay hydrated']
            },
            actionPlan: {
                immediate: [{
                    timeframe: 'Now',
                    actions: urgentCare.map(uc => uc.action)
                }]
            }
        };
    }

    predictRisks(metrics, aqi) {
        const risks = [];
        const riskFactors = this.calculateRiskFactors(metrics, aqi);

        // Respiratory Risk Analysis
        if (metrics.respiratory.value > 20 || aqi.aqi > 150) {
            risks.push({
                condition: 'Respiratory Distress',
                probability: this.calculateProbability(riskFactors.respiratory),
                timeframe: 'Next 24-48 hours',
                preventiveActions: [
                    'Use air purifier',
                    'Avoid outdoor activities',
                    'Keep rescue inhaler nearby'
                ]
            });
        }

        // Cardiovascular Risk Analysis
        if (metrics.heart.value > 100 || metrics.oxygen.value < 95) {
            risks.push({
                condition: 'Cardiovascular Strain',
                probability: this.calculateProbability(riskFactors.cardiovascular),
                timeframe: 'Immediate attention needed',
                preventiveActions: [
                    'Monitor blood pressure',
                    'Reduce physical exertion',
                    'Stay hydrated'
                ]
            });
        }

        return risks;
    }

    calculateRiskFactors(metrics, aqi) {
        return {
            respiratory: {
                baseRisk: metrics.respiratory.value > 20 ? 0.4 : 0.1,
                aqiImpact: aqi.aqi > 150 ? 0.3 : 0.1,
                historicalFactor: 0.2
            },
            cardiovascular: {
                baseRisk: metrics.heart.value > 100 ? 0.5 : 0.2,
                oxygenImpact: metrics.oxygen.value < 95 ? 0.3 : 0.1,
                aqiImpact: aqi.aqi > 150 ? 0.2 : 0.1
            }
        };
    }

    calculateProbability(factors) {
        const total = Object.values(factors).reduce((sum, val) => sum + val, 0);
        return Math.min(Math.round(total * 100), 100);
    }

    generatePersonalizedAdvice(metrics, aqi, symptoms) {
        const advice = [];
        const context = this.analyzeContext(metrics, aqi, symptoms);

        if (context.isHighRisk) {
            advice.push({
                priority: 'High',
                timeframe: 'Immediate',
                actions: this.getHighRiskAdvice(context)
            });
        }

        advice.push({
            priority: 'Medium',
            timeframe: 'Next 24 hours',
            actions: this.getMediumTermAdvice(context)
        });

        advice.push({
            priority: 'Long-term',
            timeframe: '1-4 weeks',
            actions: this.getLongTermAdvice(context)
        });

        return advice;
    }

    analyzeContext(metrics, aqi, symptoms) {
        return {
            isHighRisk: this.isHighRiskCondition(metrics),
            hasRespiratorySymptoms: symptoms.some(s => 
                ['cough', 'shortness_of_breath', 'wheezing'].includes(s.type)
            ),
            hasCardiacSymptoms: symptoms.some(s => 
                ['chest_pain', 'palpitations'].includes(s.type)
            ),
            environmentalRisk: aqi.aqi > 150,
            vitalStability: this.checkVitalStability(metrics)
        };
    }

    isHighRiskCondition(metrics) {
        return metrics.oxygen.value < 92 || 
               metrics.heart.value > 120 || 
               metrics.respiratory.value > 25;
    }

    checkVitalStability(metrics) {
        return {
            isStable: metrics.heart.trend === 'stable' && 
                     metrics.respiratory.trend === 'stable',
            hasImproved: metrics.oxygen.trend === 'up',
            needsMonitoring: metrics.temperature.value > 37.5
        };
    }

    getHighRiskAdvice(context) {
        const advice = [];
        
        if (context.hasRespiratorySymptoms) {
            advice.push(
                'Use prescribed rescue medications',
                'Position yourself upright or slightly forward to ease breathing',
                'Practice pursed-lip breathing technique'
            );
        }

        if (context.hasCardiacSymptoms) {
            advice.push(
                'Take prescribed nitroglycerin if recommended by doctor',
                'Maintain a sitting or semi-reclined position',
                'Avoid any physical exertion'
            );
        }

        return advice;
    }

    getMediumTermAdvice(context) {
        const advice = [];

        if (context.environmentalRisk) {
            advice.push(
                'Set up a clean air zone in your home',
                'Use air quality alerts on your phone',
                'Plan indoor activities for high pollution days'
            );
        }

        if (!context.vitalStability.isStable) {
            advice.push(
                'Monitor vitals every 4 hours',
                'Keep a symptoms diary',
                'Prepare for teleconsultation if no improvement'
            );
        }

        return advice;
    }

    getLongTermAdvice(context) {
        return [
            'Schedule a follow-up appointment',
            'Update your action plan with healthcare provider',
            'Review and adjust medication schedule if needed',
            'Consider pulmonary rehabilitation program'
        ];
    }

    suggestPreventiveMeasures(metrics, aqi) {
        return {
            daily: [
                'Monitor peak flow readings',
                'Track medication effectiveness',
                'Record any triggers or symptoms'
            ],
            weekly: [
                'Review symptom patterns',
                'Check medication supplies',
                'Clean air purifier filters'
            ],
            monthly: [
                'Schedule regular check-ups',
                'Update emergency action plan',
                'Review and restock emergency medications'
            ]
        };
    }

    getLifestyleRecommendations(metrics, aqi) {
        return {
            exercise: this.getExerciseRecommendations(metrics, aqi),
            diet: this.getDietaryRecommendations(metrics),
            sleep: this.getSleepRecommendations(metrics),
            stressManagement: this.getStressManagementTips(metrics)
        };
    }

    getExerciseRecommendations(metrics, aqi) {
        const intensity = this.calculateSafeExerciseIntensity(metrics, aqi);
        return {
            type: this.getSuitableExerciseTypes(intensity),
            duration: this.getRecommendedDuration(intensity),
            precautions: this.getExercisePrecautions(metrics, aqi),
            schedule: this.createExerciseSchedule(intensity)
        };
    }

    calculateSafeExerciseIntensity(metrics, aqi) {
        // Implementation of exercise intensity calculation
        let baseIntensity = 100;
        
        // Reduce intensity based on metrics
        if (metrics.oxygen.value < 95) baseIntensity *= 0.7;
        if (metrics.heart.value > 100) baseIntensity *= 0.8;
        if (aqi.aqi > 150) baseIntensity *= 0.6;

        return Math.max(30, Math.min(baseIntensity, 100));
    }

    formatAnalysis(analysis) {
        return {
            summary: this.createExecutiveSummary(analysis),
            detailedReport: analysis,
            visualData: this.generateVisualRepresentation(analysis),
            actionPlan: this.createActionPlan(analysis)
        };
    }

    createExecutiveSummary(analysis) {
        const summary = [];
        
        // Add urgent care warnings
        if (analysis.urgentCare.length > 0) {
            summary.push({
                type: 'urgent',
                title: '⚠️ Urgent Care Required',
                points: analysis.urgentCare.map(uc => uc.condition)
            });
        }

        // Add high-priority risks
        const highRisks = analysis.riskPrediction.filter(r => r.probability > 70);
        if (highRisks.length > 0) {
            summary.push({
                type: 'high-risk',
                title: '🔔 High Risk Conditions',
                points: highRisks.map(r => `${r.condition} (${r.probability}% risk)`)
            });
        }

        // Add immediate actions
        const immediateAdvice = analysis.personalizedAdvice
            .find(a => a.priority === 'High')?.actions || [];
        if (immediateAdvice.length > 0) {
            summary.push({
                type: 'immediate-action',
                title: '⚡ Immediate Actions Required',
                points: immediateAdvice
            });
        }

        return summary;
    }

    createActionPlan(analysis) {
        return {
            immediate: this.getImmediateActions(analysis),
            shortTerm: this.getShortTermActions(analysis),
            longTerm: this.getLongTermActions(analysis),
            monitoring: this.getMonitoringPlan(analysis)
        };
    }

    getImmediateActions(analysis) {
        const actions = [];
        
        // Add urgent care actions
        if (analysis.urgentCare.length > 0) {
            actions.push({
                timeframe: 'Now',
                actions: analysis.urgentCare.map(uc => uc.action)
            });
        }

        // Add high-priority advice
        const highPriorityAdvice = analysis.personalizedAdvice
            .find(a => a.priority === 'High');
        if (highPriorityAdvice) {
            actions.push({
                timeframe: 'Within 2 hours',
                actions: highPriorityAdvice.actions
            });
        }

        return actions;
    }
}

// Make it available both as module and global
window.AIHealthAdvisor = AIHealthAdvisor;
export default AIHealthAdvisor;
