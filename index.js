const inquirer = require("inquirer");
const wasm = require("./lib/wasm");
const fs = require("fs");

const numberPrompt = {
  type: "input",
  message: "请输入创建私钥的数量",
  name: "amount",
  default: "1",
  validate: (amount) => {
    if (!/(^[1-9]\d*$)/.test(amount)) {
      return "请输入正整数";
    } else if (amount > 100) {
      return "一次，最多创建100个";
    } else {
      return true;
    }
  },
};

inquirer.prompt([numberPrompt]).then((answers) => {
  const amount = Number(answers.amount);
  const result = create_keyStore(amount);
  let fileName = new Date().toLocaleString();
  fileName = fileName.replace(
    /[^\d{1,4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}].*/g,
    ""
  );
  fileName = fileName + "- findora-wallet (" + amount + ")";
  console.log(result);

  fs.writeFile(`${fileName}.txt`, result, function (err) {
    console.log("创建完毕, 文件已保存");
    console.log(`位置：${process.cwd()}/${fileName}.txt`);
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
