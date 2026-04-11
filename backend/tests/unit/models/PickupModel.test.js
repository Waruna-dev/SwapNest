import Pickup from '../../../models/PickupModel.js';

describe('Pickup Model', () => {
  it('should fail if address is missing for pickup method', async () => {
    const pickup = new Pickup({
      name: 'John Doe',
      phone: '123456789',
      method: 'pickup',
      date: new Date()
    });

    let err;
    try {
      await pickup.validate();
    } catch (e) {
      err = e;
    }
    expect(err.errors.address).toBeDefined();
  });

  it('should fail if center is missing for center method', async () => {
    const pickup = new Pickup({
      name: 'John Doe',
      phone: '123456789',
      method: 'center',
      date: new Date()
    });

    let err;
    try {
      await pickup.validate();
    } catch (e) {
      err = e;
    }
    expect(err.errors.center).toBeDefined();
  });

  it('should pass if pickup method has address', async () => {
    const pickup = new Pickup({
      name: 'John Doe',
      phone: '123456789',
      method: 'pickup',
      address: '123 Test St',
      date: new Date()
    });

    const err = pickup.validateSync();
    expect(err).toBeUndefined();
  });
});
