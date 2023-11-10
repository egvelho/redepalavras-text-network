import { tokenize } from "./tokenize";
import { prepareTextNetwork } from "./prepareTextNetwork";
import { plotTextNetwork } from "./plotTextNetwork";

export async function textNetwork(texts) {
  console.log("Tokenizing text...");
  const tokenizedTexts = tokenize(texts);
  console.log("Prepairing text network...");
  const network = prepareTextNetwork(tokenizedTexts);
  console.log("Ploting to SVG...");
  const chart = await plotTextNetwork(network);
  console.log("Done!");
  return chart;
}
