export interface Skill {
  id: string;
}

export interface SkillCategory {
  id: string;
  icon: string;
  skills: Skill[];
}

export const skillCategories: SkillCategory[] = [
  {
    id: 'tech',
    icon: '💻',
    skills: [
      { id: 'cloud' },
      { id: 'devops' },
      { id: 'security' },
      { id: 'data' },
      { id: 'ai' },
      { id: 'web' },
    ]
  },
  {
    id: 'leadership',
    icon: '🎯',
    skills: [
      { id: 'management' },
      { id: 'communication' },
      { id: 'agile' },
      { id: 'coaching' },
      { id: 'strategy' },
      { id: 'change' },
    ]
  },
  {
    id: 'business',
    icon: '📊',
    skills: [
      { id: 'finance' },
      { id: 'marketing' },
      { id: 'sales' },
      { id: 'product' },
      { id: 'analytics' },
      { id: 'compliance' },
    ]
  },
  {
    id: 'personal',
    icon: '🧠',
    skills: [
      { id: 'productivity' },
      { id: 'presentation' },
      { id: 'writing' },
      { id: 'critical' },
      { id: 'emotional' },
      { id: 'learning' },
    ]
  },
];
