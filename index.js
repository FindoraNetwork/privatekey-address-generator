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
  const result = create_keyStore(amount);

  const fileName = `findora_wallet_${amount}_private_keys_at_${Date.now()}.txt`;
  const savePath = path.join(desktopPath, fileName);

  fs.writeFile(savePath, result, function (err) {
    console.log("The creation is complete, the file has been saved");
    console.log(`File location: ${savePath}`);
  });
});

function create_keyStore(amount) {
  let keyStore = "";

  for (let i = 0; i < amount; i++) {
    const keypair = wasm.new_keypair();

    const publickey = wasm.public_key_to_bech32(
      wasm.get_pk_from_keypair(keypair)
    );

    let private = wasm.get_priv_key_str(keypair);
    private = private.replace(/\"/g, "");

    keyStore += `\naddress: ${publickey}\nprivate: ${private}\n`;
  }

  return keyStore;
}
