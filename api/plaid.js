const router = require("express").Router();
require("dotenv").config();

const { Configuration, PlaidApi, PlaidEnvironments } = require("plaid");

const plaid = require("plaid");

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

// GET plaid/testing
router.get("/testing", (req, res, next) => {
  console.log("in router");
  res.send("works");
});

// POST /plaid/links/token/create
router.post("/link/token/create", async (req, res, next) => {
  const client_user_id = req.body.client_user_id;
  console.log("in router");
  const request = {
    user: {
      client_user_id: String(client_user_id),
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
    console.log(data);
    res.send(data);
  } catch (error) {
    // handle error
    next(error);
  }
});

// GET /plaid/get_access_token // second part of auth
router.post("/get_access_token", async function (req, res, next) {
  const publicToken = req.body.public_token;
  try {
    const { data } = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    const accessToken = data.access_token;
    const itemID = data.item_id;
    res.send(data);
  } catch (error) {
    // handle error
    next(error);
  }
});

// GET /plaid/transactions // last part
router.post("/transactions", async (req, res, next) => {
  try {
    const access_token = req.body.access_token;
    const { data } = await plaidClient.transactionsGet({
      access_token,
      start_date: "2021-01-01",
      end_date: "2021-05-01",
    });

    console.log(data.transactions);
    res.send(data.transactions);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
