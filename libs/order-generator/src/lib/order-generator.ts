import puppeteer, { Page } from "puppeteer";
import { faker } from "@faker-js/faker";
import inquirer from "inquirer";

const delay = (time: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, time));

const delayBy250Milliseconds = async (): Promise<void> => delay(250);
const delayBy500Milliseconds = async (): Promise<void> => delay(500);

const sendMoneyToCreateOrders = async (
  page: Page,
  recipient: string
): Promise<void> => {
  const recipientInput = await page.waitForSelector(
    "input[id='fn-sendRecipient']",
    { visible: true }
  );
  await recipientInput?.click();
  await recipientInput?.type(recipient);

  const selectRecipient = await page.waitForSelector(
    `xpath///div[contains(text(), "${recipient}")]`,
    { visible: true }
  );
  await delayBy500Milliseconds();
  await selectRecipient?.click();

  const fundingInput = await page.waitForSelector(
    "xpath///*[@id='fn-amount']",
    { visible: true }
  );
  await fundingInput?.click();
  await fundingInput?.type(faker.finance.amount(1, 15, 2));

  const continueToSendFunds = await page.waitForSelector(
    "xpath///button[contains(text(), 'Continue')]",
    { visible: true }
  );
  await delayBy500Milliseconds();
  await continueToSendFunds?.click();

  const sendPaymentButton = await page.waitForSelector(
    "xpath///button[contains(text(), 'Send Payment Now')]",
    { visible: true }
  );
  await delayBy500Milliseconds();
  await sendPaymentButton?.click();

  const sendMoreMoneyButton = await page.waitForSelector(
    "xpath///a[contains(text(), 'Send More Money')]",
    { visible: true }
  );
  await delayBy500Milliseconds();
  await sendMoreMoneyButton?.click();
};

export type PayPalPuppetArgs = {
  numberOfOrdersToCreate: number;
  recipient: string;
  runHeadless: boolean;
  sender: {
    email: string;
    password: string;
  };
};

const paypalPuppet = async ({ numberOfOrdersToCreate, sender, recipient, runHeadless }: PayPalPuppetArgs) => {
  let counter = 0;
  const browser = await puppeteer.launch({ headless: runHeadless });
  const context = await browser.createIncognitoBrowserContext();
  const page = await context.newPage();

  try {
    await page.goto("https://www.sandbox.paypal.com/us/home");

    // Set screen size
    await page.setViewport({ width: 1200, height: 1400 });

    const startLoginButton = await page.waitForSelector("text/Log In");
    await startLoginButton?.click();

    const loginEmailInput = await page.waitForSelector("input[id='email']", {
      visible: true
    });
    await loginEmailInput?.click();
    await loginEmailInput?.type(sender.email);

    const loginNextButton = await page.waitForSelector("button[id='btnNext']");
    await loginNextButton?.click();

    const passwordInput = await page.waitForSelector("input[id='password']", {
      visible: true
    });
    await passwordInput?.click();
    await passwordInput?.type(sender.password);

    const loginButton = await page.waitForSelector("button[id='btnLogin']");
    await loginButton?.click();

    const sendMoney = await page.waitForSelector(
      "xpath///div[contains(text(), 'Send money')]",
      { visible: true }
    );
    await delayBy250Milliseconds();
    await sendMoney?.click();

    for (let k = 0; k < numberOfOrdersToCreate; k++) {
      await sendMoneyToCreateOrders(page, recipient);
      counter++;
    }
    console.log(`${counter} orders created successfully!`);
  } catch (err) {
    console.error(
      `Puppeteer crashed unexpectedly - ${counter} orders created before failure... \nERROR: ${err}\n`
    );
  } finally {
    await browser.close();
  }
};

export const automatePayPalOrderCreation = async () => inquirer
  .prompt([
    {
      type: "input",
      name: "senderEmail",
      message: "(Sender) PayPal Sandbox E-mail:",
      filter: String
    },
    {
      type: "input",
      name: "senderPassword",
      message: "(Sender) PayPal Sandbox Password:",
      filter: String
    },
    {
      type: "input",
      name: "recipientEmail",
      message: "(Recipient) PayPal Sandbox E-mail:",
      filter: String
    },
    {
      type: "input",
      name: "numberOfOrders",
      message: "Number of orders to generate:",
      filter: Number
    },
    {
      type: "confirm",
      name: "headless",
      message: "Run headless browser?",
      filter: Boolean,
      default: true
    }
  ])
  .then((answers: any) => {
    paypalPuppet({
      numberOfOrdersToCreate: answers.numberOfOrders,
      recipient: answers.recipientEmail,
      runHeadless: answers.headless,
      sender: {
        email: answers.senderEmail,
        password: answers.senderPassword
      },
    });
  })
  .catch((error) => {
    if (error.isTtyError) {
      console.error(error);
    } else {
      console.error("Puppeteer can't even...");
    }
  });
