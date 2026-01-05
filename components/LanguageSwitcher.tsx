'use client';

import { Globe } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { useAdminLanguage } from '@/lib/admin-language-context';
import { cn } from '@/lib/utils';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useAdminLanguage();
  const isRTL = language === 'he';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 gap-1.5 text-slate-600 hover:text-slate-900">
          <Globe className="h-4 w-4" strokeWidth={1.75} />
          <span className="text-sm">{language === 'he' ? 'עב' : 'EN'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="min-w-[120px]">
        <DropdownMenuItem
          onClick={() => setLanguage('he')}
          className={cn(
            'cursor-pointer text-sm',
            language === 'he' && 'bg-indigo-50 text-indigo-600'
          )}
        >
          <span>עברית</span>
          {language === 'he' && <span className="mr-auto text-indigo-600">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={cn(
            'cursor-pointer text-sm',
            language === 'en' && 'bg-indigo-50 text-indigo-600'
          )}
        >
          <span>English</span>
          {language === 'en' && <span className="ml-auto text-indigo-600">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
