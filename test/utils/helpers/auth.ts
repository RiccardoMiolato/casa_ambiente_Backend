import request from "supertest";
import app from "../../../src/app";

import {
  TEST_PASSWORD,
  TEST_USERNAME,
} from "./test-user";

export async function loginAsTestUser() {
  const agent = request.agent(app);

  const response = await agent
    .post("/api/auth/login")
    .send({
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
    });

  if (response.status !== 200) {
    throw new Error(
      `Test user's login failed: ${response.status} ${JSON.stringify(response.body)}`,
    );
  }

  return agent;
}