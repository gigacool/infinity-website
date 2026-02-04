import { useSignal } from '@preact/signals';
import { useRef, useCallback } from 'preact/hooks';
import { skillCategories } from '../data/skills';

interface SkillGridProps {
  lang: 'fr' | 'en';
}

export default function SkillGrid({ lang }: SkillGridProps) {
  const activeCategory = useSignal<string>('tech');
  const selectedSkills = useSignal<Set<string>>(new Set());
  const tabListRef = useRef<HTMLDivElement>(null);

  const toggleSkill = (skillId: string) => {
    const current = new Set(selectedSkills.value);
    if (current.has(skillId)) {
      current.delete(skillId);
    } else if (current.size < 5) {
      current.add(skillId);
    }
    selectedSkills.value = current;

    const event = new CustomEvent('skillsChanged', {
      detail: { skills: Array.from(current) }
    });
    window.dispatchEvent(event);
  };

  const removeSkill = (skillId: string) => {
    const current = new Set(selectedSkills.value);
    current.delete(skillId);
    selectedSkills.value = current;

    const event = new CustomEvent('skillsChanged', {
      detail: { skills: Array.from(current) }
    });
    window.dispatchEvent(event);
  };

  const getSkillName = (skillId: string): string => {
    for (const category of skillCategories) {
      const skill = category.skills.find(s => s.id === skillId);
      if (skill) return skill.name[lang];
    }
    return skillId;
  };

  const handleSkillKeyDown = (e: KeyboardEvent, skillId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSkill(skillId);
    }
  };

  const handleTabKeyDown = useCallback((e: KeyboardEvent) => {
    const tabs = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    if (!tabs) return;

    const currentIndex = Array.from(tabs).findIndex(
      tab => tab.getAttribute('aria-selected') === 'true'
    );

    let nextIndex: number | null = null;

    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const nextTab = tabs[nextIndex];
      nextTab.focus();
      activeCategory.value = skillCategories[nextIndex].id;
    }
  }, []);

  const activeCat = skillCategories.find(c => c.id === activeCategory.value)!;

  return (
    <div class="space-y-3" role="group" aria-label={lang === 'fr' ? 'Sélection des compétences' : 'Skills selection'}>
      {/* Tab Bar */}
      <div
        ref={tabListRef}
        role="tablist"
        aria-label={lang === 'fr' ? 'Catégories de compétences' : 'Skill categories'}
        class="flex border-b border-gray-200"
        onKeyDown={handleTabKeyDown}
      >
        {skillCategories.map(category => {
          const isActive = activeCategory.value === category.id;
          return (
            <button
              key={category.id}
              type="button"
              role="tab"
              id={`tab-${category.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${category.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => { activeCategory.value = category.id; }}
              class={`flex-1 flex items-center justify-center gap-1.5 px-2 py-3 text-sm font-medium transition-colors duration-150 border-b-2 -mb-px
                ${isActive
                  ? 'border-infinity-orange text-infinity-orange'
                  : 'border-transparent text-gray-500 hover:text-infinity-dark'
                }`}
            >
              <span aria-hidden="true">{category.icon}</span>
              <span>{category.name[lang]}</span>
            </button>
          );
        })}
      </div>

      {/* Skill Panel */}
      <div
        id={`panel-${activeCategory.value}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeCategory.value}`}
        class="min-h-[160px] p-4 bg-gray-50 rounded-lg"
      >
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {activeCat.skills.map(skill => {
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
                class={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 min-h-[44px] border
                  ${isSelected
                    ? 'border-infinity-orange bg-orange-50 text-infinity-orange'
                    : isDisabled
                      ? 'border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 bg-white text-infinity-dark hover:bg-gray-100'
                  }`}
              >
                {skill.name[lang]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Skills Pills */}
      {selectedSkills.value.size > 0 && (
        <div class="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
          {Array.from(selectedSkills.value).map(skillId => (
            <span
              key={skillId}
              class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-infinity-orange bg-orange-50 text-infinity-orange text-sm font-medium"
            >
              {getSkillName(skillId)}
              <button
                type="button"
                onClick={() => removeSkill(skillId)}
                class="ml-1 hover:bg-orange-100 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-infinity-orange"
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
    </div>
  );
}
