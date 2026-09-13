import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

class AIChatService {
  constructor() {
    this.refreshConfig();
  }

  refreshConfig() {
    this.provider = (process.env.AI_PROVIDER || 'demo').toLowerCase();
    this.apiKey = process.env.OPENAI_API_KEY?.trim() || '';
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    this.openai = null;

    if (this.provider === 'openai' && this.apiKey) {
      this.openai = new OpenAI({
        apiKey: this.apiKey,
      });
    }
  }

  /**
   * Generate context-aware AI response
   * @param {string} userMessage - Current user message
   * @param {Array} conversationHistory - Previous conversation messages
   * @param {Object} context - Additional context (session info, assessment data, etc.)
   * @returns {Promise<Object>} AI response with text and metadata
   */
  async generateResponse(userMessage, conversationHistory = [], context = {}) {
    this.refreshConfig();

    if (this.provider === 'openai' && this.openai) {
      return await this.generateOpenAIResponse(userMessage, conversationHistory, context);
    }

    return await this.generateDemoResponse(userMessage, conversationHistory, context);
  }

  /**
   * Generate response using OpenAI API
   */
  async generateOpenAIResponse(userMessage, conversationHistory, context) {
    try {
      // Build conversation context for AI
      const messages = this.buildConversationContext(userMessage, conversationHistory, context);

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const aiResponse = completion.choices[0].message.content;

      return {
        text: aiResponse,
        provider: 'openai',
        model: this.model,
        confidence: 0.85,
        requiresAssessment: this.detectAssessmentNeed(userMessage),
        metadata: {
          tokensUsed: completion.usage?.total_tokens,
          finishReason: completion.choices[0].finish_reason,
        },
      };
    } catch (error) {
      console.error('OpenAI API error; falling back to contextual demo response:', {
        message: error.message,
        code: error.code,
        status: error.status,
        type: error.type,
      });

      return await this.generateDemoResponse(userMessage, conversationHistory, context);
    }
  }

  /**
   * Build conversation context for AI
   */
  buildConversationContext(userMessage, conversationHistory, context) {
    const systemPrompt = this.buildSystemPrompt(context);

    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history (last 10 messages to manage context window)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach((msg) => {
      messages.push({
        role: msg.role,
        content: msg.content,
      });
    });

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    return messages;
  }

  /**
   * Build system prompt for AI
   */
  buildSystemPrompt(context) {
    const basePrompt = `You are Aawaz, a compassionate AI assistant for people who may be experiencing stress, trauma, or difficult situations. Your role is to:

1. Listen empathetically and without judgment
2. Provide emotional support and validation
3. Offer helpful information about resources and next steps
4. Recognize when someone might need professional help
5. Never provide medical or psychological diagnosis
6. Maintain confidentiality and privacy
7. Be warm, patient, and supportive

Current context: ${context.sessionId ? `Session ID: ${context.sessionId}` : 'New conversation'}
${context.hasConsent ? 'User has consented to AI-assisted assessment.' : 'Consent status unknown.'}

IMPORTANT: 
- If someone expresses immediate danger to themselves or others, prioritize safety information
- If someone wants to report an incident, guide them through the process
- If someone seems to need professional help, suggest appropriate resources
- Always be honest about your limitations as an AI
- Do not repeatedly offer the same assessment unless context suggests it's needed`;

    return basePrompt;
  }

