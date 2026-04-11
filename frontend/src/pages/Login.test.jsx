import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import API from '../services/api';

// Mock the API service
vi.mock('../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock Google Login hook
vi.mock('@react-oauth/google', () => ({
  useGoogleLogin: vi.fn(() => vi.fn()),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Page', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  it('renders login form correctly', () => {
    renderLogin();
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('curator@swapnest.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    renderLogin();
    
    API.post.mockResolvedValue({ data: { token: 'fake-token' } });

    fireEvent.change(screen.getByPlaceholderText('curator@swapnest.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
    
    // Find only one "Sign In" button that is NOT the mobile menu toggle (if any)
    // The button has text "Sign In"
    const signInButton = screen.getAllByText('Sign In').find(el => el.tagName === 'BUTTON');
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(localStorage.getItem('swapnest_token')).toBe('fake-token');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows error on failed login', async () => {
    renderLogin();
    
    API.post.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } }
    });

    fireEvent.change(screen.getByPlaceholderText('curator@swapnest.com'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'wrongpassword' } });
    
    const signInButton = screen.getAllByText('Sign In').find(el => el.tagName === 'BUTTON');
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
