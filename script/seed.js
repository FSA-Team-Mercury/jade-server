const moment = require("moment");
moment().format();
const {
  db,
  User,
  Account,
  Badge,
  Challenge,
  Budget,
  Saving,
  Friend
} = require("../db");

async function seed() {
  await db.sync({ force: true }); // clears db and matches models to tables
  console.log("db synced!");

  // Creating Users
  const users = await Promise.all([
    User.create({
      username: "cody",
      password: "12345",
    }),
    User.create({
      username: "murphy",
      password: "12345",
    }),
  ]);
  // const accounts = await Promise.all([
  //   Account.create({
  //     auth_token: "xxxxxxxxxx",
  //     type: "checking",
  //   }),
  // ]);

  // const codyChecking = accounts[0];
  // await codyChecking.setUser(users[0]);

  const challenges = await Promise.all([
    Challenge.create({
      type: "big-saver",
      endDate: "2021-05-31 06:00:00",
      completed: false,
    }),
    Challenge.create({
      type: "big-spender",
      endDate: "2021-07-31 06:00:00",
      completed: false,
    }),
  ]);

  await challenges[0].setUser(users[1]);
  await challenges[0].setUser(users[0]);

  const badges = await Promise.all([
    Badge.create({
      type: "big-saver",
    }),
    Badge.create({
      type: "traveler",
    }),
    Badge.create({
      type: "hermit",
    }),
    Badge.create({
      type: "smart-shopper",
    }),
    Badge.create({
      type: "big-spender",
    }),
  ]);

  await badges[0].setUser(users[0]);
  await badges[1].setUser(users[0]);
  await badges[2].setUser(users[1]);
  await badges[3].setUser(users[1]);
  await badges[4].setUser(users[0]);

  const budgets = await Promise.all([
    Budget.create({
      category: "Food and Drink",
      goalAmount: 20000,
      currentAmount: 1000,
    }),
    Budget.create({
      category: "Payment",
      goalAmount: 5000,
      currentAmount: 3000,
    }),
    Budget.create({
      category: "Entertainment",
      goalAmount: 50000,
      currentAmount: 60000,
    }),
    Budget.create({
      category: "Other",
      goalAmount: 2200,
      currentAmount: 800,
    }),
    Budget.create({
      category: "Shops",
      goalAmount: 2200,
      currentAmount: 800,
    }),
    Budget.create({
      category: "Travel",
      goalAmount: 2500,
      currentAmount: 900,
    }),
    Budget.create({
      category: "Entertainment",
      goalAmount: 4000,
      currentAmount: 7000,
    }),
  ]);
  // console.log('user 1-->', users[0])
  await users[0].setFriend(users[1])

  await budgets[0].setUser(users[0]);
  await budgets[1].setUser(users[0]);
  await budgets[2].setUser(users[1]);
  await budgets[3].setUser(users[1]);
  await budgets[4].setUser(users[0]);
  await budgets[5].setUser(users[1]);
  await budgets[6].setUser(users[0]);

  const savings = await Promise.all([
    Saving.create({
      goalAmount: 500000,
      currentAmount: 30000,
    }),
    Saving.create({
      goalAmount: 20000,
      currentAmount: 70000,
    }),
  ]);

  await savings[0].setUser(users[0]);
  await savings[1].setUser(users[1]);

  return {
    users: {
      cody: users[0],
      murphy: users[1],
    },
  };
}

/*
 We've separated the `seed` function from the `runSeed` function.
 This way we can isolate the error handling and exit trapping.
 The `seed` function is concerned only with modifying the database.
*/
async function runSeed() {
  console.log("seeding...");
  try {
    await seed();
  } catch (err) {
    console.error(err);
    process.exitCode = 1;
  } finally {
    console.log("closing db connection");
    await db.close();
    console.log("db connection closed");
  }
}

/*
  Execute the `seed` function, IF we ran this module directly (`node seed`).
  `Async` functions always return a promise, so we can use `catch` to handle
  any errors that might occur inside of `seed`.
*/
if (module === require.main) {
  runSeed();
}

// we export the seed function for testing purposes (see `./seed.spec.js`)
module.exports = seed;
