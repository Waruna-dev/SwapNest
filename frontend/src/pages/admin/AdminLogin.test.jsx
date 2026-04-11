import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AdminLogin from './AdminLogin';
import API from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AdminLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AdminLogin />
      </BrowserRouter>
    );
  };

  it('renders admin login form', () => {
    renderComponent();
    expect(screen.getByText('Admin Portal')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Admin Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
  });

  it('shows error on failed login', async () => {
    API.post.mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Admin Email'), { target: { value: 'wrong@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Access Dashboard/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('logs in successfully and navigates to dashboard', async () => {
    const mockToken = 'admin-token-123';
    API.post.mockResolvedValue({ 
      data: { token: mockToken, name: 'Admin User', role: 'admin' } 
    });

    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Admin Email'), { target: { value: 'admin@swapnest.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: /Access Dashboard/i }));

    await waitFor(() => {
      expect(localStorage.getItem('adminInfo')).toBeTruthy();
      expect(localStorage.getItem('swapnest_token')).toBe(mockToken);
      expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard');
    });
  });
});