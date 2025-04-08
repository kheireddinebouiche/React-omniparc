import { useNotification } from '../contexts/NotificationContext';
import Notification from './Notification';

const NotificationContainer = () => {
  const { notification, hideNotification } = useNotification();

  return (
    <Notification
      open={notification.open}
      message={notification.message}
      severity={notification.severity}
      onClose={hideNotification}
    />
  );
};

export default NotificationContainer; 