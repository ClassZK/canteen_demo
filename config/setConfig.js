/** 将 config.**.js 文件中的内容写入 public/lib/config.js 文件中 */
import path from "path";
import { fileURLToPath } from "url";
import { writeFileSync, readFileSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 当前模式 */
const getMode = () => {
  const argv = process.argv;
  if (Array.isArray(argv)) {
    const errMsg = "请在package.json中设置当前运行模式 --mode xxxx ";
    const modeIndex = argv.findIndex((i) => i === "--mode");
    if (modeIndex === -1) {
      throw new Error(errMsg);
    } else {
      return argv[modeIndex + 1];
    }
  } else {
    throw new Error(errMsg);
  }
};

/** 写入环境变量 */
const writeToEnvJson = async () => {
  const configFilePath = {
    'devp': "/config.devp.js",
    'test': "/config.test.js",
  }[getMode()];

  const configContent = await readFileSync(path.join(__dirname, configFilePath), 'utf-8');
  if (typeof configContent !== 'string') {
    throw new Error('读取配置文件失败');
  }
  else {
    const ENV_JSON_PATH = "./public/lib/config.js";
    writeFileSync(ENV_JSON_PATH, configContent);
  }
};

writeToEnvJson();
