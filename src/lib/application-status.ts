export const APPLICATION_STATUS_TRANSITIONS: Record<string, readonly string[]> = {
  draft: ['submitted'],
  submitted: ['under_review'],
  under_review: ['interview', 'approved', 'rejected', 'waitlisted'],
  interview: ['under_review', 'approved', 'rejected', 'waitlisted'],
  waitlisted: ['under_review', 'interview', 'approved', 'rejected'],
  approved: [],
  rejected: [],
};

export const FINAL_APPLICATION_STATUSES = ['approved', 'rejected'] as const;

