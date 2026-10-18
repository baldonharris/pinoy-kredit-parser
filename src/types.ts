export type KreditTransaction = {
  saleDate: string
  postDate: string
  description: string
  amount: number
}

export type KreditMeta = {
  statementDate: string // MM/DD/YYYY
  dueDate: string // MM/DD/YYYY
  cardLastFour: string | null
}

export enum BankType {
  RCBC = 'rcbc',
  METROBANK = 'metrobank',
  UNIONBANK = 'unionbank',
}
