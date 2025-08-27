import {
  Banking,
  Currency,
  NotificationType,
  Transaction as UserTransaction,
} from "@folded/types";
import { HttpsError, onCall, onRequest } from "firebase-functions/v2/https";
import {
  CountryCode,
  Products,
  RemovedTransaction,
  Transaction,
  WebhookType,
} from "plaid";

import { db } from "@/common/firebase";
import { createNotification } from "@/common/notification";
import { Webhook, client } from "@/common/plaid";

export const createLinkToken = onCall(async (request) => {
  // Get uid
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "User is not authenticated");
  }

  try {
    const createTokenResponse = await client.linkTokenCreate({
      user: {
        client_user_id: uid,
      },
      client_name: "Folded",
      products: [Products.Transactions],
      transactions: {
        days_requested: 730,
      },
      country_codes: [CountryCode.Us],
      language: "en",
      android_package_name: "so.folded.app",
      webhook: "https://banking-webhook-opmluf6qma-uc.a.run.app",
    });
    return createTokenResponse.data;
  } catch (error) {
    console.error(error);
    throw new HttpsError("internal", "Failed to create link token");
  }
});

export const exchangePublicToken = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "User is not authenticated");
  }

  const publicToken = request.data.publicToken;
  try {
    const response = await client.itemPublicTokenExchange({
      public_token: publicToken,
    });

    // These values should be saved to a persistent database and
    // associated with the currently signed-in user
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;
    const banking: Banking = {
      accessToken,
      itemId,
    };

    // Save to database
    await db.collection("users").doc(uid).update({
      banking,
    });

    syncTransactions({
      accessToken,
      userId: uid,
    });

    return { public_token_exchange: "complete" };
  } catch (error) {
    // handle error
    console.error(error);
    throw new HttpsError("internal", "Failed to exchange public token");
  }
});

export const webhook = onRequest(async (request, response) => {
  const {
    webhook_type: webhookType,
    item_id: itemId,
    initial_update_complete: initialUpdateComplete,
    historical_update_complete: historicalUpdateComplete,
  } = request.body as Webhook;

  if (webhookType !== WebhookType.Transactions) return;

  // Determine if we need to sync transactions
  const sync =
    (initialUpdateComplete && !historicalUpdateComplete) ||
    historicalUpdateComplete;

  // If we need to sync transactions, get the user and execute the sync
  if (sync) {
    // Get the user
    const user = (await db
      .collection("users")
      .where("itemId", "==", itemId)
      .limit(1)
      .get()
      .then((doc) => ({ uid: doc.docs[0].id, ...doc.docs[0].data() }))) as {
      uid: string;
      accessToken: string;
      itemId: string;
      transactionCursor: string | undefined;
    };
    if (!user) {
      throw new HttpsError("not-found", `User with itemId ${itemId} not found`);
    }

    const newTransactions = await syncTransactions({
      accessToken: user.accessToken,
      userId: user.uid,
      transactionCursor: user.transactionCursor,
    });

    // Parse the transactions
    await analyzeTransactions(user.uid, newTransactions);
  }

  response.send("ok");
});

// https://github.com/plaid/tutorial-resources/blob/main/transactions/finished/server/routes/transactions.js#L31

