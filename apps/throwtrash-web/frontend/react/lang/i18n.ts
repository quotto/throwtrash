
/* eslint-disable import/no-named-as-default-member */
import ja from './ja.json';
import en from './en.json';
import { initReactI18next } from 'react-i18next';
import i18next from 'i18next';
i18next
    .use(initReactI18next)
    .init({
        debug: false,
        resources: {
            en: en,
            ja: ja
        },
        interpolation: {escapeValue: false},
        fallbackLng: 'ja',
        whitelist:['en','ja'],
        react :{
            useSuspense: false
        }
    } as any);
export default i18next;
