import { cleanDatabase } from "./database";
import { createTestUser } from "./test-user";

export async function setupTestDatabase() {
  await cleanDatabase();
  await createTestUser();
}