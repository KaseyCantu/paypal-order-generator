## PayPal Order Generator

This is a script that automates the sandbox PayPal order creation by using Puppeteer to control your Google Chrome browser.

- To get started, after cloning this project, run the following commands:
```bash
yarn install
```
- After dependencies are installed you can run the application:
```bash
yarn start
```

Once the script is running, you will be met with some prompts asking the following:
- `Sender PayPal Sandbox E-mail` 
- `Sender PayPal Sandbox Password`
- `Recipient PayPal Sandbox E-mail`
- `Number of orders to create`
- `Run headless`

You can run it `headless` or `headed` by answering yes or no to the prompt that asks if you want to run the script headless.
