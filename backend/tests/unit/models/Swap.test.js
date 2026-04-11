import Swap from '../../../models/Swap.js';

describe('Swap Model', () => {
  it('should auto-generate requestId before validation', async () => {
    const swap = new Swap({
      requestedItem: {
        itemId: 'itm123',
        name: 'Item A',
        ownerName: 'Owner A',
        ownerId: 'user123',
        condition: 'Good'
      },
      requesterId: 'user456',
      requesterName: 'User B',
      swapType: 'item-for-item',
      agreementAccepted: true
    });

    await swap.validate();
    expect(swap.requestId).toBeDefined();
    expect(swap.requestId).toMatch(/^SWP-\d{6}-\d+/);
  });

  it('should fail if agreementAccepted is false', async () => {
    const swap = new Swap({
      requestedItem: {
        itemId: 'itm123',
        name: 'Item A',
        ownerName: 'Owner A',
        ownerId: 'user123',
        condition: 'Good'
      },
      requesterId: 'user456',
      requesterName: 'User B',
      swapType: 'item-for-item',
      agreementAccepted: false
    });

    let err;
    try {
      await swap.validate();
    } catch (e) {
      err = e;
    }
    expect(err.errors.agreementAccepted).toBeDefined();
  });

  it('should respect status enum values', async () => {
    const swap = new Swap({ status: 'invalid-status' });
    const err = swap.validateSync();
    expect(err.errors.status).toBeDefined();
  });
});
