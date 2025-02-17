import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

router.post('/analyze', async (req, res) => {
    try {
        const { healthMetrics, aqiData, symptoms } = req.body;

        const prompt = `Analyze these health metrics and provide medical recommendations:
            Vital Signs:
            - Respiratory Rate: ${healthMetrics.respiratory.value} (${healthMetrics.respiratory.trend})
            - Heart Rate: ${healthMetrics.heart.value} (${healthMetrics.heart.trend})
            - Oxygen Level: ${healthMetrics.oxygen.value} (${healthMetrics.oxygen.trend})
            - Temperature: ${healthMetrics.temperature.value}°C

            Air Quality Index: ${aqiData.aqi}
            Symptoms: ${JSON.stringify(symptoms)}

            Please provide:
            1. Overall health assessment
            2. Risk analysis
            3. Recommendations
            4. Urgent actions if needed`;

        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-chat",
                messages: [
                    {
                        role: "system",
                        content: "You are a medical AI assistant analyzing health data."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('Failed to get AI analysis');
        }

        const analysis = await response.json();
        
        // Format the response for our frontend
        const formattedResponse = {
            summary: [{
                type: 'status',
                title: 'Health Analysis',
                points: analysis.choices[0].message.content.split('\n').filter(line => line.trim())
            }],
            detailedReport: {
                riskPrediction: extractRisks(analysis.choices[0].message.content),
                lifestyleRecommendations: extractRecommendations(analysis.choices[0].message.content)
            },
            actionPlan: {
                immediate: extractUrgentActions(analysis.choices[0].message.content)
            }
        };

        res.json(formattedResponse);

    } catch (error) {
        console.error('Health analysis error:', error);
        res.status(500).json({ 
            error: 'Failed to analyze health data',
            details: error.message
        });
    }
});

// Helper methods
const extractRisks = (content) => {
    // Basic parsing of risks from AI response
    const risks = [];
    if (content.includes('Risk')) {
        risks.push({
            condition: 'Health Risk Detected',
            probability: 70,
            timeframe: 'Immediate',
            preventiveActions: ['Consult healthcare provider', 'Monitor symptoms']
        });
    }
    return risks;
};

const extractRecommendations = (content) => {
    // Extract recommendations from AI response
    return content
        .split('\n')
        .filter(line => line.includes('recommend') || line.includes('should'))
        .map(line => line.trim());
};

const extractUrgentActions = (content) => {
    // Extract urgent actions from AI response
    const urgentSection = content.toLowerCase().includes('urgent') ? 
        [{
            timeframe: 'Immediate',
            actions: ['Seek medical attention', 'Monitor vital signs']
        }] : [];
    return urgentSection;
};

router.extractRisks = extractRisks;
router.extractRecommendations = extractRecommendations;
router.extractUrgentActions = extractUrgentActions;

export default router;
