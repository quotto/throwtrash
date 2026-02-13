import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogTitle, Button, Dialog, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { AppBarProps } from '../types/props';
import { apiBase } from '../lib/env';

type Props = Pick<AppBarProps, 'signedIn' | 'signinDialog' | 'onSigninDialog' | 'onSetUserInfo' | 'onSignOut' | 'userInfo'>;

type AuthorizeOptions = { scope: string };
type AccessTokenRequest = { access_token: string; error?: string };

declare global {
    interface Window {
        onAmazonLoginReady: Function;
    }
}

// Amazon Login SDK グローバル
declare const amazon: any;

export default function SignInDialog(props: Props) {
    const { t } = useTranslation();

    useEffect(() => {
        if (typeof document !== 'undefined' && document.getElementById('amazon-root')) {
            window.onAmazonLoginReady = function () {
                amazon.Login.setClientId('amzn1.application-oa2-client.8b1fd843af554c6891d9e48fc3c75be7');
                amazon.Login.setRegion(amazon.Login.Region.AsiaPacific);
            };
            (function (d) {
                const a = d.createElement('script'); a.type = 'text/javascript';
                a.async = true; a.id = 'amazon-login-sdk';
                a.src = 'https://assets.loginwithamazon.com/sdk/na/login1.js';
                const amazonRootElement = d.getElementById('amazon-root');
                if (amazonRootElement != null) {
                    amazonRootElement.appendChild(a);
                }
            })(document);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loginWithAmazon = () => {
        const options: AuthorizeOptions = { scope: 'profile' };

        amazon.Login.authorize(options, (response: AccessTokenRequest) => {
            if (response.error) {
                console.error('amazonログインエラー:' + response.error);
                return;
            }
            document.location.href = `${apiBase}/signin?service=amazon&access_token=${encodeURIComponent((response as AccessTokenRequest).access_token)}`;
        });
        return false;
    };

    if (!props.signedIn) {
        return (
            <div style={{ position: 'absolute', right: '20px' }}>
                <div id="amazon-root"></div>
                <Button
                    data-title={t('IntroJS.login.title')}
                    data-intro={t('IntroJS.login.hint')}
                    data-step={3}
                    sx={{ border: 'solid', '@media (max-width:600px)': { fontSize: '80%' } }}
                    color="inherit"
                    onClick={() => { props.onSigninDialog(true); }}>
                    {t('SigninDialog.login')}
                </Button>
                <Dialog
                    onClose={() => { props.onSigninDialog(false); }}
                    open={props.signinDialog}
                    scroll='body'
                    aria-labelledby="signin-dialog-title">
                    <DialogTitle id="signin-dialog-title">{t('SigninDialog.login')}</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ '@media (max-width:600px)': { fontSize: '80%' } }}>
                            {t('SigninDialog.aboutlogin')}
                        </DialogContentText>
                    </DialogContent>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Button
                            id='LoginWithAmazon'
                            sx={{ p: 0, minWidth: 'auto', mb: 1 }}
                            onClick={loginWithAmazon}
                            aria-label='sign in with Amazon'
                        >
                            <img src='https://images-na.ssl-images-amazon.com/images/G/01/lwa/btnLWA_gold_156x32.png' alt='sign in with Amazon' />
                        </Button>
                        <Button
                            component="a"
                            href={`${apiBase}/google_signin`}
                            sx={{ p: 0, minWidth: 'auto', mb: 1 }}
                            aria-label='sign in with Google'
                        >
                            <img style={{ width: '160px', height: '38px' }} src='img/btn_google_signin_ja.png' alt='sign in with Google' />
                        </Button>
                    </div>
                    <DialogActions>
                        <Button onClick={() => props.onSigninDialog(false)}>
                            {t('SigninDialog.close')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
    return <div />;
}
