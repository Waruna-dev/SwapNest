import Volunteer from '../../../models/VolunteerModel.js';

describe('Volunteer Model', () => {
  it('should fail validation if firstName is missing', () => {
    const volunteer = new Volunteer({
      lastName: 'Doe',
      email: 'john@example.com',
      nic: '123456789V',
      dob: new Date()
    });

    const err = volunteer.validateSync();
    expect(err.errors.firstName).toBeDefined();
  });

  it('should fail if email is missing', () => {
    const volunteer = new Volunteer({
      firstName: 'John',
      lastName: 'Doe',
      nic: '123456789V',
      dob: new Date()
    });

    const err = volunteer.validateSync();
    expect(err.errors.email).toBeDefined();
  });

  it('should have default boolean values as false', () => {
    const volunteer = new Volunteer({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      nic: '123456789V',
      dob: new Date()
    });

    expect(volunteer.hasVehicle).toBe(false);
    expect(volunteer.hasLicense).toBe(false);
    expect(volunteer.agreeTerms).toBe(false);
  });
});
