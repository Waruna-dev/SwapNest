import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import NotificationBell from './NotificationBell';
import { getUserNotifications, getUnreadCount, markAsRead } from '../services/notificationService';

// Mock notification services
vi.mock('../services/notificationService', () => ({
  getUserNotifications: vi.fn(),
  getUnreadCount: vi.fn(),
  markAsRead: vi.fn(),
  markAllAsRead: vi.fn(),
}));

describe('NotificationBell Component', () => {
  const userId = 'user123';
  const mockOnNotificationClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches unread count on mount', async () => {
    getUnreadCount.mockResolvedValue({ count: 5 });

    render(<NotificationBell userId={userId} onNotificationClick={mockOnNotificationClick} />);

    await waitFor(() => {
      expect(getUnreadCount).toHaveBeenCalledWith(userId);
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  it('opens dropdown and fetches notifications on click', async () => {
    getUnreadCount.mockResolvedValue({ count: 1 });
    getUserNotifications.mockResolvedValue({
      data: [{ _id: 'n1', title: 'New Swap', message: 'Hello', type: 'swap_request', read: false }],
      unreadCount: 1
    });

    render(<NotificationBell userId={userId} onNotificationClick={mockOnNotificationClick} />);

    const bellBtn = screen.getByRole('button');
    fireEvent.click(bellBtn);

    await waitFor(() => {
      expect(getUserNotifications).toHaveBeenCalledWith(userId);
      expect(screen.getByText('New Swap')).toBeInTheDocument();
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
  });

  it('handles notification click and marks as read', async () => {
    getUnreadCount.mockResolvedValue({ count: 1 });
    const mockNotification = { _id: 'n1', title: 'New Swap', swapId: 's1', read: false };
    getUserNotifications.mockResolvedValue({ data: [mockNotification], unreadCount: 1 });
    markAsRead.mockResolvedValue({ success: true });

    render(<NotificationBell userId={userId} onNotificationClick={mockOnNotificationClick} />);

    // Open dropdown
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      const notificationItem = screen.getByText('New Swap');
      fireEvent.click(notificationItem);
    });

    await waitFor(() => {
      expect(markAsRead).toHaveBeenCalledWith('n1');
      expect(mockOnNotificationClick).toHaveBeenCalledWith('s1');
    });
  });
});
