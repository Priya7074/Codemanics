import { v4 as uuidv4 } from 'uuid';

export const generateSessionId = () => {
  return `SES-${uuidv4().substring(0, 8).toUpperCase()}`;
};

export const generateAssessmentId = () => {
  return `ASM-${uuidv4().substring(0, 8).toUpperCase()}`;
};

export const generateReferralId = () => {
  return `REF-${uuidv4().substring(0, 8).toUpperCase()}`;
};

export const generateCaseId = () => {
  return `C-${Math.floor(1000 + Math.random() * 9000)}`;
};
