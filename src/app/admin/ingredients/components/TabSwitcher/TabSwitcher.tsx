'use client';

interface TabSwitcherProps {
  activeTab: 'ingredients' | 'groups';
  onTabChange: (tab: 'ingredients' | 'groups') => void;
  t: (key: string) => string;
}

export default function TabSwitcher({ activeTab, onTabChange, t }: TabSwitcherProps) {
  return (
    <div className="bg-white border rounded-xl p-1 inline-flex" dir="rtl">
      <button
        onClick={() => onTabChange('ingredients')}
        className={`px-6 py-3 font-medium rounded-lg transition-all focus:outline-none ${
          activeTab === 'ingredients'
            ? 'bg-purple-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`}
      >
        {t('Ingredients')}
      </button>
      <button
        onClick={() => onTabChange('groups')}
        className={`px-6 py-3 font-medium rounded-lg transition-all focus:outline-none ${
          activeTab === 'groups'
            ? 'bg-purple-600 text-white shadow-sm'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
        }`}
      >
        {"ניהול קבוצות"}
      </button>
    </div>
  );
}