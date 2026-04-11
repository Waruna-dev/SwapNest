import Center from '../../../models/CenterModel.js';

describe('Center Model', () => {
  it('should fail if district is not in enum', () => {
    const center = new Center({
      centerName: 'Test Center',
      district: 'Invalid District',
      city: 'City',
      address: 'Address',
      contactNumber: '123',
      email: 'test@center.com',
      managerName: 'Manager',
      managerContact: '456',
      capacity: 10
    });

    const err = center.validateSync();
    expect(err.errors.district).toBeDefined();
  });

  it('should fail if capacity is less than 1', () => {
    const center = new Center({
      centerName: 'Test Center',
      district: 'Colombo',
      city: 'City',
      address: 'Address',
      contactNumber: '123',
      email: 'test@center.com',
      managerName: 'Manager',
      managerContact: '456',
      capacity: 0
    });

    const err = center.validateSync();
    expect(err.errors.capacity).toBeDefined();
  });

  it('should default status to Active', () => {
    const center = new Center({
      centerName: 'Test Center',
      district: 'Colombo',
      city: 'City',
      address: 'Address',
      contactNumber: '123',
      email: 'test@center.com',
      managerName: 'Manager',
      managerContact: '456',
      capacity: 10
    });

    expect(center.status).toBe('Active');
  });
});
