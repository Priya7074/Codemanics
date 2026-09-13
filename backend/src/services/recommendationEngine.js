// Recommendation Engine
// This engine generates support recommendations based on assessment results

class RecommendationEngine {
  /**
   * Generate recommendations based on assessment results
   * @param {Object} assessment - Assessment data
   * @param {Array} history - Assessment history (optional)
   * @returns {Array} Support recommendations
   */
  generateRecommendations(assessment, history = []) {
    const recommendations = [];
    const { sviScore, riskLevel, indicators, safetyEscalationFlag } = assessment;

    // Urgent escalation for critical cases
    if (safetyEscalationFlag || riskLevel === 'Critical') {
      recommendations.push({
        recommendationType: 'urgent_escalation',
        priority: 'urgent',
        title: 'Immediate Safety Review Required',
        description: 'This assessment indicates potential immediate safety concerns. A trained professional should review this case urgently.',
        actionItems: [
          'Connect with authorized officer immediately',
          'Assess immediate safety needs',
          'Provide emergency contact information',
        ],
        basedOn: {
          sviScore,
          riskLevel,
          safetyEscalationFlag,
        },
      });
    }

    // Human review for high risk cases
    if (riskLevel === 'High' || riskLevel === 'Critical') {
      recommendations.push({
        recommendationType: 'human_review',
        priority: 'high',
        title: 'Professional Review Recommended',
        description: 'This assessment indicates elevated stress levels. A trained counsellor or medical professional should review this case.',
        actionItems: [
          'Schedule professional assessment',
          'Provide counselling resources',
          'Document findings for follow-up',
        ],
        basedOn: {
          sviScore,
          riskLevel,
          indicators: this.getHighIndicators(indicators),
        },
      });
    }

    // Counselling recommendation
    if (indicators.emotionalState >= 60 || indicators.distress >= 60) {
      recommendations.push({
        recommendationType: 'counselling',
        priority: riskLevel === 'High' || riskLevel === 'Critical' ? 'high' : 'medium',
        title: 'Counselling Support',
        description: 'Emotional support from a trained counsellor may be beneficial based on current emotional state.',
        actionItems: [
          'Connect with available counsellors',
          'Provide information about counselling services',
          'Offer immediate support resources',
        ],
        basedOn: {
          sviScore,
          emotionalState: indicators.emotionalState,
          distress: indicators.distress,
        },
        serviceType: 'counsellor',
        serviceName: 'Manas Mind Care',
        serviceContact: '1800 890 4040',
      });
    }

    // Legal aid recommendation
    if (indicators.threatVulnerability >= 60 || indicators.trauma >= 60) {
      recommendations.push({
        recommendationType: 'legal_aid',
        priority: 'medium',
        title: 'Legal Support Available',
        description: 'Legal assistance may be available if you are experiencing threats or legal concerns.',
        actionItems: [
          'Provide information about legal rights',
          'Connect with legal aid services',
          'Document any legal concerns',
        ],
        basedOn: {
          threatVulnerability: indicators.threatVulnerability,
          trauma: indicators.trauma,
        },
        serviceType: 'legal_aid',
        serviceName: 'Nyaya Legal Aid',
        serviceContact: '15100',
      });
    }

    // Medical assistance recommendation
    if (indicators.trauma >= 70 || riskLevel === 'Critical') {
      recommendations.push({
        recommendationType: 'medical_assistance',
        priority: riskLevel === 'Critical' ? 'urgent' : 'high',
        title: 'Medical Support',
        description: 'Medical or psychological support may be beneficial given the current assessment.',
        actionItems: [
          'Connect with medical professionals',
          'Provide information about available medical services',
          'Assess immediate medical needs',
        ],
        basedOn: {
          trauma: indicators.trauma,
          riskLevel,
        },
        serviceType: 'medical_professional',
      });
    }

    // Protection services recommendation
    if (indicators.threatVulnerability >= 70 || safetyEscalationFlag) {
      recommendations.push({
        recommendationType: 'protection_services',
        priority: 'high',
        title: 'Protection Services',
        description: 'Protection and support services are available for those experiencing threats or safety concerns.',
        actionItems: [
          'Connect with protection services',
          'Provide safety planning resources',
          'Assess immediate protection needs',
        ],
        basedOn: {
          threatVulnerability: indicators.threatVulnerability,
          safetyEscalationFlag,
        },
        serviceType: 'ngo',
        serviceName: 'Sneha Women\'s Support',
        serviceContact: '1800 102 7272',
      });
    }

    // Social isolation support
    if (indicators.socialIsolation >= 60) {
      recommendations.push({
        recommendationType: 'counselling',
        priority: 'medium',
        title: 'Social Support',
        description: 'Connecting with support services and community resources may help address feelings of isolation.',
        actionItems: [
          'Connect with support groups',
          'Provide community resources',
          'Offer peer support options',
        ],
        basedOn: {
          socialIsolation: indicators.socialIsolation,
        },
        serviceType: 'ngo',
        serviceName: 'Aasra Foundation',
        serviceContact: '1800 220 111',
      });
    }

    // Follow-up assessment recommendation
    if (history.length > 0) {
      const lastAssessment = history[history.length - 1];
      const trend = this.analyzeTrend(lastAssessment.sviScore, sviScore);
      
      if (trend.trendDirection === 'deteriorating') {
        recommendations.push({
          recommendationType: 'human_review',
          priority: 'high',
          title: 'Follow-up Assessment Recommended',
          description: 'Recent assessments show a deteriorating trend. A follow-up assessment with a professional is recommended.',
          actionItems: [
            'Schedule follow-up assessment',
            'Review contributing factors',
            'Adjust support plan accordingly',
          ],
          basedOn: {
            trend: trend.trendDirection,
            previousScore: lastAssessment.sviScore,
            currentScore: sviScore,
          },
        });
      }
    }

    // Default recommendation for low/moderate risk
    if (recommendations.length === 0) {
      recommendations.push({
        recommendationType: 'counselling',
        priority: 'low',
        title: 'General Support Available',
        description: 'Support services are available if you need someone to talk to or require assistance.',
        actionItems: [
          'Explore available support services',
          'Contact helpline for guidance',
          'Access self-help resources',
        ],
        basedOn: {
          sviScore,
          riskLevel,
        },
        serviceType: 'helpline',
        serviceName: 'NHAA helpline 14566',
        serviceContact: '14566',
      });
    }

    return recommendations;
  }

