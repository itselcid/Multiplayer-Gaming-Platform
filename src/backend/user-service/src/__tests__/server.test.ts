
import buildServer from '../app';

describe('Server Health Check', () => {
  it('should return status ok from /health', async () => {
    // 1. Initialize the server (don't need .listen())
    const app = await buildServer();

    // 2. Mock a request using .inject()
    const response = await app.inject({
      method: 'GET',
      url: '/health'
    });

    // 3. Assertions
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });

    // 4. Close the server to clean up memory
    await app.close();
  });
});