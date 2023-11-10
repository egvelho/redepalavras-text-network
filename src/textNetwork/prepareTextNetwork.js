export function prepareTextNetwork(
  texts,
  { minCount = undefined, maxCount = undefined, window = 3 } = {}
) {
  const tokenCount = texts.flat().reduce((stack, item) => {
    stack[item] = (stack[item] ?? 0) + 1;
    return stack;
  }, {});

  const tokenFrequenciesList = [...new Set(Object.values(tokenCount))].sort(
    (tokenA, tokenB) => tokenA - tokenB
  );
  const [defaultMinCount] = tokenFrequenciesList.slice(
    Math.floor(tokenFrequenciesList.length * 0.2)
  );
  const [defaultMaxCount] = tokenFrequenciesList.slice(
    Math.floor(tokenFrequenciesList.length * 0.95)
  );

  const filterTextsByCount = texts.map((text) =>
    text
      .filter(
        (token) =>
          tokenCount[token] >= (minCount ?? defaultMinCount) &&
          tokenCount[token] <= (maxCount ?? defaultMaxCount)
      )
      .filter((text) => text.length > 1)
  );

  const nodesWeights = texts.flat().reduce((stack, item) => {
    stack[item] = (stack[item] ?? 0) + 1;
    return stack;
  }, {});
  const nodesTokens = Object.keys(nodesWeights);
  let nodesIds = [];
  let nodesIdsMap = {};
  let nodesTokensMap = {};
  let edgesWeights = {};
  let nodes = [];
  let edges = [];

  nodesTokens.forEach((token) => {
    const nodeId = token;
    const node = {
      id: token,
      weight: nodesWeights[token],
    };
    nodes.push(node);
    nodesIds.push(nodeId);
    nodesIdsMap[token] = node;
  });

  filterTextsByCount.forEach((text) =>
    text.forEach((token, index) => {
      const coocurrences = [
        ...text.slice(index - window || 0, index),
        ...text.slice(index + 1, index + 1 + window),
      ];

      if (!edgesWeights[token]) {
        edgesWeights[token] = {};
      }
      coocurrences.forEach((coocurrence) => {
        const source = nodesIdsMap[token];
        const target = nodesIdsMap[coocurrence];

        edgesWeights[token][coocurrence] =
          (edgesWeights[token]?.[coocurrence] ?? 0) + 1;

        edges.push({
          source,
          target,
        });
      });
    })
  );

  edges.forEach((edge) => {
    const sourceId = edge.source.id;
    const targetId = edge.target.id;
    edge.weight =
      (edgesWeights[sourceId][targetId] /
        Object.keys(edgesWeights[sourceId]).length) *
      Math.log(nodes.length / nodesWeights[targetId]);
  });

  return {
    nodes,
    nodesIds,
    edges,
    nodesWeights,
  };
}
