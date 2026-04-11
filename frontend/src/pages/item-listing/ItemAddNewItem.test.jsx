import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import ItemAddNewItem from './ItemAddNewItem';
import { createItem } from '../../services/item/itemApi';

// Mock services
vi.mock('../../services/item/itemApi', () => ({
  createItem: vi.fn(),
}));

// Mock child components to match actual structure
vi.mock('../../components/item-listing/AddItemNavbar', () => ({
  default: () => <nav data-testid="add-item-navbar">AddItemNavbar</nav>,
}));

vi.mock('../../components/item-listing/AddItemPreview', () => ({
  default: ({ formData }) => (
    <div data-testid="add-item-preview">
      <h2>Live Item Preview</h2>
      <p>{formData?.title || 'No title'}</p>
    </div>
  ),
}));

vi.mock('../../components/item-listing/ItemFormSection', () => ({
  default: ({ handleSubmit, isSubmitting }) => (
    <div data-testid="item-form-section">
      <form onSubmit={handleSubmit}>
        <button type="submit" data-testid="submit-btn">
          {isSubmitting ? 'Creating...' : 'Create Item'}
        </button>
      </form>
    </div>
  ),
}));

vi.mock('../../components/item-listing/StatusDialog', () => ({
  default: ({ open, message }) => open ? <div data-testid="status-dialog">{message}</div> : null,
}));

// Mock hooks
vi.mock('../../hooks/useItemForm', () => ({
  useItemForm: vi.fn(() => ({
    formData: { title: 'Test Item', description: 'Test Description', ownerId: '123' },
    setFormData: vi.fn(),
    images: [new File([''], 'test.png')],
    imagePreviews: [{ name: 'test.png', url: 'mock-url' }],
    status: { type: '', message: '' },
    setStatus: vi.fn(),
    isSubmitting: false,
    setIsSubmitting: vi.fn(),
    handleChange: vi.fn(),
    handleImageChange: vi.fn(),
    removeImage: vi.fn(),
    resetForm: vi.fn(),
  })),
}));

vi.mock('../../hooks/useLocationPicker', () => ({
  useLocationPicker: vi.fn(() => ({
    mapRef: { current: null },
    locationSearch: '',
    setLocationSearch: vi.fn(),
    selectedAddress: '',
    locationState: { lat: 0, lng: 0 },
    handleUseCurrentLocation: vi.fn(),
    handleLocationSearch: vi.fn(),
  })),
}));

vi.mock('react-leaflet', () => ({
  MapContainer: () => <div data-testid="map-container" />,
  TileLayer: () => null,
  Marker: () => null,
  useMapEvents: () => null,
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ItemAddNewItem Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem('swapnest_token', 'fake-token');
    global.URL.createObjectURL = vi.fn(() => 'mock-url');
    global.URL.revokeObjectURL = vi.fn();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ItemAddNewItem />
      </BrowserRouter>
    );
  };

  it('renders correctly with form sections', () => {
    renderComponent();
    
    // Check that main components render
    expect(screen.getByTestId('add-item-navbar')).toBeInTheDocument();
    expect(screen.getByTestId('add-item-preview')).toBeInTheDocument();
    expect(screen.getByTestId('item-form-section')).toBeInTheDocument();
    expect(screen.getByText('Live Item Preview')).toBeInTheDocument();
  });

  it('submits form successfully when state is valid', async () => {
    createItem.mockResolvedValue({ data: { itemId: 'item_123' } });

    renderComponent();

    const submitBtn = screen.getByTestId('submit-btn');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(createItem).toHaveBeenCalled();
    });
  });
});