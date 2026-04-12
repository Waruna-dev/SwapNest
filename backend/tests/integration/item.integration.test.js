import request from "supertest";

import app from "../../app.js";
import Item from "../../models/Item.js";

const makeItem = (overrides = {}) => {
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  return {
    title: `Laptop ${suffix}`,
    description: "Lightly used laptop",
    price: 125000,
    category: "Electronics",
    mode: "SWAP",
    condition: "Good",
    contact: "0771234567",
    ownerId: `owner_${suffix}`,
    images: [
      {
        url: `https://example.com/item-${suffix}.jpg`,
        publicId: `external_${suffix}`,
      },
    ],
    coverImage: {
      url: `https://example.com/item-${suffix}.jpg`,
      publicId: `external_${suffix}`,
    },
    isActive: true,
    isHidden: false,
    ...overrides,
  };
};

describe("Item Integration", () => {
  test("POST /api/items should create a new item", async () => {
    const payload = makeItem();

    const response = await request(app).post("/api/items").send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("_id");
    expect(response.body).toHaveProperty("itemId");
    expect(response.body.title).toBe(payload.title);
    expect(response.body.images).toHaveLength(1);

    const itemInDb = await Item.findById(response.body._id).lean();
    expect(itemInDb).toBeTruthy();
    expect(itemInDb.title).toBe(payload.title);
  });

  test("POST /api/items should reject request when images are missing", async () => {
    const payload = makeItem({ images: [], coverImage: null });

    const response = await request(app).post("/api/items").send(payload);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("At least 1 image is required");
  });

  test("GET /api/items should return paginated active, visible items by default", async () => {
    await Item.create([
      makeItem({ title: "Visible Active Item" }),
      makeItem({ title: "Hidden Item", isHidden: true }),
      makeItem({ title: "Inactive Item", isActive: false }),
    ]);

    const response = await request(app).get("/api/items?page=1&limit=10&sort=newest");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.totalItems).toBe(1);
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(10);
    expect(response.body.totalPages).toBe(1);
    expect(response.body.items[0].title).toBe("Visible Active Item");
  });

  test("GET /api/items should include hidden/inactive when query flags are enabled", async () => {
    await Item.create([
      makeItem({ title: "Visible Active Item" }),
      makeItem({ title: "Hidden Item", isHidden: true }),
      makeItem({ title: "Inactive Item", isActive: false }),
    ]);

    const response = await request(app).get(
      "/api/items?includeInactive=true&includeHidden=true&sort=newest",
    );

    expect(response.status).toBe(200);
    expect(response.body.totalItems).toBe(3);
    const titles = response.body.items.map((item) => item.title);
    expect(titles).toEqual(expect.arrayContaining(["Visible Active Item", "Hidden Item", "Inactive Item"]));
  });

  test("GET /api/items should apply filters and sorting for listing", async () => {
    await Item.create([
      makeItem({ title: "Electronics High", category: "Electronics", mode: "SWAP", condition: "Good", price: 180000 }),
      makeItem({ title: "Electronics Mid", category: "Electronics", mode: "SWAP", condition: "Good", price: 120000 }),
      makeItem({ title: "Furniture Item", category: "Furniture", mode: "SWAP", condition: "Good", price: 90000 }),
      makeItem({ title: "Electronics SELL", category: "Electronics", mode: "SELL", condition: "Good", price: 130000 }),
      makeItem({ title: "Electronics Fair", category: "Electronics", mode: "SWAP", condition: "Fair", price: 110000 }),
    ]);

    const response = await request(app).get(
      "/api/items?category=Electronics&mode=SWAP&condition=Good&minPrice=100000&maxPrice=200000&sort=price_desc",
    );

    expect(response.status).toBe(200);
    expect(response.body.totalItems).toBe(2);
    expect(response.body.items[0].title).toBe("Electronics High");
    expect(response.body.items[1].title).toBe("Electronics Mid");
  });
});
