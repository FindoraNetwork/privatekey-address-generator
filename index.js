const inquirer = require("inquirer");
const wasm = require("./lib/wasm");
const fs = require("fs");
const path = require("path");
const os = require("os");

const desktopPath = path.join(os.homedir(), "Desktop");

const numberPrompt = {
  type: "input",
  message: "Please enter the number of private keys to be created",
  name: "amount",
  default: "1",
  validate: (amount) => {
    if (!/(^[1-9]\d*$)/.test(amount)) {
      return "Please enter a positive integer";
    } else if (amount > 100) {
      return "Create up to 100 at a time";
    } else {
      return true;
    }
  },
};

inquirer.prompt([numberPrompt]).then((answers) => {
  const amount = Number(answers.amount);
  const { keyStore, address } = create_keyStore(amount);

  const savePath = path.join(desktopPath, `findora_wallet_at_${Date.now()}`);

  try {
    fs.mkdirSync(savePath);
    fs.writeFileSync(path.join(savePath, "private.txt"), keyStore);
    fs.writeFileSync(path.join(savePath, "address.txt"), address);

    console.log("\n");
    console.log("The creation is complete, the file has been saved");
    console.log(`File location: ${savePath}`);
  } catch (_) {
    console.log("Failed to create");
  }
});

function create_keyStore(amount) {
  let keyStore = "";
  let address = "";

  for (let i = 0; i < amount; i++) {
    const keypair = wasm.new_keypair();

    const publickey = wasm.public_key_to_bech32(
      wasm.get_pk_from_keypair(keypair)
    );

    let private = wasm.get_priv_key_str(keypair);
    private = private.replace(/\"/g, "");

    keyStore += `\n${publickey}\n${private}\n`;

    address += `\n${publickey}\n`;
  }

  return { keyStore, address };
}
