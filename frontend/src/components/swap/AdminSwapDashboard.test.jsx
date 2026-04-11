import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AdminSwapDashboard from './AdminSwapDashboard';
import { getAllSwaps, deleteSwap } from '../../services/swapService';

vi.mock('../../services/swapService', () => ({
  getAllSwaps: vi.fn(),
  deleteSwap: vi.fn(),
}));

vi.mock('../common/StatusBadge', () => ({
  default: ({ status }) => <span data-testid="status-badge">{status}</span>,
}));

vi.mock('./SwapDetailsModal', () => ({
  default: ({ swap, onClose }) => (
    <div data-testid="swap-details-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

describe('AdminSwapDashboard', () => {
  const mockSwaps = [
    {
      _id: '1',
      requestId: 'SWP-001',
      status: 'pending',
      swapType: 'item-for-item',
      requestedItem: { name: 'Camera', ownerName: 'Alice' },
      offeredItem: { name: 'Lens', condition: 'Good' },
      requesterName: 'Bob',
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      requestId: 'SWP-002',
      status: 'accepted',
      swapType: 'swap-with-cash',
      requestedItem: { name: 'Laptop', ownerName: 'Charlie' },
      cashDetails: { amount: 5000 },
      requesterName: 'David',
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    getAllSwaps.mockResolvedValue({ data: mockSwaps });
  });

  const renderComponent = () => {
    return render(<AdminSwapDashboard />);
  };

  it('renders dashboard title and stats', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Manage Swaps')).toBeInTheDocument();
      expect(screen.getByText('Total Swaps')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('displays swap table with data', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('SWP-001')).toBeInTheDocument();
      expect(screen.getByText('Camera')).toBeInTheDocument();
      expect(screen.getByText('SWP-002')).toBeInTheDocument();
    });
  });

  it('filters swaps by search term', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('SWP-001')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by request ID/i);
    fireEvent.change(searchInput, { target: { value: 'SWP-002' } });

    await waitFor(() => {
      expect(screen.queryByText('SWP-001')).not.toBeInTheDocument();
      expect(screen.getByText('SWP-002')).toBeInTheDocument();
    });
  });

  it('opens modal when view button is clicked', async () => {
    renderComponent();

    await waitFor(() => {
      const viewButtons = screen.getAllByText('View');
      fireEvent.click(viewButtons[0]);
    });

    expect(screen.getByTestId('swap-details-modal')).toBeInTheDocument();
  });
});