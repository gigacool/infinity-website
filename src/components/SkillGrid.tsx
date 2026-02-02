import { signal, computed } from '@preact/signals';
import { skillCategories } from '../data/skills';

interface SkillGridProps {
  lang: 'fr' | 'en';
}

// Translations for skill names (loaded from i18n)
const translations = {
  fr: {
    categories: {
      tech: 'Tech',
      leadership: 'Leadership',
      business: 'Business',
      personal: 'Personnel'
    },
    items: {
      cloud: 'Cloud & Infrastructure',
      devops: 'DevOps & CI/CD',
      security: 'Cybersécurité',
      data: 'Data & Analytics',
      ai: 'IA & Machine Learning',
      web: 'Développement Web',
      management: "Management d'équipe",
      communication: 'Communication',
      agile: 'Agilité & Scrum',
      coaching: 'Coaching',
      strategy: 'Stratégie',
      change: 'Conduite du changement',
      finance: 'Finance',
      marketing: 'Marketing Digital',
      sales: 'Vente & Négociation',
      product: 'Product Management',
      analytics: 'Business Analytics',
      compliance: 'Conformité & RGPD',
      productivity: 'Productivité',
      presentation: 'Prise de parole',
      writing: 'Écriture professionnelle',
      critical: 'Pensée critique',
      emotional: 'Intelligence émotionnelle',
      learning: 'Apprendre à apprendre'
    }
  },
  en: {
    categories: {
      tech: 'Tech',
      leadership: 'Leadership',
      business: 'Business',
      personal: 'Personal'
    },
    items: {
      cloud: 'Cloud & Infrastructure',
      devops: 'DevOps & CI/CD',
      security: 'Cybersecurity',
      data: 'Data & Analytics',
      ai: 'AI & Machine Learning',
      web: 'Web Development',
      management: 'Team Management',
      communication: 'Communication',
      agile: 'Agile & Scrum',
      coaching: 'Coaching',
      strategy: 'Strategy',
      change: 'Change Management',
      finance: 'Finance',
      marketing: 'Digital Marketing',
      sales: 'Sales & Negotiation',
      product: 'Product Management',
      analytics: 'Business Analytics',
      compliance: 'Compliance & GDPR',
      productivity: 'Productivity',
      presentation: 'Public Speaking',
      writing: 'Professional Writing',
      critical: 'Critical Thinking',
      emotional: 'Emotional Intelligence',
      learning: 'Learning to Learn'
    }
  }
};

// State signals
const expandedCategory = signal<string | null>(null);
const selectedSkills = signal<Set<string>>(new Set());

// Computed value for validation
const isValid = computed(() => {
  const count = selectedSkills.value.size;
  return count >= 1 && count <= 5;
});

export default function SkillGrid({ lang }: SkillGridProps) {
  const t = translations[lang];

  const toggleCategory = (categoryId: string) => {
    if (expandedCategory.value === categoryId) {
      expandedCategory.value = null;
    } else {
      expandedCategory.value = categoryId;
    }
  };

  const toggleSkill = (skillId: string) => {
    const current = new Set(selectedSkills.value);
    if (current.has(skillId)) {
      current.delete(skillId);
    } else if (current.size < 5) {
      current.add(skillId);
    }
    selectedSkills.value = current;

    // Dispatch event for parent form
    const event = new CustomEvent('skillsChanged', {
      detail: { skills: Array.from(current) }
    });
    window.dispatchEvent(event);
  };

  const removeSkill = (skillId: string) => {
    const current = new Set(selectedSkills.value);
    current.delete(skillId);
    selectedSkills.value = current;

    // Dispatch event for parent form
    const event = new CustomEvent('skillsChanged', {
      detail: { skills: Array.from(current) }
    });
    window.dispatchEvent(event);
  };

  const getSkillName = (skillId: string): string => {
    return t.items[skillId as keyof typeof t.items] || skillId;
  };

  const getCategoryName = (categoryId: string): string => {
    return t.categories[categoryId as keyof typeof t.categories] || categoryId;
  };

  const handleCategoryKeyDown = (e: KeyboardEvent, categoryId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleCategory(categoryId);
    }
  };

  const handleSkillKeyDown = (e: KeyboardEvent, skillId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSkill(skillId);
    }
  };

  return (
    <div class="space-y-4" role="group" aria-label={lang === 'fr' ? 'Sélection des compétences' : 'Skills selection'}>
      {/* Selected Skills Pills */}
      {selectedSkills.value.size > 0 && (
        <div class="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          {Array.from(selectedSkills.value).map(skillId => (
            <span
              key={skillId}
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-infinity-orange text-white text-sm font-medium"
            >
              {getSkillName(skillId)}
              <button
                type="button"
                onClick={() => removeSkill(skillId)}
                class="ml-1 hover:bg-orange-600 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label={`${lang === 'fr' ? 'Retirer' : 'Remove'} ${getSkillName(skillId)}`}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          <span class="text-sm text-gray-500 self-center ml-2">
            {selectedSkills.value.size}/5
          </span>
        </div>
      )}

      {/* Category Grid */}
      <div class="grid grid-cols-2 gap-3" role="list">
        {skillCategories.map(category => (
          <div key={category.id} class="col-span-2 md:col-span-1">
            <button
              type="button"
              onClick={() => toggleCategory(category.id)}
              onKeyDown={(e) => handleCategoryKeyDown(e, category.id)}
              aria-expanded={expandedCategory.value === category.id}
              aria-controls={`skills-${category.id}`}
              class={`w-full p-4 rounded-lg border text-left transition-all duration-200 min-h-[56px]
                ${expandedCategory.value === category.id
                  ? 'bg-infinity-light border-infinity-orange shadow-md'
                  : 'bg-white border-gray-200 hover:shadow-md hover:border-gray-300'
                }`}
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-2xl" role="img" aria-hidden="true">{category.icon}</span>
                  <span class="font-semibold text-infinity-dark">
                    {getCategoryName(category.id)}
                  </span>
                </div>
                <svg
                  class={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    expandedCategory.value === category.id ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Expanded Skills */}
            {expandedCategory.value === category.id && (
              <div
                id={`skills-${category.id}`}
                class="mt-2 p-3 bg-gray-50 rounded-lg animate-fade-in"
                role="group"
                aria-label={`${getCategoryName(category.id)} skills`}
              >
                <div class="flex flex-wrap gap-2">
                  {category.skills.map(skill => {
                    const isSelected = selectedSkills.value.has(skill.id);
                    const isDisabled = !isSelected && selectedSkills.value.size >= 5;

                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => !isDisabled && toggleSkill(skill.id)}
                        onKeyDown={(e) => !isDisabled && handleSkillKeyDown(e, skill.id)}
                        aria-pressed={isSelected}
                        disabled={isDisabled}
                        class={`px-3 py-2 rounded-full text-sm font-medium transition-colors duration-150 min-h-[44px]
                          ${isSelected
                            ? 'bg-infinity-orange text-white'
                            : isDisabled
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-white border border-gray-200 text-infinity-dark hover:bg-gray-100'
                          }`}
                      >
                        {getSkillName(skill.id)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
