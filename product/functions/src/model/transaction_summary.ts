import { TransactionDaySummary } from "./transaction_day_summary";

export type TransactionSummary = {
  uuid: string;
  branch_uuid: string;
  date: string;
  summaries: { [key: string]: TransactionDaySummary };
};