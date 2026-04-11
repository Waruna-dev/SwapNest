import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from './Header';

// Mock the API service
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: { profilePic: 'mock-pic.jpg' } }),
  },
}));

describe('Header Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderHeader = () => {
    return render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );
  };

  it('renders correctly with navigation links', () => {
    renderHeader();
    expect(screen.getByText('SwapNest')).toBeInTheDocument();
    expect(screen.getAllByText('Discover')[0]).toBeInTheDocument();
  });

  it('shows Sign In and Sign Up buttons when user is not logged in', () => {
    renderHeader();
    expect(screen.getAllByText('Sign In')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Sign Up')[0]).toBeInTheDocument();
  });

  it('shows dashboard link when user is logged in', async () => {
    localStorage.setItem('swapnest_token', 'fake-token');
    renderHeader();
    
    await waitFor(() => {
      expect(screen.getByTitle('Go to Dashboard')).toBeInTheDocument();
    });
  });
});