  /**
   * Get high indicators from assessment
   * @param {Object} indicators - Assessment indicators
   * @returns {Array} High indicator names
   */
  getHighIndicators(indicators) {
    const highIndicators = [];
    const threshold = 60;

    if (indicators.emotionalState >= threshold) highIndicators.push('emotionalState');
    if (indicators.distress >= threshold) highIndicators.push('distress');
    if (indicators.fear >= threshold) highIndicators.push('fear');
    if (indicators.anxiety >= threshold) highIndicators.push('anxiety');
    if (indicators.trauma >= threshold) highIndicators.push('trauma');
    if (indicators.threatVulnerability >= threshold) highIndicators.push('threatVulnerability');
    if (indicators.socialIsolation >= threshold) highIndicators.push('socialIsolation');

    return highIndicators;
  }

  /**
   * Analyze trend between assessments
   * @param {number} previousScore - Previous SVI score
   * @param {number} currentScore - Current SVI score
   * @returns {Object} Trend analysis
   */
  analyzeTrend(previousScore, currentScore) {
    const difference = currentScore - previousScore;
    const percentageChange = (difference / previousScore) * 100;

    let trendDirection;
    if (percentageChange > 10) {
      trendDirection = 'deteriorating';
    } else if (percentageChange < -10) {
      trendDirection = 'improving';
    } else {
      trendDirection = 'stable';
    }

    return {
      previousScore,
      currentScore,
      difference,
      percentageChange: Math.round(percentageChange),
      trendDirection,
    };
  }

  /**
   * Get priority level for recommendation type
   * @param {string} recommendationType - Type of recommendation
   * @param {string} riskLevel - Current risk level
   * @returns {string} Priority level
   */
  getPriority(recommendationType, riskLevel) {
    const priorityMap = {
      urgent_escalation: 'urgent',
      human_review: riskLevel === 'Critical' ? 'urgent' : 'high',
      medical_assistance: riskLevel === 'Critical' ? 'urgent' : 'high',
      protection_services: 'high',
      counselling: riskLevel === 'High' || riskLevel === 'Critical' ? 'high' : 'medium',
      legal_aid: 'medium',
    };

    return priorityMap[recommendationType] || 'medium';
  }
}

export default new RecommendationEngine();
