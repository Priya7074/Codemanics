// Stress Vulnerability Index (SVI) Engine
// This engine calculates a stress vulnerability score from 0-100 based on assessment indicators

class SVIEngine {
  /**
   * Calculate SVI score from assessment indicators
   * @param {Object} indicators - Assessment indicators
   * @returns {Object} SVI calculation result
   */
  calculateSVI(indicators) {
    const {
      sentiment = 50,
      emotionalState = 50,
      distress = 50,
      fear = 50,
      anxiety = 50,
      trauma = 50,
      threatVulnerability = 50,
      socialIsolation = 50,
    } = indicators;

    // Weights for different indicators (sum should be 1.0)
    const weights = {
      emotionalState: 0.20,
      distress: 0.15,
      fear: 0.15,
      anxiety: 0.15,
      trauma: 0.15,
      threatVulnerability: 0.10,
      socialIsolation: 0.10,
    };

    // Calculate weighted score
    const weightedScore = 
      (emotionalState * weights.emotionalState) +
      (distress * weights.distress) +
      (fear * weights.fear) +
      (anxiety * weights.anxiety) +
      (trauma * weights.trauma) +
      (threatVulnerability * weights.threatVulnerability) +
      (socialIsolation * weights.socialIsolation);

    // Normalize to 0-100
    const sviScore = Math.round(Math.max(0, Math.min(100, weightedScore)));

    // Determine risk level
    const riskLevel = this.getRiskLevel(sviScore);

    // Determine contributing indicators
    const contributingIndicators = this.getContributingIndicators(indicators, weights);

    // Determine safety escalation flag
    const safetyEscalationFlag = this.shouldEscalate(sviScore, indicators);

    return {
      sviScore,
      riskLevel,
      contributingIndicators,
      safetyEscalationFlag,
      escalationReason: safetyEscalationFlag ? this.getEscalationReason(sviScore, indicators) : null,
    };
  }

  /**
   * Get risk level based on SVI score
   * @param {number} score - SVI score (0-100)
   * @returns {string} Risk level
   */
  getRiskLevel(score) {
    if (score >= 75) return 'Critical';
    if (score >= 50) return 'High';
    if (score >= 25) return 'Moderate';
    return 'Low';
  }

  /**
   * Get contributing indicators for the SVI score
   * @param {Object} indicators - Assessment indicators
   * @param {Object} weights - Indicator weights
   * @returns {Array} Contributing indicators with their values and weights
   */
  getContributingIndicators(indicators, weights) {
    const contributing = [];
    
    const indicatorEntries = [
      { name: 'Emotional State', value: indicators.emotionalState || 50, weight: weights.emotionalState },
      { name: 'Distress', value: indicators.distress || 50, weight: weights.distress },
      { name: 'Fear', value: indicators.fear || 50, weight: weights.fear },
      { name: 'Anxiety', value: indicators.anxiety || 50, weight: weights.anxiety },
      { name: 'Trauma', value: indicators.trauma || 50, weight: weights.trauma },
      { name: 'Threat Vulnerability', value: indicators.threatVulnerability || 50, weight: weights.threatVulnerability },
      { name: 'Social Isolation', value: indicators.socialIsolation || 50, weight: weights.socialIsolation },
    ];

    // Sort by contribution (value * weight) in descending order
    indicatorEntries.sort((a, b) => (b.value * b.weight) - (a.value * a.weight));

    // Return top contributing indicators
    return indicatorEntries.map(indicator => ({
      name: indicator.name,
      value: indicator.value,
      weight: indicator.weight,
      contribution: Math.round(indicator.value * indicator.weight),
    }));
  }

  /**
   * Determine if safety escalation is needed
   * @param {number} sviScore - SVI score
   * @param {Object} indicators - Assessment indicators
   * @returns {boolean} Whether escalation is needed
   */
  shouldEscalate(sviScore, indicators) {
    // Escalate if score is critical
    if (sviScore >= 75) return true;

    // Escalate if threat vulnerability is high
    if (indicators.threatVulnerability >= 70) return true;

    // Escalate if trauma indicator is very high
    if (indicators.trauma >= 80) return true;

    // Escalate if fear is very high
    if (indicators.fear >= 80) return true;

    return false;
  }

  /**
   * Get escalation reason
   * @param {number} sviScore - SVI score
   * @param {Object} indicators - Assessment indicators
   * @returns {string} Escalation reason
   */
  getEscalationReason(sviScore, indicators) {
    if (sviScore >= 75) {
      return 'Critical SVI score indicates immediate safety concern';
    }
    if (indicators.threatVulnerability >= 70) {
      return 'High threat/vulnerability indicator detected';
    }
    if (indicators.trauma >= 80) {
      return 'Severe trauma indicators detected';
    }
    if (indicators.fear >= 80) {
      return 'High fear level detected';
    }
    return 'Multiple elevated risk indicators detected';
  }

  /**
   * Calculate trend between assessments
   * @param {number} previousScore - Previous SVI score
   * @param {number} currentScore - Current SVI score
   * @returns {Object} Trend analysis
   */
  calculateTrend(previousScore, currentScore) {
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
}

export default new SVIEngine();
