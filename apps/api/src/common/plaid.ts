import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  WebhookEnvironmentValues,
  WebhookType,
} from "plaid";

import * as env from "./env";

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": env.PLAID.clientId,
      "PLAID-SECRET": env.PLAID.secret,
    },
  },
});

const environment = {
  clientId: env.PLAID.clientId,
};

const client = new PlaidApi(configuration);

interface Webhook {
  webhook_type: WebhookType;
  webhook_code: "SYNC_UPDATES_AVAILABLE";
  item_id: string;
  initial_update_complete: boolean;
  historical_update_complete: boolean;
  environment: WebhookEnvironmentValues;
}

export { Webhook, client, environment };
