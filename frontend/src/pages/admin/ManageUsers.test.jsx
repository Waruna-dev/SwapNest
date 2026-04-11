import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import ManageUsers from './ManageUsers';
import API from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockUsers = [
  { _id: '1', username: 'john_doe', email: 'john@test.com', role: 'user' },
  { _id: '2', username: 'jane_doe', email: 'jane@test.com', role: 'volunteer' },
  { _id: '3', username: 'admin_user', email: 'admin@test.com', role: 'admin' },
];

describe('ManageUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('adminInfo', JSON.stringify({ token: 'fake-token', role: 'admin' }));
    API.get.mockResolvedValue({ data: mockUsers });
  });

  const renderComponent = () => {
    return render(<ManageUsers />);
  };

  it('renders user list after loading', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('john_doe')).toBeInTheDocument();
      expect(screen.getByText('jane_doe')).toBeInTheDocument();
      expect(screen.getByText('admin_user')).toBeInTheDocument();
    });
  });

  it('displays total users count', async () => {
    renderComponent();
    
    await waitFor(() => {
      // The text is split across two spans, so use a function matcher
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'Total Users: 3';
      })).toBeInTheDocument();
    });
  });

  it('shows edit modal when edit button is clicked', async () => {
    renderComponent();
    
    await waitFor(() => {
      const editButtons = screen.getAllByRole('button');
      // First edit button (skip the first button which might be something else)
      const editButton = editButtons.find(btn => btn.querySelector('svg.lucide-square-pen'));
      if (editButton) fireEvent.click(editButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Edit User')).toBeInTheDocument();
    });
  });

  it('shows delete confirmation modal when delete is clicked', async () => {
    renderComponent();
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons.find(btn => btn.querySelector('svg.lucide-trash-2'));
      if (deleteButton) fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Delete User/)).toBeInTheDocument();
    });
  });
});