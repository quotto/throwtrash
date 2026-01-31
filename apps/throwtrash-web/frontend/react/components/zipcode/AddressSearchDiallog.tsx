import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Table, TableBody, TableCell, TableContainer, TablePagination, TableRow } from '@mui/material';
import React from 'react';
import { ZipcodeStatusEnum } from '../../../app/states/types';
import { MainProps } from '../../types/props';
import { loadAddress } from '../../lib/api-client';

export default function AddressSearchDialog(props: MainProps) {
    const { changeZipcodeStatus, submitZipcode, changePage, changePerPage } = props;
    const { status, address_page_state, submitting } = props.zipcodeState;
    const { current_page, per_page, address_list } = address_page_state;

    const paged = address_list.slice(current_page * per_page, current_page * per_page + per_page);

    return (
        <Dialog open={status === ZipcodeStatusEnum.AddressSelect}>
            <DialogTitle id='result-dialog-title'>検索結果</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    複数の住所が見つかりました。ひとつ選択してください。
                </DialogContentText>
                {submitting ? (
                    <CircularProgress />
                ) : (
                    <Paper>
                        <TableContainer component={Paper}>
                            <Table size='small' aria-label='trashes-table'>
                                <TableBody>
                                    {paged.map((address, index) => (
                                        <TableRow
                                            key={index}
                                            hover
                                            sx={{
                                                cursor: 'pointer',
                                                '&:nth-of-type(odd)': { backgroundColor: 'action.hover' }
                                            }}
                                            onClick={async () => {
                                                submitZipcode(true);
                                                loadAddress(address).then((response) => {
                                                    changeZipcodeStatus(ZipcodeStatusEnum.ResultSelect, response.data.data);
                                                }).catch(console.error)
                                                    .finally(() => submitZipcode(false));
                                            }}
                                        >
                                            <TableCell component='th' scope='row'>
                                                {address}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {address_list.length > 5 && (
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, 50]}
                                component={Paper}
                                count={address_list.length}
                                rowsPerPage={per_page}
                                page={current_page}
                                labelRowsPerPage='1ページあたりの行数'
                                onPageChange={(_, new_page) => changePage(new_page)}
                                onRowsPerPageChange={(e) => {
                                    changePerPage(Number(e.target.value));
                                    changePage(0);
                                }}
                            />
                        )}
                    </Paper>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => changeZipcodeStatus(ZipcodeStatusEnum.None, [])}
                    variant='contained'>
                        戻る
                </Button>
            </DialogActions>
        </Dialog>
    );
}
