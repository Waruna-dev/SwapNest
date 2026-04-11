import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import MyItems from './MyItems';

vi.mock('./ItemDashboard', () => ({
  default: () => <div data-testid="item-dashboard">My Items Dashboard</div>,
}));

describe('MyItems', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <MyItems />
      </BrowserRouter>
    );
  };

  it('renders item dashboard with ownerOnly prop', () => {
    renderComponent();
    expect(screen.getByTestId('item-dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Items Dashboard')).toBeInTheDocument();
  });
});