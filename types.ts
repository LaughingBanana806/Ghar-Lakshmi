
export interface ExplanationResult {
  concept: string;
  simpleDefinition: string;
  analogy: string;
  keyTakeaway: string;
}

export interface ScamAnalysisResult {
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  verdict: string;
  explanation: string;
  safeComparison: string;
}

export interface FomoAnalysisResult {
  verdict: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  analysis: string;
  recommendation: string;
}

export interface SchemeResult {
  name: string;
  benefit: string;
  eligibility: string;
  applicationSteps: string[];
}

export interface StreeDhanItem {
  id: string;
  image: string; // Base64 string
  title: string;
  category: 'gold' | 'cash' | 'gift' | 'papers';
  date: string;
  notes: string;
}

export interface LegalVaultItem {
  id: string;
  title: string;
  category: 'property_contribution' | 'asset_receipt' | 'jewelry' | 'loan_repayment' | 'other';
  amount: number;
  date: string;
  notes: string;
  image?: string; // Base64 proof
}

export interface KittyMember {
  id: string;
  name: string;
  hasPaid: boolean;
}

export interface KittyGroup {
  name: string;
  amount: number;
  members: KittyMember[];
  currentWinnerId?: string;
  winningBid?: number; // For auction based chit funds
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type UserMode = 'saral' | 'smart';

export interface UserProfile {
  name?: string;
  language: string;
  location: 'city' | 'town' | 'village';
  occupation: 'salary' | 'daily_wage' | 'business' | 'homemaker' | 'student';
  mode: UserMode;
}