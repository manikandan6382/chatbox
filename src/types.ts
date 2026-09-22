export interface BenefitCardItem {
  id: string;
  title: string;
  description: string;
  icon: 'plane' | 'lounge' | 'shield' | 'credit-card' | 'sparkles';
  actionText: string;
}

export interface ActionPillItem {
  id: string;
  label: string;
  actionKey: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  imageUrl?: string;
  benefitCards?: BenefitCardItem[];
  actionPills?: ActionPillItem[];
}

export interface SidebarItem {
  id: string;
  title: string;
  icon: string;
}

export interface ChatThreadItem {
  id: string;
  title: string;
  time: string;
  isPinned: boolean;
}
