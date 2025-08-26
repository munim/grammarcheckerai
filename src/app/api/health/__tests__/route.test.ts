import 'whatwg-fetch';
import { GET } from '../route';

describe('GET /api/health', () => {
  it('should return a 200 status with the correct health check response', async () => {
    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    expect(body.status).toBe('ok');
    expect(body.service).toBe('grammar-correction-tool');
    expect(typeof body.timestamp).toBe('string');

    // Validate that the timestamp is a valid ISO 8601 date
    const date = new Date(body.timestamp);
    expect(date.toISOString()).toBe(body.timestamp);
  });
});
