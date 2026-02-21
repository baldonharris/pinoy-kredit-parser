export type KreditTransaction = {
  saleDate: string
  postDate: string
  description: string
  amount: number
}

export enum BankType {
  RCBC = "rcbc",
  METROBANK = "metrobank",
  UNIONBANK = "unionbank"
}