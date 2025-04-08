import { Snackbar, Alert } from '@mui/material';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationProps {
  open: boolean;
  message: string;
  severity: NotificationType;
  onClose: () => void;
  autoHideDuration?: number;
}

const Notification = ({
  open,
  message,
  severity,
  onClose,
  autoHideDuration = 6000
}: NotificationProps) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification; 