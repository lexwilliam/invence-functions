import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { Transaction } from "./model/transaction";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { formatDate, formatMonth } from "./util/date_formatter";
import { v4 as uuid } from "uuid";
import { log } from "firebase-functions/logger";
import { TransactionDaySummary } from "./model/transaction_day_summary";
import { TransactionSummary } from "./model/transaction_summary";

initializeApp();
const db = getFirestore();

exports.transactionCreatedTrigger = onDocumentCreated(
  {
    document: "transaction/{docId}",
    region: "asia-southeast2",
  },
  async (event) => {
    try {
      log(`Transaction Created Trigger: ${event.params.docId}`);
      const snapshot = event.data;
      if (!snapshot) {
        log("No data associated with the event");
        return;
      }
      const data = snapshot.data() as Transaction;
      const summaryRef = db.collection("transaction_summary");
      const summary = await summaryRef
        .where("branch_uuid", "==", data.branch_uuid)
        .where("date", "==", formatMonth(data.created_at))
        .get();

      if (summary.docs.length > 0) {
        const oldSummary = summary.docs[0].data() as TransactionSummary;
        updateTransactionSummary(summaryRef, oldSummary, data);
      } else {
        createNewTransactionSummary(summaryRef, data);
      }
    } catch (error) {
      log(error);
    }
  }
);

async function createNewTransactionSummary(
  summaryRef: FirebaseFirestore.CollectionReference<
    FirebaseFirestore.DocumentData,
    FirebaseFirestore.DocumentData
  >,
  data: Transaction
) {
  const summaryId = uuid();
  const newDaySummary: { [key: string]: TransactionDaySummary } = {
    [formatDate(data.created_at)]: {
      date: formatDate(data.created_at),
      total: data.total,
      profit: data.profit,
      expense: 0,
    },
  };
  const newSummary: TransactionSummary = {
    uuid: summaryId,
    branch_uuid: data.branch_uuid,
    date: formatMonth(data.created_at),
    summaries: newDaySummary,
  };
  await summaryRef.doc(summaryId).set(newSummary);
  log(`Summary created for ${summaryId}`);
}

async function updateTransactionSummary(
  summaryRef: FirebaseFirestore.CollectionReference<
    FirebaseFirestore.DocumentData,
    FirebaseFirestore.DocumentData
  >,
  summary: TransactionSummary,
  data: Transaction
) {
  const date = formatDate(data.created_at);
  var transactionDaySummaries = summary.summaries;
  const daySummary = transactionDaySummaries[date] ?? {
    [date]: {
      date: date,
      total: 0,
      profit: 0,
      expense: 0,
    },
  };
  const modifiedDaySummary: TransactionDaySummary = {
    ...daySummary,
    total: daySummary.total + data.total,
    profit: daySummary.profit + data.profit,
  };
  transactionDaySummaries[date] = modifiedDaySummary;
  await summaryRef.doc(summary.uuid).update({
    summaries: transactionDaySummaries,
  });
  log(`Summary updated for ${summary.uuid}`);
}
