import request from "supertest";
import bcrypt from "bcryptjs";

import app from "../../app.js";
import User from "../../models/User.js";
import Item from "../../models/Item.js";
import Swap from "../../models/Swap.js";

const makeSuffix = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const createUser = async (role = "user") => {
  const suffix = makeSuffix();
  const password = await bcrypt.hash("Password123!", 10);

  return User.create({
    username: `user_${suffix}`,
    email: `user_${suffix}@example.com`,
    password,
    role,
  });
};

const createItemForOwner = async (ownerId) => {
  const suffix = makeSuffix();
  return Item.create({
    title: `Phone ${suffix}`,
    description: "Almost new phone",
    price: 80000,
    category: "Electronics",
    mode: "SWAP",
    condition: "Good",
    ownerId: String(ownerId),
    images: [
      {
        url: `https://example.com/phone-${suffix}.jpg`,
        publicId: `external_${suffix}`,
      },
    ],
    coverImage: {
      url: `https://example.com/phone-${suffix}.jpg`,
      publicId: `external_${suffix}`,
    },
    isActive: true,
  });
};

const makeSwapPayload = (item, requester) => ({
  itemId: String(item._id),
  requesterId: String(requester._id),
  requesterName: requester.username,
  swapType: "item-for-item",
  offeredItem: {
    name: "Headphones",
    condition: "Good",
    description: "Wireless headphones",
  },
  messageToOwner: "Interested in swapping",
  agreementAccepted: true,
});

describe("Swap Integration", () => {
  test("POST /api/swaps should create swap and deactivate item", async () => {
    const owner = await createUser();
    const requester = await createUser();
    const item = await createItemForOwner(owner._id);

    const response = await request(app).post("/api/swaps").send(makeSwapPayload(item, requester));

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.requestedItem.itemId).toBe(String(item._id));

    const itemInDb = await Item.findById(item._id).lean();
    expect(itemInDb.isActive).toBe(false);
  });

  test("POST /api/swaps should reject swapping your own item", async () => {
    const owner = await createUser();
    const item = await createItemForOwner(owner._id);

    const response = await request(app)
      .post("/api/swaps")
      .send(makeSwapPayload(item, owner));

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Cannot swap your own item");
  });

  test("GET /api/swaps/pending/:ownerId should list pending requests", async () => {
    const owner = await createUser();
    const requester = await createUser();
    const item = await createItemForOwner(owner._id);
    const createdSwap = await request(app)
      .post("/api/swaps")
      .send(makeSwapPayload(item, requester));

    const response = await request(app).get(`/api/swaps/pending/${owner._id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]._id).toBe(createdSwap.body.data._id);
  });

  test("GET /api/swaps/pending/:ownerId should return empty list when no pending swaps exist", async () => {
    const owner = await createUser();

    const response = await request(app).get(`/api/swaps/pending/${owner._id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(0);
  });

  test("PUT /api/swaps/:id/status should reject and reactivate item", async () => {
    const owner = await createUser();
    const requester = await createUser();
    const item = await createItemForOwner(owner._id);

    const createdSwap = await request(app)
      .post("/api/swaps")
      .send(makeSwapPayload(item, requester));

    const response = await request(app)
      .put(`/api/swaps/${createdSwap.body.data._id}/status`)
      .send({ status: "rejected" });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("rejected");

    const itemInDb = await Item.findById(item._id).lean();
    expect(itemInDb.isActive).toBe(true);
  });

  test("PUT /api/swaps/:id/status should reject invalid status", async () => {
    const owner = await createUser();
    const requester = await createUser();
    const item = await createItemForOwner(owner._id);

    const createdSwap = await request(app)
      .post("/api/swaps")
      .send(makeSwapPayload(item, requester));

    const response = await request(app)
      .put(`/api/swaps/${createdSwap.body.data._id}/status`)
      .send({ status: "invalid-status" });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(Array.isArray(response.body.errors)).toBe(true);
  });

  test("PUT /api/swaps/:id/cancel should cancel pending swap and reactivate item", async () => {
    const owner = await createUser();
    const requester = await createUser();
    const item = await createItemForOwner(owner._id);

    const createdSwap = await request(app)
      .post("/api/swaps")
      .send(makeSwapPayload(item, requester));

    const response = await request(app).put(`/api/swaps/${createdSwap.body.data._id}/cancel`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe("cancelled");

    const itemInDb = await Item.findById(item._id).lean();
    expect(itemInDb.isActive).toBe(true);

    const swapInDb = await Swap.findById(createdSwap.body.data._id).lean();
    expect(swapInDb.status).toBe("cancelled");
  });

  test("PUT /api/swaps/:id/cancel should reject cancelling non-pending swap", async () => {
    const owner = await createUser();
    const requester = await createUser();
    const item = await createItemForOwner(owner._id);

    const createdSwap = await request(app)
      .post("/api/swaps")
      .send(makeSwapPayload(item, requester));

    await request(app)
      .put(`/api/swaps/${createdSwap.body.data._id}/status`)
      .send({ status: "rejected" });

    const response = await request(app).put(`/api/swaps/${createdSwap.body.data._id}/cancel`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Only pending swaps can be cancelled");
  });
});
