const {
  db,
  User,
  Account,
  Badge,
  Challenge,
  Budget,
  Saving,
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

  const accounts = await Promise.all([
    Account.create({
      auth_token: "xxxxxxxxxx",
      type: "checking",
    }),
  ]);

  const codyChecking = accounts[0];
  await codyChecking.setUser(users[0]);

  const challenges = await Promise.all([
    Challenge.create({
      type: "big-saver",
      endDate: "2021-05-31 06:00:00",
      completed: false,
    }),
  ]);

  await challenges[0].setUser(users[1]);

  const badges = await Promise.all([
    Badge.create({
      type: "big-saver",
    }),
  ]);

  await badges[0].setUser(users[0]);

  const budgets = await Promise.all([
    Budget.create({
      category: "groceries",
      goalAmount: 20000,
      currentAmount: 1000,
    }),
  ]);

  await budgets[0].setUser(users[0]);

  const savings = await Promise.all([
    Saving.create({
      goalAmount: 500000,
      currentAmount: 30000,
    }),
  ]);

  await savings[0].setUser(users[0]);

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
