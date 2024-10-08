import { ProductCategory } from "./model/product_category";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { Product } from "./model/product";
import { formatMonth, formatDate } from "./util/date_formatter";
import { TransactionSummary } from "./model/transaction_summary";
import { TransactionDaySummary } from "./model/transaction_day_summary";
import { log } from "firebase-functions/logger";
import { v4 as uuid } from "uuid";

initializeApp();
const db = getFirestore();

exports.setProduct = onRequest(
  {
    region: "asia-southeast2",
  },
  async (req, res) => {
    try {
      log("Product set function called");
      log(req.body);
      // Fetch category and product from body
      const category: ProductCategory = JSON.parse(req.body.data.category);
      log(category)
      const product: Product = JSON.parse(req.body.data.product);
      log(product)

      // Initiate collection references
      const categoryRef = db.collection("product_category");
      const summaryRef = db.collection("transaction_summary");

      // Check if the product with the same SKU already exists
      log(category.products)
      log(product.sku)
      const existingProduct = category.products[product.sku];
      log(existingProduct)

      if (existingProduct) {
        // Update the existing product
        const updatedProducts = {
          ...category.products,
          [product.sku]: {
            ...existingProduct,
            ...product,
          },
        };

        // Update the category with the updated products
        await categoryRef.doc(category.uuid).update({
          products: updatedProducts,
        });

        const transactionSummary = await summaryRef
          .where("branch_uuid", "==", category.branch_uuid)
          .where("date", "==", formatMonth(product.updated_at))
          .get();

        handleTransactionSummary(
          summaryRef,
          transactionSummary,
          category.branch_uuid,
          product
        );
      } else {
        // Add the new product
        const newProducts = {
          ...category.products,
          [product.sku]: product,
        };

        // Update the category with the new product
        await categoryRef.doc(category.uuid).update({
          products: newProducts,
        });
      }
      log(`Product set successful ${product.sku}`);
      res.status(200).send(product);
    } catch (error) {
      log(error);
      res.status(500).send({
        message: "Internal server error",
        error: error,
      });
    }
  }
);

async function handleTransactionSummary(
  summaryRef: FirebaseFirestore.CollectionReference<
    FirebaseFirestore.DocumentData,
    FirebaseFirestore.DocumentData
  >,
  transactionSummary: FirebaseFirestore.QuerySnapshot<
    FirebaseFirestore.DocumentData,
    FirebaseFirestore.DocumentData
  >,
  branch_uuid: string,
  product: Product
) {
  if (transactionSummary.docs.length > 0) {
    const oldSummary = transactionSummary.docs[0].data() as TransactionSummary;
    const newSummary = await updateTransactionSummary(
      summaryRef,
      oldSummary,
      product
    );
    return newSummary;
  } else {
    return await createTransactionSummary(summaryRef, branch_uuid, product);
  }
}

async function createTransactionSummary(
  summaryRef: FirebaseFirestore.CollectionReference<
    FirebaseFirestore.DocumentData,
    FirebaseFirestore.DocumentData
  >,
  branch_uuid: string,
  data: Product
) {
  const summaryId = uuid();
  const date = formatDate(data.created_at);
  const newDaySummary: { [key: string]: TransactionDaySummary } = {
    [date]: {
      date: date,
      total: data.sell_price * data.items.length,
      profit: 0,
      expense: data.items.reduce(
        (acc, item) => acc + item.buy_price * item.quantity,
        0
      ),
    },
  };
  const newSummary: TransactionSummary = {
    uuid: summaryId,
    branch_uuid: branch_uuid,
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
  data: Product
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
    expense:
      daySummary.expense +
      data.items.reduce((acc, item) => acc + item.buy_price * item.quantity, 0),
  };
  transactionDaySummaries[date] = modifiedDaySummary;
  await summaryRef.doc(summary.uuid).update({
    summaries: transactionDaySummaries,
  });
  log(`Summary updated for ${summary.uuid}`);
}
