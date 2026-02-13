import React from 'react';
import { useTranslation } from 'react-i18next';
import { DialogTitle, Button, Dialog, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { MainProps } from '../types/props';

type Props = Pick<MainProps, 'showErrorDialog' | 'onError'>;

export default function ErrorDialog(props: Props) {
    const { t } = useTranslation();
    const errorMessage = t('ErrorDialog.message').replace(
        '%s',
        `<a href="https://docs.google.com/forms/d/e/1FAIpQLScQiZNzcYKgto1mQYAmxmo49RTuAnvtmkk3BQ02MsVlE4OmHg/viewform?embedded=true">${t('ErrorDialog.formname')}</a>`
    );

    return (
        <Dialog open={Boolean(props.showErrorDialog)}>
            <DialogTitle arial-labelledby="error-dialog-title">エラーが発生しました</DialogTitle>
            <DialogContent>
                <DialogContentText dangerouslySetInnerHTML={{ __html: errorMessage }} />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => props.onError(false)}>
                    {t('ErrorDialog.close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
