export const PAGE_SIZE = 8

// Bornes (incluses) pour supabase .range()
export const rangeFor = (page) => [page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1]
