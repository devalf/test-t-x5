import { z } from 'zod';

import { ORDER_STATUSES } from '@/models';

export const orderEditFormSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export type OrderEditFormData = z.infer<typeof orderEditFormSchema>;
