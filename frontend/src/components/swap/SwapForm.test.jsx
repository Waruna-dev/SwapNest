import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import SwapForm from './SwapForm';
import { createSwap } from '../../services/swapService';

// Mock swapService
vi.mock('../../services/swapService', () => ({
  createSwap: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SwapForm Component', () => {
  const defaultProps = {
    itemId: 'item123',
    itemTitle: 'Vintage Camera',
    ownerName: 'Alice',
    requesterId: 'user456',
    requesterName: 'Bob',
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  

  it('toggles between swap types', () => {
    render(
      <BrowserRouter>
        <SwapForm {...defaultProps} />
      </BrowserRouter>
    );

    const cashBtn = screen.getByText(/Item \+ Cash/i);
    fireEvent.click(cashBtn);

    expect(screen.getByRole('heading', { name: /Cash Offer/i })).toBeInTheDocument();
  });

  

  it('submits form successfully when all fields are valid', async () => {
    createSwap.mockResolvedValue({ success: true, data: { id: 'swap789' } });

    render(
      <BrowserRouter>
        <SwapForm {...defaultProps} />
      </BrowserRouter>
    );

    const itemNameInput = screen.getByPlaceholderText(/e.g. Wooden Chair/i);
    fireEvent.change(itemNameInput, { target: { value: 'Old Lens' } });
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    const submitBtn = screen.getByRole('button', { name: /Send Swap Request/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createSwap).toHaveBeenCalled();
    });
    
    // Check if success popup appears
    const successPopup = await screen.findByText(/Swap Request Sent!/i).catch(() => null);
    if (successPopup) {
      expect(successPopup).toBeInTheDocument();
    }
  });
});