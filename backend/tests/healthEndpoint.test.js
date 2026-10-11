import { describe, it, expect } from '@jest/globals';
import { getHealth } from '../src/controllers/healthController.js';

describe('Health Controller', () => {
  it('returns health payload structure', async () => {
    let statusCode = null;
    let jsonBody = null;

    const req = {};
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonBody = data;
        return this;
      },
    };

    await getHealth(req, res);

    expect(statusCode).toBeDefined();
    expect(jsonBody).toBeDefined();
    expect(jsonBody.success).toBe(true);
    expect(jsonBody.data.api.status).toBe('healthy');
    expect(jsonBody.data.database).toHaveProperty('status');
  });
});