  /**
   * Generate demo response (fallback when AI API unavailable)
   * This is clearly labelled as DEMO and provides contextual responses
   */
  async generateDemoResponse(userMessage, conversationHistory, context) {
    const lowerMessage = userMessage.toLowerCase();
    const lastUserMessage = conversationHistory.length > 0 
      ? conversationHistory[conversationHistory.length - 1]?.content?.toLowerCase() 
      : '';

    // Analyze conversation context
    const conversationTopics = this.analyzeConversationTopics(conversationHistory);
    const isFollowUp = conversationHistory.length > 0;

    let response = '';
    let requiresAssessment = false;
    let confidence = 0.6; // Lower confidence for demo mode

    // Context-aware response generation
    if (this.isGreeting(lowerMessage) && !isFollowUp) {
      response = this.getGreetingResponse();
    } else if (this.isStressAnxiety(lowerMessage)) {
      response = this.getStressResponse(lowerMessage, conversationTopics);
      requiresAssessment = true;
      confidence = 0.7;
    } else if (this.isIncidentReport(lowerMessage)) {
      response = this.getIncidentResponse(lowerMessage, conversationTopics);
      confidence = 0.75;
    } else if (this.isSupportRequest(lowerMessage)) {
      response = this.getSupportResponse(lowerMessage, conversationTopics);
    } else if (this.isLegalQuestion(lowerMessage)) {
      response = this.getLegalResponse(lowerMessage, conversationTopics);
    } else if (this.isFollowUpQuestion(lowerMessage, lastUserMessage)) {
      response = this.getFollowUpResponse(lowerMessage, lastUserMessage, conversationTopics);
    } else if (this.isProjectHelp(lowerMessage)) {
      response = this.getProjectHelpResponse(lowerMessage);
    } else if (this.isGratitude(lowerMessage)) {
      response = this.getGratitudeResponse();
    } else if (this.isGoodbye(lowerMessage)) {
      response = this.getGoodbyeResponse();
    } else {
      response = this.getGeneralResponse(lowerMessage, conversationTopics);
    }

    return {
      text: response,
      provider: 'demo',
      model: 'demo-contextual-v1',
      confidence: confidence,
      requiresAssessment: requiresAssessment,
      metadata: {
        conversationLength: conversationHistory.length,
        detectedTopics: conversationTopics,
        isFollowUp: isFollowUp,
        disclaimer: 'This is a demo response. In production, this would use real AI processing.',
      },
    };
  }

  /**
   * Analyze conversation topics from history
   */
  analyzeConversationTopics(conversationHistory) {
    const topics = {
      stress: false,
      incident: false,
      support: false,
      legal: false,
      assessment: false,
    };

    const allText = conversationHistory.map(msg => msg.content.toLowerCase()).join(' ');

    if (allText.includes('stress') || allText.includes('anxious') || allText.includes('worried')) {
      topics.stress = true;
    }
    if (allText.includes('incident') || allText.includes('report') || allText.includes('happened')) {
      topics.incident = true;
    }
    if (allText.includes('help') || allText.includes('support') || allText.includes('talk')) {
      topics.support = true;
    }
    if (allText.includes('legal') || allText.includes('rights') || allText.includes('law')) {
      topics.legal = true;
    }
    if (allText.includes('assessment') || allText.includes('check') || allText.includes('evaluate')) {
      topics.assessment = true;
    }

    return topics;
  }

  // Helper methods for message classification
  isGreeting(message) {
    return /^(hello|hi|hey|greetings|good morning|good afternoon|good evening)/i.test(message);
  }

  isStressAnxiety(message) {
    return /stress|anxious|anxiety|worried|nervous|overwhelmed|panic|fear|scared|afraid|depressed|sad|hopeless/i.test(message);
  }

  isIncidentReport(message) {
    return /incident|report|abuse|violence|attack|happened|occurred|harassment|assault/i.test(message);
  }

  isSupportRequest(message) {
    return /help|support|talk|someone|listen|advice|guidance|counsel/i.test(message);
  }

  isLegalQuestion(message) {
    return /legal|rights|law|attorney|lawyer|court|police|complaint|file/i.test(message);
  }

  isFollowUpQuestion(message, previousMessage) {
    return /what|how|why|when|where|who|which|can you|could you|would you|please|explain|tell me/i.test(message) && previousMessage;
  }

  isProjectHelp(message) {
    return /project|aawaz|system|how does|how do|work|function|feature/i.test(message);
  }

  isGratitude(message) {
    return /thank|thanks|appreciate|grateful/i.test(message);
  }

  isGoodbye(message) {
    return /bye|goodbye|see you|farewell|leaving|quit|exit/i.test(message);
  }

  detectAssessmentNeed(message) {
    return this.isStressAnxiety(message) || this.isIncidentReport(message);
  }

