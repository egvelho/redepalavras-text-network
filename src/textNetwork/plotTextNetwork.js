import { jLouvain as louvain } from "louvain";
import * as d3 from "d3";

export async function plotTextNetwork({
  nodesIds,
  edges,
  nodes,
  nodesWeights,
  strength = -50,
  strokeColor = "#ccc",
  strokeOpacity = 1,
  svgId = "text-network",
}) {
  let community = louvain().nodes(nodesIds).edges(edges);
  let result = community();
  let maxCommunity = 0;
  nodesIds.forEach(function (d) {
    maxCommunity = maxCommunity < result[d] ? result[d] : maxCommunity;
  });
  window.d3 = d3;
  const color = d3
    .scaleSequential()
    .domain([0, maxCommunity])
    .interpolator(d3.interpolateRainbow);

  const svg = d3
    .create("svg")
    .attr("xmlns", "http://www.w3.org/2000/svg")
    .attr("id", svgId);

  svg.append("g").attr("class", "links");
  svg.append("g").attr("class", "nodes").append("title");

  const simulation = d3
    .forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(strength))
    .force("center", d3.forceCenter(1, 1))
    .force("link", d3.forceLink().links(edges))
    .on("tick", ticked);

  function updateLinks() {
    svg
      .select(".links")
      .selectAll("line")
      .data(edges)
      .join("line")
      .attr("stroke", strokeColor)
      .attr("stroke-opacity", strokeOpacity)
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);
  }

  function updateNodes() {
    svg
      .select(".nodes")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text((d) => d.id)
      .attr("font-family", "Helvetica")
      .attr("fill", (d) => color(result[d.id]))
      .attr(
        "font-size",
        (d) => `${6 * (1 + (nodesWeights[d.id] / nodesIds.length) * 50)}px`
      )
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("dy", (d) => 5)
      .append("title")
      .text((d) => d.weight);
  }

  await new Promise((resolve) => setTimeout(resolve, 1000 * 60));
  simulation.stop();

  const chart = Object.assign(svg.node(), { scales: { color } });
  document.querySelector("body").appendChild(chart);
  const bb = chart.getBBox();
  const width = bb.width;
  const height = bb.height;
  const x = bb.x;
  const y = bb.y;
  svg.attr("viewBox", `${x} ${y} ${width} ${height}`);
  svg.attr("width", width);
  svg.attr("height", height);

  return chart;

  function ticked() {
    updateLinks();
    updateNodes();
  }
}
