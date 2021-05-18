const router = require("express").Router();
require("dotenv").config();

const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");

const configuration = new Configuration({
  basePath: PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.CLIENT_ID,
      "PLAID-SECRET": process.env.SANDBOX_SECRET,
      "Plaid-Version": "2020-09-14",
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// POST /plaid/links/token/create
router.post("/link/token/create", async (req, res, next) => {
  const client_user_id = req.body.client_user_id;
  const request = {
    user: {
      client_user_id: client_user_id,
    },
    client_name: "Plaid Test App",
    products: ["transactions"],
    country_codes: ["US"],
    language: "en",
    webhook: "https://sample-web-hook.com",
    account_filters: {
      depository: {
        account_subtypes: ["checking", "savings"],
      },
    },
  };
  try {
    const { data } = await plaidClient.linkTokenCreate(request);
    res.send(data);
  } catch (error) {
    // handle error
    next(error);
  }
});

module.exports = router;
