import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Dashboard from './Dashboard';
import API from '../services/api';

// Mock API and useNavigate
vi.mock('../services/api');
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: {} }),
  };
});

// Mock child components to simplify testing
vi.mock('../components/swap/SwapList', () => ({ default: () => <div data-testid="swap-list" /> }));
vi.mock('../components/AcceptedSwapsCard', () => ({ default: () => <div data-testid="accepted-swaps" /> }));
vi.mock('../components/NotificationBell', () => ({ default: () => <div data-testid="notification-bell" /> }));

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('swapnest_token', 'fake-token');
  });

  it('redirects to login if no token is found', async () => {
    localStorage.clear();
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('renders user information after fetching from API', async () => {
    const mockUser = { _id: '123', username: 'JohnDoe', profilePic: null };
    API.get.mockResolvedValue({ data: mockUser });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, JohnDoe/i)).toBeInTheDocument();
    });
  });

  it('renders core dashboard sections', async () => {
    API.get.mockResolvedValue({ data: { _id: '123', username: 'JohnDoe' } });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('accepted-swaps')).toBeInTheDocument();
      expect(screen.getByText(/My List/i)).toBeInTheDocument();
    });
  });
});
