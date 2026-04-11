import Notification from '../../../models/Notification.js';

describe('Notification Model', () => {
  it('should fail validation if userId is missing', () => {
    const notification = new Notification({
      type: 'swap_request',
      title: 'New Swap',
      message: 'You have a new swap request'
    });

    const err = notification.validateSync();
    expect(err.errors.userId).toBeDefined();
  });

  it('should fail if type is not in enum', () => {
    const notification = new Notification({
      userId: 'user123',
      type: 'invalid_type',
      title: 'New Swap',
      message: 'You have a new swap request'
    });

    const err = notification.validateSync();
    expect(err.errors.type).toBeDefined();
  });

  it('should default read to false', () => {
    const notification = new Notification({
      userId: 'user123',
      type: 'swap_request',
      title: 'New Swap',
      message: 'You have a new swap request'
    });

    expect(notification.read).toBe(false);
  });
});
