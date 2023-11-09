import { tokenize } from "./tokenize.mjs";
import { prepareTextNetwork } from "./prepareTextNetwork.mjs";
import { plotTextNetwork } from "./plotTextNetwork.mjs";

import construcao from "./construcao.json" assert { type: "json" };
import lula from "./lula.json" assert { type: "json" };

textNetwork(construcao);

export async function textNetwork(texts) {
  console.log("Tokenizing text...");
  const tokenizedTexts = tokenize(texts);
  console.log("Prepairing text network...");
  const network = prepareTextNetwork(tokenizedTexts);
  console.log("Ploting to SVG...");
  await plotTextNetwork(network);
  console.log("Done!");
}
