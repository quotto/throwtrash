import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Paper, Table, TableBody, TableCell, TableContainer, TablePagination, TableRow } from '@mui/material';
import React from 'react';
import { ZipcodeStatusEnum } from '../../../app/states/types';
import { MainProps } from '../../types/props';

export default function ResultDialog(props: MainProps) {
    const { changeZipcodeStatus, setPreset, changePage, changePerPage } = props;
    const { status, trash_page_state } = props.zipcodeState;
    const { trash_list, trash_text_list, per_page, current_page } = trash_page_state;

    const paged = trash_list.slice(current_page * per_page, current_page * per_page + per_page);

    return (
        <Dialog open={status === ZipcodeStatusEnum.ResultSelect}>
            <DialogTitle id='result-dialog-title'>検索結果</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    設定したいゴミ出し予定をクリックしてください。
                </DialogContentText>
                <TableContainer component={Paper}>
                    <Table size='small' aria-label='trashes-table'>
                        <TableBody>
                            {paged.map((trash, index) => (
                                <TableRow
                                    key={index}
                                    hover
                                    sx={{
                                        cursor: 'pointer',
                                        '&:nth-of-type(odd)': { backgroundColor: 'action.hover' }
                                    }}
                                    onClick={() => {
                                        setPreset(trash);
                                        changeZipcodeStatus(ZipcodeStatusEnum.None, []);
                                    }}
                                >
                                    <TableCell component='th' scope='row'>
                                        {trash_text_list[index]}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                {trash_page_state.trash_list.length > 5 && (
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        component="div"
                        count={trash_page_state.trash_list.length}
                        rowsPerPage={trash_page_state.per_page}
                        page={trash_page_state.current_page}
                        labelRowsPerPage='1ページあたりの行数'
                        onPageChange={(_, new_page) => changePage(new_page)}
                        onRowsPerPageChange={(e) => {
                            changePerPage(Number(e.target.value));
                            changePage(0);
                        }}
                    />
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
