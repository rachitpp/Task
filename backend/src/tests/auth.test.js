const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../server");
const User = require("../models/User");

const request = supertest(app);

// Test user data
const testUser = {
  name: "Test User",
  email: "test@example.com",
  password: "Password123",
};

// Connect to test database before running tests
beforeAll(async () => {
  // Use a separate test database
  const mongoUri =
    process.env.MONGO_URI ||
    "mongodb://localhost:27017/task-management-system-test";
  await mongoose.connect(mongoUri);
});

// Clean up database after tests
afterAll(async () => {
  // Remove test user
  await User.deleteMany({});
  // Close database connection
  await mongoose.connection.close();
});

// Clean up before each test
beforeEach(async () => {
  // Remove test user
  await User.deleteMany({});
});

describe("Authentication", () => {
  it("should register a new user", async () => {
    const response = await request
      .post("/api/auth/register")
      .send(testUser)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(testUser.name);
    expect(response.body.data.email).toBe(testUser.email);
    expect(response.body.data.role).toBe("user");
    expect(response.body.data.password).toBeUndefined();
  });

  it("should not register a user with invalid email", async () => {
    const invalidUser = {
      ...testUser,
      email: "invalid-email",
    };

    const response = await request
      .post("/api/auth/register")
      .send(invalidUser)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });

  it("should not register a user with weak password", async () => {
    const weakPasswordUser = {
      ...testUser,
      password: "weak",
    };

    const response = await request
      .post("/api/auth/register")
      .send(weakPasswordUser)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });

  it("should login with valid credentials", async () => {
    // First register a user
    await request.post("/api/auth/register").send(testUser);

    // Then try to login
    const response = await request
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(testUser.name);
    expect(response.body.data.email).toBe(testUser.email);
    expect(response.header["set-cookie"]).toBeDefined();
  });

  it("should not login with invalid credentials", async () => {
    // Register a user
    await request.post("/api/auth/register").send(testUser);

    // Try to login with wrong password
    const response = await request
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: "wrongpassword",
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid email or password");
  });

  it("should get user profile when authenticated", async () => {
    // Register a user
    const registerResponse = await request
      .post("/api/auth/register")
      .send(testUser);
    const cookies = registerResponse.headers["set-cookie"];

    // Get user profile with cookie
    const response = await request
      .get("/api/auth/me")
      .set("Cookie", cookies)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe(testUser.name);
    expect(response.body.data.email).toBe(testUser.email);
  });

  it("should not get user profile when not authenticated", async () => {
    const response = await request.get("/api/auth/me").expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Not authorized, no token provided");
  });
});
