import request from "supertest";

import app from "../../app.js";

const uniqueUser = () => {
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return {
    username: `user_${suffix}`,
    email: `user_${suffix}@example.com`,
    password: "Password123!",
  };
};

describe("User Integration", () => {
  test("PUT /api/users/profile should update username and bio", async () => {
    const payload = uniqueUser();
    const registerResponse = await request(app).post("/api/users/register").send(payload);
    const token = registerResponse.body.token;

    const profileResponse = await request(app)
      .put("/api/users/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "updated_username",
        bio: "Updated bio from integration test",
      });

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.username).toBe("updated_username");
    expect(profileResponse.body.bio).toBe("Updated bio from integration test");
  });

  test("PUT /api/users/profile should reject unauthenticated request", async () => {
    const response = await request(app).put("/api/users/profile").send({
      username: "updated_username",
      bio: "Updated bio from integration test",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toContain("Not authorized");
  });

  test("PUT /api/users/password should update password for authenticated user", async () => {
    const payload = uniqueUser();
    await request(app).post("/api/users/register").send(payload);

    const loginResponse = await request(app).post("/api/users/login").send({
      email: payload.email,
      password: payload.password,
    });
    const token = loginResponse.body.token;

    const passwordResponse = await request(app)
      .put("/api/users/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        oldPassword: payload.password,
        newPassword: "NewPassword123!",
      });

    expect(passwordResponse.status).toBe(200);
    expect(passwordResponse.body.message).toBe("Password updated successfully");

    const relogin = await request(app).post("/api/users/login").send({
      email: payload.email,
      password: "NewPassword123!",
    });
    expect(relogin.status).toBe(200);
  });

  test("PUT /api/users/password should reject incorrect old password", async () => {
    const payload = uniqueUser();
    const registerResponse = await request(app).post("/api/users/register").send(payload);
    const token = registerResponse.body.token;

    const passwordResponse = await request(app)
      .put("/api/users/password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        oldPassword: "WrongPassword123!",
        newPassword: "NewPassword123!",
      });

    expect(passwordResponse.status).toBe(400);
    expect(passwordResponse.body.message).toBe("Your old password is incorrect");
  });

  test("POST /api/users/logout should succeed for authenticated user", async () => {
    const payload = uniqueUser();
    const registerResponse = await request(app).post("/api/users/register").send(payload);
    const token = registerResponse.body.token;

    const logoutResponse = await request(app)
      .post("/api/users/logout")
      .set("Authorization", `Bearer ${token}`);

    expect(logoutResponse.status).toBe(200);
    expect(logoutResponse.body.message).toBe("Successfully logged out.");
  });

  test("POST /api/users/logout should reject unauthenticated request", async () => {
    const response = await request(app).post("/api/users/logout");

    expect(response.status).toBe(401);
    expect(response.body.message).toContain("Not authorized");
  });
});
