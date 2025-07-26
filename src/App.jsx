import "./App.css";
import { useState } from "react";
import { textNetwork } from "./textNetwork/textNetwork";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

function saveSvg(svg, name) {
  const svgData = svg.outerHTML;
  const preface = '<?xml version="1.0" standalone="no"?>\r\n';
  const svgBlob = new Blob([preface, svgData], {
    type: "image/svg+xml;charset=utf-8",
  });
  const svgUrl = URL.createObjectURL(svgBlob);
  const downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = name;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

function Loader() {
  return (
    <div className="fixed top-0 left-0 w-full h-full backdrop-blur-lg bg-purple-900 bg-opacity-70 z-10 flex flex-col items-center justify-center">
      <div className="flex justify-center items-center flex-col gap-2">
        <AiOutlineLoading3Quarters className="w-12 h-12 animate-spin text-slate-100" />
        <p className="text-slate-100 font-bold">Carregando</p>
      </div>
    </div>
  );
}

export function App() {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function generateNetwork() {
    setIsLoading(true);
    const texts = text.split("\n");
    const chart = await textNetwork(texts);
    saveSvg(chart, "text-network.svg");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    document.querySelector("body").removeChild(chart);
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center absolute w-full h-full bg-slate-950">
      {isLoading && <Loader />}
      <main className="flex flex-col gap-2 max-w-screen-md m-auto w-full box-border p-2">
        <header>
          <h1 className="text-2xl md:text-3xl text-center text-slate-100 mb-6">
            Gerador de rede de palavras
          </h1>
          <p className="text-md text-slate-100">
            Cole qualquer texto na caixa abaixo para fazer download de uma rede
            de palavras no formato SVG.
          </p>
        </header>
        <textarea
          className="border-2 p-4 border-slate-400 bg-slate-100 w-full rounded-lg resize-none outline-none focus:border-orange-700"
          cols="30"
          rows="10"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Cole texto aqui..."
        />
        <button
          className="bg-orange-700 hover:bg-orange-800 text-slate-100 font-bold text-lg p-4 rounded-lg w-full"
          onClick={generateNetwork}
        >
          Fazer download
        </button>
        <p className="text-sm text-slate-100">
          Gostou da ferramenta? Ficou com alguma dúvida? Entre em contato por{" "}
          <a
            href="https://eduardavelho.com"
            className="underline text-orange-400 hover:text-orange-500"
          >
            esse link
          </a>
          .
          <br />
          <br /> Eduarda Velho
        </p>
      </main>
    </div>
  );
}
