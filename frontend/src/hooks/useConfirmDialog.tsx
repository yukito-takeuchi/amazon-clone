import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Button } from '@/components/common/Button';

interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

export const useConfirmDialog = () => {
  const [dialog, setDialog] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setDialog({ open: true, title, message, onConfirm });
  };

  const handleConfirm = () => {
    dialog.onConfirm();
    setDialog((prev) => ({ ...prev, open: false }));
  };

  const handleCancel = () => {
    setDialog((prev) => ({ ...prev, open: false }));
  };

  const ConfirmDialog = () => (
    <Dialog
      open={dialog.open}
      onClose={handleCancel}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 'bold', color: '#111827' }}>
        {dialog.title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-dialog-description" sx={{ color: '#374151' }}>
          {dialog.message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="outline" onClick={handleCancel}>
          キャンセル
        </Button>
        <Button variant="primary" onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">
          削除
        </Button>
      </DialogActions>
    </Dialog>
  );

  return { showConfirm, ConfirmDialog };
};
