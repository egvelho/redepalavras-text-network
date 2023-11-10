import { bigram, trigram, nGram } from "n-gram";
import replacements from "./data/replacements.json";
import stopwords from "./data/stopwords.json";

export function tokenize(rawTexts) {
  const texts = rawTexts.map((text) =>
    normalize(text)
      .split(" ")
      .map((token) => replacements[token] ?? token)
  );

  const grams = getGrams(texts);
  const tokenizedTexts = detectGrams(texts, grams).map((text) =>
    text.filter((token) => !stopwords[token])
  );

  return tokenizedTexts;
}

function detectGrams(texts, grams) {
  return texts
    .map((text) => {
      for (let index = 0; index < text.length; index++) {
        let token = text[index];
        let spliceLength = 1;
        while (true) {
          if (!text[index + spliceLength]) {
            break;
          }
          if (grams.some((gram) => gram.startsWith(token) && gram !== token)) {
            const nextToken = text[index + spliceLength];
            const maybeToken = token.concat(" ", nextToken);
            if (grams.some((gram) => gram.startsWith(maybeToken))) {
              token = maybeToken;
              spliceLength++;
            }
            break;
          } else {
            break;
          }
        }
        if (spliceLength > 1) {
          text.splice(index, spliceLength, token);
          index = -1;
        }
      }
      return text;
    })
    .filter((text) => text.length > 0);
}

function getGrams(texts, { maxSize = Infinity, minCount = 5 } = {}) {
  const bigrams = texts.map((token) => bigram(token));
  const trigrams = texts.map((token) => trigram(token));
  const grams4 = texts.map((token) => nGram(4)(token));
  const grams5 = texts.map((token) => nGram(5)(token));
  const grams6 = texts.map((token) => nGram(6)(token));
  const grams7 = texts.map((token) => nGram(7)(token));
  const grams8 = texts.map((token) => nGram(8)(token));
  const grams9 = texts.map((token) => nGram(9)(token));

  const grams = bigrams
    .concat(trigrams, grams4, grams5, grams6, grams7, grams8, grams9)
    .flat()
    .map((gram) => gram.join(" "));

  const gramsCountMap = grams.reduce((stack, item) => {
    stack[item] = (stack[item] ?? 0) + 1;
    return stack;
  }, {});

  const detectedGramsSortedBySizeDesc = Object.entries(gramsCountMap)
    .filter(([, count]) => count >= minCount)
    .map(([gram]) => gram)
    .filter((gram) => gram)
    .sort((a, b) => b.split(" ").length - a.split(" ").length);

  const filteredGrams = detectedGramsSortedBySizeDesc.filter(
    (token, index, tokens) => {
      const isBiggestVersion = !tokens
        .slice(index + 1)
        .some((nextToken) => nextToken.includes(token));
      const isRespectMaxGramSize = token.split(" ").length <= maxSize;
      return isBiggestVersion && isRespectMaxGramSize;
    }
  );

  const gramsWithoutStopwords = filteredGrams
    .map((gram) => {
      const tokens = gram.split(" ");
      while (stopwords[tokens.at(0)] || stopwords[tokens.at(-1)]) {
        if (stopwords[tokens.at(0)]) {
          tokens.shift();
        }
        if (stopwords[tokens.at(-1)]) {
          tokens.pop();
        }
      }

      if (tokens.length <= 1) {
        return undefined;
      }
      return tokens.join(" ");
    })
    .filter((gram) => gram);

  return gramsWithoutStopwords;
}

function normalize(s) {
  return s
    .toLowerCase()
    .replace(
      /(?:(https?|ftp):\/\/)(www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
      ""
    )
    .replace(
      /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.(aero|asia|biz|cat|com|coop|info|int|jobs|mobi|museum|name|net|org|pro|tel|travel|xxx|edu|gov|mil|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cs|cu|cv|cx|cy|cz|dd|de|dj|dk|dm|do|dz|ec|ee|eg|eh|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|ss|st|su|sv|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|yu|za|zm|zw)\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
      ""
    )
    .replace(/[.,\/!$%\^&\*;:{}=_<>\?\-`~()…\"\']/g, "")
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ""
    )
    .replace(/^(a*ha+h[ha]*|e*he+h[he]*|o?l+o+l+[ol]*|kk+|r?s+r+s+[rs]*)$/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/\n\s*\n/g, "\n")
    .replace(/\n/g, " ")
    .replace(/\s\s+/g, " ")
    .normalize("NFD")
    .replace(/[^\w\s]/gi, "")
    .trim();
}
