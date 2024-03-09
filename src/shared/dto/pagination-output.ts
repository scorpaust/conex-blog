export type PaginationOutput<Item = any> = {
  items: Item[],
  currentPage: number,
  perPage: number,
  lastPage: number,
  total: number
}
