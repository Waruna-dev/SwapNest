import request from "supertest";
import bcrypt from "bcryptjs";

import app from "../../app.js";
import User from "../../models/User.js";

const uniqueUser = () => {
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return {
    username: `user_${suffix}`,
    email: `user_${suffix}@example.com`,
    password: "Password123!",
  };
};

describe("Auth Integration", () => {
  test("GET / should return API heartbeat response", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "SwapNest API is running..." });
  });

  test("POST /api/users/register should create a user and return token", async () => {
    const payload = uniqueUser();
    const response = await request(app).post("/api/users/register").send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body.email).toBe(payload.email);
    expect(response.body.role).toBe("user");

    const userInDb = await User.findOne({ email: payload.email }).lean();
    expect(userInDb).toBeTruthy();
    expect(userInDb.password).not.toBe(payload.password);
  });

  test("POST /api/users/register should reject duplicate email", async () => {
    const payload = uniqueUser();
    await request(app).post("/api/users/register").send(payload);

    const duplicateResponse = await request(app)
      .post("/api/users/register")
      .send({ ...payload, username: `${payload.username}_2` });

    expect(duplicateResponse.status).toBe(400);
    expect(duplicateResponse.body.message).toBe("User already exists");
  });

  test("POST /api/users/login should authenticate existing non-admin user", async () => {
    const payload = uniqueUser();
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    await User.create({
      username: payload.username,
      email: payload.email,
      password: hashedPassword,
      role: "user",
    });

    const loginResponse = await request(app).post("/api/users/login").send({
      email: payload.email,
      password: payload.password,
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("token");
    expect(loginResponse.body.email).toBe(payload.email);
  });

  test("GET /api/users/me should return authenticated user profile", async () => {
    const payload = uniqueUser();
    const registerResponse = await request(app).post("/api/users/register").send(payload);
    const token = registerResponse.body.token;

    const meResponse = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.email).toBe(payload.email);
    expect(meResponse.body).not.toHaveProperty("password");
  });

  test("POST /api/users/login should block admin access via standard portal", async () => {
    const payload = uniqueUser();
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    await User.create({
      username: payload.username,
      email: payload.email,
      password: hashedPassword,
      role: "admin",
    });

    const loginResponse = await request(app).post("/api/users/login").send({
      email: payload.email,
      password: payload.password,
    });

    expect(loginResponse.status).toBe(403);
    expect(loginResponse.body.message).toContain("Administrators are not permitted");
  });
});
