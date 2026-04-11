import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from './Register';
import API from '../services/api';

// Mock Google OAuth
vi.mock('@react-oauth/google', () => ({
  GoogleOAuthProvider: ({ children }) => <>{children}</>,
  useGoogleLogin: vi.fn(() => vi.fn()),
}));

// Mock API and useNavigate
vi.mock('../services/api');
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Register Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderRegister = () => {
    return render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  };

  it('renders registration form correctly with all fields', () => {
    renderRegister();
    expect(screen.getByText(/Create your account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Evelyn Thorne/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/hello@example.com/i)).toBeInTheDocument();
  });

  it('validates password strength in real-time as user types', async () => {
    renderRegister();
    const passwordInputs = screen.getAllByPlaceholderText('••••••••••••');
    const passwordField = passwordInputs[0];
    
    fireEvent.change(passwordField, { target: { value: 'StrongPass123!' } });
    
    await waitFor(() => {
      expect(screen.getByText(/8\+ Chars/i)).toBeInTheDocument();
    });
  });

  it('submits form successfully and navigates to dashboard on valid input', async () => {
    API.post.mockResolvedValue({ data: { token: 'fake-token' } });

    renderRegister();

    fireEvent.change(screen.getByPlaceholderText(/Evelyn Thorne/i), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText(/hello@example.com/i), { target: { value: 'test@test.com' } });
    
    const passwordInputs = screen.getAllByPlaceholderText('••••••••••••');
    fireEvent.change(passwordInputs[0], { target: { value: 'StrongPass123!' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'StrongPass123!' } });

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(API.post).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });
});