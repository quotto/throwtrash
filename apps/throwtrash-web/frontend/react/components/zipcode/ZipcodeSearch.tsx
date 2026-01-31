import React from 'react';
import NumberFormat from 'react-number-format';
import { Button, CircularProgress, FormControl, FormGroup, FormLabel, InputAdornment, TextField, Tooltip, FormHelperText, Box } from '@mui/material';
import { Help } from '@mui/icons-material';
import { MainProps } from '../../types/props';
import AddressSearchDialog from './AddressSearchDiallog';
import ResultDialog from './ResultDiallog';

const isMaxValue = (inputValue: number) => inputValue <= 9999999;

type Props = MainProps;

export default function ZipcodeSearch(props: Props) {
    const { zipcodeState, changeZipcode, submitZipcode } = props;
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.25 }}>
            {zipcodeState.submitting ? (
                <CircularProgress />
            ) : (
                <FormControl>
                    <FormLabel
                        component='legend'
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                    >
                        <span>近くのゴミ出し予定を探してみる</span>
                        <Tooltip
                            title='同じ地域のユーザーが登録したゴミ出し予定を検索して自動入力できます。'
                            placement='top'
                            aria-label='description'
                            sx={{ ml: 0.5 }}
                        >
                            <Help fontSize='small' />
                        </Tooltip>
                    </FormLabel>
                    <FormGroup row sx={{ alignItems: 'flex-start', '& :first-of-type': { mr: 1 } }}>
                        {/* @ts-ignore react-number-format 型差異を無視 */}
                        <NumberFormat
                            value={zipcodeState.zipcode}
                            allowNegative={false}
                            isAllowed={(values: any) => isMaxValue(Number(values))}
                            onValueChange={(values: any) => {
                                changeZipcode(String(values));
                            }}
                            customInput={TextField}
                            size="small"
                            label="郵便番号（ハイフン不要）"
                            variant="outlined"
                            InputProps={{ startAdornment: <InputAdornment position="start">〒</InputAdornment> }}
                            error={Boolean(zipcodeState.error)}
                        />
                        <Button
                            onClick={() => submitZipcode(true)}
                            variant='contained'
                            color='secondary'
                            disabled={zipcodeState.zipcode.length !== 7}>
                            検索
                        </Button>
                    </FormGroup>
                    {zipcodeState.error && <FormHelperText error>{zipcodeState.error}</FormHelperText>}
                </FormControl>
            )}
            <AddressSearchDialog {...props} />
            <ResultDialog {...props} />
        </Box>
    );
}
