import { useLanguage } from '../context/LanguageContext';
import { t } from '../i18n/translations';

export function useTranslation() {
  const { language } = useLanguage();

  return {
    t: (key: string, params?: Record<string, string>) => t(key, language, params),
    language,
  };
}
