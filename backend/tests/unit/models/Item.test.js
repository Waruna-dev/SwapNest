import Item from '../../../models/Item.js';

describe('Item Model', () => {
  it('should generate a default itemId', () => {
    const item = new Item({
      title: 'Test Item',
      category: 'Electronics',
      mode: 'Swap',
      ownerId: 'owner123'
    });

    expect(item.itemId).toBeDefined();
    expect(item.itemId).toMatch(/^itm_/);
  });

  it('should fail validation if title is missing', async () => {
    const item = new Item({
      category: 'Electronics',
      mode: 'Swap',
      ownerId: 'owner123'
    });

    const err = item.validateSync();
    expect(err.errors.title).toBeDefined();
  });

  it('should fail validation if category is missing', async () => {
    const item = new Item({
      title: 'Test Item',
      mode: 'Swap',
      ownerId: 'owner123'
    });

    const err = item.validateSync();
    expect(err.errors.category).toBeDefined();
  });

  it('should validate coordinates in location', () => {
    const item = new Item({
      title: 'Test Item',
      category: 'Electronics',
      mode: 'Swap',
      ownerId: 'owner123',
      location: {
        type: 'Point',
        coordinates: [80.0, 7.0]
      }
    });

    const err = item.validateSync();
    expect(err).toBeUndefined();
  });

  it('should fail if coordinates are invalid', () => {
    const item = new Item({
      title: 'Test Item',
      category: 'Electronics',
      mode: 'Swap',
      ownerId: 'owner123',
      location: {
        type: 'Point',
        coordinates: ['invalid', 7.0]
      }
    });

    const err = item.validateSync();
    expect(err.errors['location.coordinates']).toBeDefined();
  });
});
