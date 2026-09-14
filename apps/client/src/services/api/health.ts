import { z } from 'zod';
import { apiRequest } from './client';

const healthSchema = z.object({ status: z.literal('ok') });

export function getHealth(signal?: AbortSignal) {
  return apiRequest('/health', healthSchema, { signal });
}
