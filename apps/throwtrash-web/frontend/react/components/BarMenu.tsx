import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, MenuItem, Divider } from '@mui/material';
import { AppBarProps } from '../types/props';
import i18next from 'i18next';
import { signOut as signOutApi } from '../lib/api-client';

export default function BarMenu(props: AppBarProps) {
    const { t } = useTranslation();

    const signOut = useCallback(() => {
        signOutApi()
            .then(() => props.onSignOut())
            .catch((e) => console.error(e));
    }, [props]);

    const openWindow = useCallback(
        (url: string) => {
            window.open(url);
            props.onChangeMenu(false, null);
        },
        [props]
    );

    const manual_html = `./manual-${i18next.language}.html`;
    const policy_html = `./policy-${i18next.language}.html`;

    return (
        <Menu
            id="menu"
            anchorEl={props.menu.anchorEl}
            open={props.menu.open}
            onClose={() => props.onChangeMenu(false, null)}
        >
            {props.signedIn && props.userInfo ? (
                <>
                    <MenuItem>{t('BarMenu.loginas').replace('%s', props.userInfo.name)}</MenuItem>
                    <Divider />
                </>
            ) : null}
            <MenuItem onClick={() => openWindow(manual_html)}>
                {t('BarMenu.usage')}
            </MenuItem>
            <MenuItem onClick={() => openWindow(policy_html)}>
                {t('BarMenu.policy')}
            </MenuItem>
            <MenuItem onClick={() => openWindow('https://docs.google.com/forms/d/e/1FAIpQLScQiZNzcYKgto1mQYAmxmo49RTuAnvtmkk3BQ02MsVlE4OmHg/viewform?embedded=true')}>
                {t('BarMenu.contact')}
            </MenuItem>
            {props.signedIn && props.userInfo ? (
                <>
                    <Divider />
                    <MenuItem onClick={signOut}>{t('BarMenu.logout')}</MenuItem>
                </>
            ) : null}
        </Menu>
    );
}
