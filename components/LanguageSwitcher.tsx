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

export default function LanguageSwitcher() {
  const { language, setLanguage } = useAdminLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{language === 'he' ? 'עברית' : 'English'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={language === 'he' ? 'start' : 'end'}>
        <DropdownMenuItem
          onClick={() => setLanguage('he')}
          className={language === 'he' ? 'bg-purple-50 text-purple-700' : ''}
        >
          <span className={language === 'he' ? 'ml-2' : 'mr-2'}>עברית</span>
          {language === 'he' && <span className="mr-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className={language === 'en' ? 'bg-purple-50 text-purple-700' : ''}
        >
          <span className={language === 'he' ? 'ml-2' : 'mr-2'}>English</span>
          {language === 'en' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

