export interface Skill {
  id: string;
  name: { fr: string; en: string };
}

export interface SkillCategory {
  id: string;
  name: { fr: string; en: string };
  icon: string;
  skills: Skill[];
}

export const skillCategories: SkillCategory[] = [
  {
    id: 'tech',
    name: { fr: 'Tech', en: 'Tech' },
    icon: '💻',
    skills: [
      { id: 'cloud', name: { fr: 'Cloud & Infrastructure', en: 'Cloud & Infrastructure' } },
      { id: 'devops', name: { fr: 'DevOps & CI/CD', en: 'DevOps & CI/CD' } },
      { id: 'security', name: { fr: 'Cybersécurité', en: 'Cybersecurity' } },
      { id: 'data', name: { fr: 'Data & Analytics', en: 'Data & Analytics' } },
      { id: 'ai', name: { fr: 'IA & Machine Learning', en: 'AI & Machine Learning' } },
      { id: 'web', name: { fr: 'Développement Web', en: 'Web Development' } },
    ]
  },
  {
    id: 'leadership',
    name: { fr: 'Leadership', en: 'Leadership' },
    icon: '🎯',
    skills: [
      { id: 'management', name: { fr: "Management d'équipe", en: 'Team Management' } },
      { id: 'communication', name: { fr: 'Communication', en: 'Communication' } },
      { id: 'agile', name: { fr: 'Agilité & Scrum', en: 'Agile & Scrum' } },
      { id: 'coaching', name: { fr: 'Coaching', en: 'Coaching' } },
      { id: 'strategy', name: { fr: 'Stratégie', en: 'Strategy' } },
      { id: 'change', name: { fr: 'Conduite du changement', en: 'Change Management' } },
    ]
  },
  {
    id: 'business',
    name: { fr: 'Business', en: 'Business' },
    icon: '📊',
    skills: [
      { id: 'finance', name: { fr: 'Finance', en: 'Finance' } },
      { id: 'marketing', name: { fr: 'Marketing Digital', en: 'Digital Marketing' } },
      { id: 'sales', name: { fr: 'Vente & Négociation', en: 'Sales & Negotiation' } },
      { id: 'product', name: { fr: 'Product Management', en: 'Product Management' } },
      { id: 'analytics', name: { fr: 'Business Analytics', en: 'Business Analytics' } },
      { id: 'compliance', name: { fr: 'Conformité & RGPD', en: 'Compliance & GDPR' } },
    ]
  },
  {
    id: 'personal',
    name: { fr: 'Personnel', en: 'Personal' },
    icon: '🧠',
    skills: [
      { id: 'productivity', name: { fr: 'Productivité', en: 'Productivity' } },
      { id: 'presentation', name: { fr: 'Prise de parole', en: 'Public Speaking' } },
      { id: 'writing', name: { fr: 'Écriture professionnelle', en: 'Professional Writing' } },
      { id: 'critical', name: { fr: 'Pensée critique', en: 'Critical Thinking' } },
      { id: 'emotional', name: { fr: 'Intelligence émotionnelle', en: 'Emotional Intelligence' } },
      { id: 'learning', name: { fr: 'Apprendre à apprendre', en: 'Learning to Learn' } },
    ]
  },
];