const syncTransactions = async (data: {
  userId: string;
  accessToken: string;
  transactionCursor?: string;
}) => {
  // Helper function to fetch new sync data
  const fetchNewSyncData = async ({
    accessToken,
    initialCursor,
    retriesLeft = 3,
  }: {
    accessToken: string;
    initialCursor: string | undefined;
    retriesLeft?: number;
  }): Promise<{
    added: Transaction[];
    modified: Transaction[];
    removed: RemovedTransaction[];
    nextCursor: string | undefined;
  }> => {
    console.log("Fetching new sync data");
    const allData: {
      added: Transaction[];
      modified: Transaction[];
      removed: RemovedTransaction[];
      nextCursor: string | undefined;
    } = {
      added: [],
      removed: [],
      modified: [],
      nextCursor: initialCursor,
    };
    if (retriesLeft <= 0) {
      console.error("Too many retries!");
      // We're just going to return no data and keep our original cursor. We can try again later.
      return allData;
    }
    try {
      let keepGoing = false;
      do {
        const results = await client.transactionsSync({
          access_token: accessToken,
          options: {
            include_personal_finance_category: true,
          },
          cursor: allData.nextCursor,
        });
        const newData = results.data;
        allData.added = allData.added.concat(newData.added);
        allData.modified = allData.modified.concat(newData.modified);
        allData.removed = allData.removed.concat(newData.removed);
        allData.nextCursor = newData.next_cursor;
        keepGoing = newData.has_more;
        console.log(
          `Added: ${newData.added.length} Modified: ${newData.modified.length} Removed: ${newData.removed.length} `,
        );

        // if (Math.random() < 0.5) {
        //   throw new Error("SIMULATED PLAID SYNC ERROR");
        // }
      } while (keepGoing === true);
      return allData;
    } catch (error) {
      // If you want to see if this is a sync mutation error, you can look at
      // error?.response?.data?.error_code
      console.log(
        `Oh no! Error! ${JSON.stringify(
          error,
        )} Let's try again from the beginning!`,
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return fetchNewSyncData({
        accessToken,
        initialCursor,
        retriesLeft: retriesLeft - 1,
      });
    }
  };

  const { accessToken, transactionCursor, userId } = data;

  const summary = { added: 0, removed: 0, modified: 0 };
  const allData = await fetchNewSyncData({
    accessToken,
    initialCursor: transactionCursor,
  });

  // Save new transactions to the database
  await Promise.all(
    allData.added.map(async (txnObj: Transaction) => {
      const txn = formatTransaction(txnObj);
      await db
        .collection("users")
        .doc(userId)
        .collection("transactions")
        .add(txn);
      summary.added += 1;
    }),
  );

  // Update modified transactions in our database
  await Promise.all(
    allData.modified.map(async (txnObj: Transaction) => {
      await db
        .collection("users")
        .doc(userId)
        .collection("transactions")
        .doc(txnObj.transaction_id)
        .set(formatTransaction(txnObj));
      summary.modified += 1;
    }),
  );

  // Remove the transactions from the database
  await Promise.all(
    allData.removed.map(async (txnObj: RemovedTransaction) => {
      await db
        .collection("users")
        .doc(userId)
        .collection("transactions")
        .doc(txnObj.transaction_id)
        .delete();
      summary.removed += 1;
    }),
  );

  // Save our cursor value to the database
  await db
    .collection("users")
    .doc(userId)
    .update({ "banking.transactionCursor": allData.nextCursor });

  return allData.added.map((a) => formatTransaction(a));
};

const formatTransaction = (txn: Transaction): UserTransaction => ({
  transactionId: txn.transaction_id,
  amount: txn.amount,
  date: new Date(txn.date).getTime(),
  currency: txn.iso_currency_code as Currency | null,
  name: txn.name,
  category: {
    confidence: txn.personal_finance_category?.confidence_level as
      | "LOW"
      | "MEDIUM"
      | "HIGH"
      | "VERY_HIGH",
    primary: txn.personal_finance_category?.primary ?? null,
    detailed: txn.personal_finance_category?.detailed ?? null,
  },
  merchant: {
    name: txn.merchant_name || "",
    website: txn.website || "",
  },
  location: {
    address: txn.location?.address || null,
    city: txn.location?.city || null,
    country: txn.location?.country || null,
    postalCode: txn.location?.postal_code || null,
    region: txn.location?.region || null,
    storeNumber: txn.location?.store_number || null,
    lat: txn.location?.lat || null,
    lon: txn.location?.lon || null,
  },

  raw: {
    provider: "plaid",
    data: txn,
  },
});

const analyzeTransactions = async (userId: string, txns: UserTransaction[]) => {
  // Detect if any of the transactions are gambling transactions
  const gamblingTxns = txns.filter(
    (txn) => txn.category.detailed === "ENTERTAINMENT_CASINOS_AND_GAMBLING",
  );
  if (gamblingTxns.length === 0) return;

  // Reset the user's streak
  const streakPromise = db.collection("users").doc(userId).update({
    "streak.start": Date.now(),
  });

  // Create a notification for the user
  const notificationPromise = createNotification(userId, {
    notificationId: crypto.randomUUID(),
    createdAt: Date.now(),
    type: NotificationType.RELAPSE,
    data: {
      value: gamblingTxns.reduce((acc, txn) => acc + txn.amount, 0),
      transactions: gamblingTxns,
    },
  });

  await Promise.all([streakPromise, notificationPromise]);
};

// export const createGambleTransaction = onCall(async (request) => {
//   const uid = request.auth?.uid;
//   if (!uid) {
//     throw new HttpsError("unauthenticated", "User is not authenticated");
//   }

//   const transaction = request.data.transaction;
// });
