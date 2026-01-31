import React from 'react';
import { useTranslation } from 'react-i18next';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SignInDialog from './SignInDialog';
import NotificationDialog from './NotificationDialog';
import BarMenu from './BarMenu';
import { AppBarProps } from '../types/props';

export default function TopAppBar(props: AppBarProps) {
    const { t } = useTranslation();
    const { onChangeMenu, ...rest } = props;

    return (
        <AppBar position="static" sx={{ flexGrow: 1 }}>
            <Toolbar>
                <IconButton
                    data-title={t('IntroJS.other.title')}
                    data-intro={t('IntroJS.other.hint')}
                    data-step={4}
                    edge="start"
                    sx={{ ml: -1.5, mr: 2 }}
                    color="inherit"
                    aria-label="menu"
                    aria-controls="menu"
                    onClick={(event) => onChangeMenu(true, event.target as Element)}
                >
                    <MenuIcon />
                </IconButton>
                <BarMenu {...rest} onChangeMenu={onChangeMenu} />
                <Typography
                    variant="h6"
                    sx={{ flexGrow: 1, color: '#fff', '@media (max-width:600px)': { fontSize: '80%' } }}
                >
                    {t('TopAppBar.title')}
                </Typography>
                <NotificationDialog
                    notificationDialog={props.notificationDialog}
                    onNotificationDialog={props.onNotificationDialog}
                />
                <SignInDialog
                    signedIn={props.signedIn}
                    signinDialog={props.signinDialog}
                    onSigninDialog={props.onSigninDialog}
                    onSetUserInfo={props.onSetUserInfo}
                    onSignOut={props.onSignOut}
                    userInfo={props.userInfo}
                />
            </Toolbar>
        </AppBar>
    );
}
