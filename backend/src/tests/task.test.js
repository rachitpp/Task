const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../server");
const User = require("../models/User");
const Task = require("../models/Task");

const request = supertest(app);

// Test user data
const testUser = {
  name: "Test User",
  email: "test@example.com",
  password: "Password123",
};

// Test task data
const testTask = {
  title: "Test Task",
  description: "This is a test task",
  priority: "medium",
  status: "to-do",
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
};

let authCookie;
let userId;

// Connect to test database before running tests
beforeAll(async () => {
  // Use a separate test database
  const mongoUri =
    process.env.MONGO_URI ||
    "mongodb://localhost:27017/task-management-system-test";
  await mongoose.connect(mongoUri);

  // Register a test user and get auth cookie
  const registerResponse = await request
    .post("/api/auth/register")
    .send(testUser);
  authCookie = registerResponse.headers["set-cookie"];
  userId = registerResponse.body.data._id;
});

// Clean up database after tests
afterAll(async () => {
  // Remove test data
  await User.deleteMany({});
  await Task.deleteMany({});
  // Close database connection
  await mongoose.connection.close();
});

// Clean up before each test
beforeEach(async () => {
  // Remove tasks
  await Task.deleteMany({});
});

describe("Task Management", () => {
  it("should create a new task", async () => {
    const response = await request
      .post("/api/tasks")
      .set("Cookie", authCookie)
      .send(testTask)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(testTask.title);
    expect(response.body.data.description).toBe(testTask.description);
    expect(response.body.data.priority).toBe(testTask.priority);
    expect(response.body.data.status).toBe(testTask.status);
    expect(response.body.data.creator._id).toBe(userId);
  });

  it("should not create a task without authentication", async () => {
    const response = await request
      .post("/api/tasks")
      .send(testTask)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Not authorized, no token provided");
  });

  it("should not create a task without title", async () => {
    const invalidTask = { ...testTask };
    delete invalidTask.title;

    const response = await request
      .post("/api/tasks")
      .set("Cookie", authCookie)
      .send(invalidTask)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });

  it("should get all tasks", async () => {
    // Create two tasks
    await request.post("/api/tasks").set("Cookie", authCookie).send(testTask);

    await request
      .post("/api/tasks")
      .set("Cookie", authCookie)
      .send({
        ...testTask,
        title: "Another Test Task",
      });

    // Get all tasks
    const response = await request
      .get("/api/tasks")
      .set("Cookie", authCookie)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBe(2);
    expect(response.body.total).toBe(2);
  });

  it("should get a task by ID", async () => {
    // Create a task
    const createResponse = await request
      .post("/api/tasks")
      .set("Cookie", authCookie)
      .send(testTask);

    const taskId = createResponse.body.data._id;

    // Get task by ID
    const response = await request
      .get(`/api/tasks/${taskId}`)
      .set("Cookie", authCookie)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data._id).toBe(taskId);
    expect(response.body.data.title).toBe(testTask.title);
  });

  it("should update a task", async () => {
    // Create a task
    const createResponse = await request
      .post("/api/tasks")
      .set("Cookie", authCookie)
      .send(testTask);

    const taskId = createResponse.body.data._id;

    // Update task
    const updatedData = {
      title: "Updated Task Title",
      status: "in-progress",
    };

    const response = await request
      .put(`/api/tasks/${taskId}`)
      .set("Cookie", authCookie)
      .send(updatedData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe(updatedData.title);
    expect(response.body.data.status).toBe(updatedData.status);
    expect(response.body.data.description).toBe(testTask.description);
  });

  it("should delete a task", async () => {
    // Create a task
    const createResponse = await request
      .post("/api/tasks")
      .set("Cookie", authCookie)
      .send(testTask);

    const taskId = createResponse.body.data._id;

    // Delete task
    const response = await request
      .delete(`/api/tasks/${taskId}`)
      .set("Cookie", authCookie)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Task deleted successfully");

    // Verify task is deleted
    const getResponse = await request
      .get(`/api/tasks/${taskId}`)
      .set("Cookie", authCookie)
      .expect(404);

    expect(getResponse.body.success).toBe(false);
    expect(getResponse.body.message).toBe("Task not found");
  });

  it("should get dashboard stats", async () => {
    // Create tasks with different statuses
    await request.post("/api/tasks").set("Cookie", authCookie).send(testTask);

    await request
      .post("/api/tasks")
      .set("Cookie", authCookie)
      .send({
        ...testTask,
        title: "In Progress Task",
        status: "in-progress",
      });

    // Get dashboard stats
    const response = await request
      .get("/api/tasks/dashboard")
      .set("Cookie", authCookie)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.overview).toBeDefined();
    expect(response.body.data.tasksByStatus).toBeDefined();
    expect(response.body.data.tasksByPriority).toBeDefined();
    expect(response.body.data.recentTasks).toBeDefined();
    expect(response.body.data.recentTasks.length).toBe(2);
  });
});
