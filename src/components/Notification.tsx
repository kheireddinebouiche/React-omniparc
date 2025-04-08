import { useEffect } from 'react';
import { useToast } from '@chakra-ui/react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  open?: boolean;
  severity?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
}

export const Notification = ({ message, type, duration = 5000, open, severity, onClose }: NotificationProps) => {
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    
    const status = (type || severity || 'info') as 'success' | 'error' | 'warning' | 'info' | 'loading';

    toast({
      title: message,
      status,
      duration,
      isClosable: true,
      position: 'top-right',
      onCloseComplete: onClose,
    });
  }, [message, type, duration, toast, open, severity, onClose]);

  return null;
};

export default Notification; 