import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { Transaction } from "./model/transaction";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { formatDate } from "./util/date_formatter";
import { TransactionSummary } from "./model/transaction_summary";
import { v4 as uuid } from "uuid";
import { log } from "firebase-functions/logger";

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
        .where("date", "==", formatDate(data.created_at))
        .get();

      if (summary.docs.length > 0) {
        await summaryRef.doc(summary.docs[0].id).update({
          profit: summary.docs[0].data().profit + data.profit,
        });
        log(`Summary updated for ${summary.docs[0].id}`);
      } else {
        const summaryId = uuid();
        const newSummary: TransactionSummary = {
          uuid: summaryId,
          branch_uuid: data.branch_uuid,
          date: formatDate(data.created_at),
          total: data.total,
          profit: data.profit,
          expense: 0,
        };
        await summaryRef.doc(summaryId).set(newSummary);
        log(`Summary created for ${summaryId}`);
      }
    } catch (error) {
      log(error);
    }
  }
);
