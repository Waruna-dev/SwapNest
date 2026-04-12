import request from "supertest";

import app from "../../app.js";
import Volunteer from "../../models/VolunteerModel.js";

const makeVolunteerPayload = (overrides = {}) => {
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return {
    firstName: "Test",
    lastName: `Volunteer_${suffix}`,
    email: `volunteer_${suffix}@example.com`,
    phone: "0771234567",
    nic: `NIC${suffix}`,
    dob: "1998-05-10",
    gender: "Male",
    agreeTerms: true,
    agreePrivacy: true,
    agreeNotif: true,
    ...overrides,
  };
};

describe("Volunteer Integration", () => {
  test("POST /api/volunteers should create a new volunteer", async () => {
    const payload = makeVolunteerPayload();

    const response = await request(app).post("/api/volunteers").send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body.email).toBe(payload.email);
    expect(response.body.firstName).toBe(payload.firstName);

    const volunteerInDb = await Volunteer.findById(response.body._id).lean();
    expect(volunteerInDb).toBeTruthy();
    expect(volunteerInDb.nic).toBe(payload.nic);
  });

  test("POST /api/volunteers should reject duplicate email", async () => {
    const payload = makeVolunteerPayload();
    await request(app).post("/api/volunteers").send(payload);

    const duplicateResponse = await request(app)
      .post("/api/volunteers")
      .send({ ...payload, nic: `${payload.nic}_2` });

    expect(duplicateResponse.status).toBe(400);
    expect(duplicateResponse.body.message).toBe("Email already registered");
  });

  test("GET /api/volunteers should return volunteer list", async () => {
    const payload = makeVolunteerPayload();
    const created = await request(app).post("/api/volunteers").send(payload);

    const response = await request(app).get("/api/volunteers");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0]._id).toBe(created.body._id);
  });

  test("PUT /api/volunteers/:id should update volunteer fields", async () => {
    const payload = makeVolunteerPayload();
    const created = await request(app).post("/api/volunteers").send(payload);

    const updateResponse = await request(app)
      .put(`/api/volunteers/${created.body._id}`)
      .send({
        firstName: "Updated",
        city: "Colombo",
        hasVehicle: true,
      });

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.firstName).toBe("Updated");
    expect(updateResponse.body.city).toBe("Colombo");
    expect(updateResponse.body.hasVehicle).toBe(true);
  });

  test("PUT /api/volunteers/:id should reject invalid volunteer ID", async () => {
    const response = await request(app)
      .put("/api/volunteers/invalid-id")
      .send({ firstName: "Updated" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid volunteer ID");
  });

  test("DELETE /api/volunteers/:id should delete volunteer", async () => {
    const payload = makeVolunteerPayload();
    const created = await request(app).post("/api/volunteers").send(payload);

    const deleteResponse = await request(app).delete(`/api/volunteers/${created.body._id}`);
    expect(deleteResponse.status).toBe(204);

    const volunteerInDb = await Volunteer.findById(created.body._id).lean();
    expect(volunteerInDb).toBeNull();
  });
});
