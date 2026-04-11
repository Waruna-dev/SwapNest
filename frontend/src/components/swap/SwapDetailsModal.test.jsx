import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SwapDetailsModal from './SwapDetailsModal';

vi.mock('../common/StatusBadge', () => ({
  default: ({ status }) => <span data-testid="status-badge">{status}</span>,
}));

describe('SwapDetailsModal', () => {
  const mockSwap = {
    _id: 'swap123',
    requestId: 'SWP-001',
    status: 'pending',
    swapType: 'item-for-item',
    requesterId: 'user456',
    requesterName: 'Bob Johnson',
    requestedItem: {
      name: 'Vintage Camera',
      condition: 'Good',
      ownerId: 'owner123',
      ownerName: 'Alice Smith',
      description: 'Fully functional vintage camera',
      photos: [{ url: '/uploads/camera.jpg' }],
    },
    offeredItem: {
      name: 'Old Lens',
      condition: 'Like New',
      description: 'Crystal clear glass',
      photos: [{ url: '/uploads/lens.jpg' }],
    },
    messageToOwner: 'I really want this camera!',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
  };

  const onClose = vi.fn();

  const renderComponent = () => {
    return render(<SwapDetailsModal swap={mockSwap} onClose={onClose} />);
  };

  it('renders modal with swap details', () => {
    renderComponent();

    expect(screen.getByText('Swap Details')).toBeInTheDocument();
    expect(screen.getByText('SWP-001')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  it('displays requested item information', () => {
    renderComponent();

    expect(screen.getByText('Requested Item')).toBeInTheDocument();
    expect(screen.getByText('Vintage Camera')).toBeInTheDocument();
    expect(screen.getByText('Condition: Good')).toBeInTheDocument();
    expect(screen.getByText('Fully functional vintage camera')).toBeInTheDocument();
  });

  it('displays offered item information', () => {
    renderComponent();

    expect(screen.getByText('Offered Item')).toBeInTheDocument();
    expect(screen.getByText('Old Lens')).toBeInTheDocument();
    expect(screen.getByText('Condition: Like New')).toBeInTheDocument();
  });

  it('displays requester and owner information', () => {
    renderComponent();

    expect(screen.getByText('Requester')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
  });

  it('displays message to owner', () => {
    renderComponent();

    expect(screen.getByText('Message to Owner')).toBeInTheDocument();
    expect(screen.getByText('"I really want this camera!"')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', () => {
    renderComponent();

    const closeButton = screen.getByText('×');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});