  // Response generators
  getGreetingResponse() {
    const greetings = [
      "Hello! I'm Aawaz, and I'm here to support you. How are you feeling today?",
      "Hi there. I'm glad you're here. This is a safe space for you to share what's on your mind.",
      "Hello! Welcome to Aawaz. I'm here to listen and help in any way I can. What would you like to talk about?",
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  getStressResponse(message, topics) {
    if (message.includes('anxious') || message.includes('worried')) {
      return "I hear that you're feeling anxious and worried. That's a really difficult feeling to carry alone. Anxiety can make everything feel overwhelming, but you don't have to face it by yourself. Would you like to tell me more about what's causing these feelings, or would you prefer some immediate coping strategies I can share?";
    } else if (message.includes('stress') || message.includes('overwhelmed')) {
      return "It sounds like you're dealing with a lot of stress right now. When we're overwhelmed, even small things can feel impossible. I want you to know that your feelings are valid, and there are ways to manage this. What feels like the biggest source of stress for you at the moment?";
    } else if (message.includes('scared') || message.includes('afraid')) {
      return "I can hear that you're feeling scared, and it takes courage to admit that. Fear is a natural response, but you don't have to face it alone. Your safety and wellbeing are important. Are you currently in a safe place?";
    } else {
      return "Thank you for sharing how you're feeling. It sounds like you're going through a difficult time. Your emotions are valid, and there's support available. Would you like to explore what might help you feel better, or talk about what's contributing to these feelings?";
    }
  }

  getIncidentResponse(message, topics) {
    if (topics.incident) {
      return "I understand you want to provide more information about the incident. Your voice matters, and there are proper channels for reporting. Would you like me to guide you through the reporting process, or would you prefer to first talk through what happened?";
    } else {
      return "I'm sorry you experienced something difficult. You have the right to report incidents and seek support. There are several options available - would you like to start a formal report, or would you prefer to first talk about what happened and explore your options?";
    }
  }

  getSupportResponse(message, topics) {
    if (topics.stress) {
      return "I'm glad you reached out for help. That's an important step. Based on what you've shared, there are various support options available - from talking to a counsellor to connecting with support services. What kind of support feels most right for you right now?";
    } else {
      return "I'm here to support you. There are different ways I can help - we can talk about what's on your mind, explore resources, or discuss next steps. What would be most helpful for you right now?";
    }
  }

  getLegalResponse(message, topics) {
    return "I understand you have questions about legal aspects. While I can provide general information, I'm not able to give specific legal advice. For legal guidance, it's best to consult with a qualified attorney or legal aid service. Would you like me to help you find appropriate legal resources?";
  }

  getFollowUpResponse(message, previousMessage, topics) {
    if (topics.stress) {
      return "That's a good question. Based on what we've discussed, there are several approaches that might help. The key is finding what works for you - there's no one-size-fits-all solution. Would you like me to elaborate on any specific aspect?";
    } else if (topics.incident) {
      return "I understand you need more information. The process can vary depending on your situation and location. Let me help you understand the general steps involved, and then we can discuss what might apply to your case.";
    } else {
      return "That's an important question. Let me address that based on what you've shared. I want to make sure you have the information you need to make the best decision for your situation.";
    }
  }

  getProjectHelpResponse(message) {
    return "I'm Aawaz, an AI assistant designed to provide emotional support and guidance for people who may be experiencing difficult situations. I can help with stress discussions, incident reporting information, and connecting to support services. I'm not a replacement for professional mental health care, but I can be a helpful first step. How can I assist you today?";
  }

  getGratitudeResponse() {
    return "You're very welcome. I'm glad I could be here for you. Remember, seeking support is a sign of strength, not weakness. Is there anything else you'd like to discuss?";
  }

  getGoodbyeResponse() {
    return "Take care of yourself. Remember that support is always available when you need it. You don't have to face difficult times alone. Feel free to come back whenever you need someone to talk to.";
  }

  getGeneralResponse(message, topics) {
    if (topics.stress) {
      return "I want to make sure I understand what you're going through. Your feelings are important, and I'm here to listen. Could you tell me a bit more about what's on your mind?";
    } else if (topics.support) {
      return "I'm here to help. Sometimes it can be hard to know where to start. What feels most pressing for you right now?";
    } else {
      return "Thank you for sharing that with me. I'm here to listen and support you. Could you tell me more about what's on your mind, or is there something specific you'd like help with?";
    }
  }
}

export default new AIChatService();
