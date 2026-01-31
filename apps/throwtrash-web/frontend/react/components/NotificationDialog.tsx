import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogTitle, Dialog, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { AppBarProps } from '../types/props';

type Props = Pick<AppBarProps, 'notificationDialog' | 'onNotificationDialog'>;

const isShowedNotification = () => {
    if (typeof document === 'undefined') return false;
    return document.cookie.indexOf('showedNotification=true') >= 0;
};

export default function NotificationDialog(props: Props) {
    const { t } = useTranslation();

    useEffect(() => {
        if (!isShowedNotification()) {
            props.onNotificationDialog(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!props.notificationDialog && !isShowedNotification()) {
            document.cookie = 'showedNotification=true; ' + document.cookie;
        }
    }, [props.notificationDialog]);

    return (
        <Dialog
            onClose={() => props.onNotificationDialog(false)}
            open={Boolean(props.notificationDialog)}
            aria-labelledby="notification-dialog-title"
        >
            <DialogTitle id="notification-dialog-title">
                {t('NotificationDialog.title')}
            </DialogTitle>
            <DialogContent>
                <DialogContentText component="div" sx={{ '@media (max-width:600px)': { fontSize: '80%' } }}>
                    {t('NotificationDialog.message')}
                    <ul>
                        <li>{t('NotificationDialog.sub1')}</li>
                        <li>{t('NotificationDialog.sub2')}</li>
                        <li>{t('NotificationDialog.sub3')}</li>
                    </ul>
                </DialogContentText>
            </DialogContent>
            <DialogContent>
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <a href='https://play.google.com/store/apps/details?id=net.my.throwtrash&pcampaignid=pcampaignidMKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1'>
                        <img style={{ width: '50%' }} alt='Google Play で手に入れよう' src='img/btn_google_play_ja.png' />
                    </a>
                </div>
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <a href='https://apps.apple.com/jp/app/%E4%BB%8A%E6%97%A5%E3%81%AE%E3%82%B4%E3%83%9F%E5%87%BA%E3%81%97-%E3%82%B9%E3%83%9E%E3%83%BC%E3%83%88%E3%82%B9%E3%83%94%E3%83%BC%E3%82%AB%E3%83%BC%E9%80%A3%E6%90%BA/id6450391257'>
                        <img style={{ width: '50%' }} alt='App Store で手に入れよう' src='img/btn_app_store_ja.svg' />
                    </a>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onNotificationDialog(false)}>
                    {t('NotificationDialog.close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
