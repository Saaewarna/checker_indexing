#!/usr/bin/env node
import fs from "fs";
import axios from "axios";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function normalizeDomainRaw(s){
  let t = s.trim();
  if(!t) return "";
  // remove protocol
  t = t.replace(/^https?:\/\//i, "");
  // remove trailing slashes
  t = t.replace(/\/+$/,"");
  return t;
}

async function countIndexedSerpApi(query, apiKey) {
  const url = "https://serpapi.com/search.json";
  const params = { engine: "google", q: query, api_key: apiKey, num: 1 };
  const res = await axios.get(url, { params, timeout: 20000 });
  const info = res.data?.search_information;
  if (!info) throw new Error("Unexpected SerpAPI response");
  return Number(info.total_results ?? 0);
}

async function main(){
  const argv = await yargs(hideBin(process.argv))
    .option("domains-file", { type: "string", demandOption: true, desc: "File with domains (one per line). Can include protocol or just domain." })
    .option("out", { type: "string", default: "domains-results.txt", desc: "Output file. Appended." })
    .option("delay", { type: "number", default: 1.0, desc: "Delay seconds between requests (per worker)" })
    .option("concurrency", { type: "number", default: 1, desc: "Parallel workers" })
    .help()
    .argv;

  const apiKey = process.env.SERPAPI_KEY;
  if(!apiKey){
    console.error("❌ SERPAPI_KEY missing in env.");
    process.exit(1);
  }

  const path = argv["domains-file"];
  if(!fs.existsSync(path)){
    console.error("domains-file not found:", path);
    process.exit(1);
  }

  const outPath = argv.out;
  const delayMs = Math.max(0, argv.delay) * 1000;
  const concurrency = Math.max(1, Math.floor(argv.concurrency));

  const raw = fs.readFileSync(path, "utf8").split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  const domains = raw.map(normalizeDomainRaw).filter(Boolean);
  const total = domains.length;
  if(total === 0){
    console.error("No domains in domains-file.");
    process.exit(1);
  }

  console.log(`Found ${total} domains. Concurrency=${concurrency}, delay=${argv.delay}s, out=${outPath}`);
  let idx = 0;
  let done = 0;

  async function worker(){
    while(true){
      const i = idx++;
      if(i >= total) break;
      const domain = domains[i];
      const q = `site:${domain}`;
      try{
        const totalRes = await countIndexedSerpApi(q, apiKey);
        const line = `${domain} -> ${Number(totalRes)}\n`;
        fs.appendFileSync(outPath, line);
        done++;
        console.log(`[${done}/${total}] ${domain} -> ${Number(totalRes)}`);
      }catch(e){
        const msg = `${domain} -> ERROR: ${e.message}\n`;
        fs.appendFileSync(outPath, msg);
        done++;
        console.log(`[${done}/${total}] ${domain} -> ERROR: ${e.message}`);
      }
      await sleep(delayMs);
    }
  }

  const workers = [];
  for(let i=0;i<concurrency;i++) workers.push(worker());
  await Promise.all(workers);

  console.log(`All done. Results appended to ${outPath}`);
}

main().catch(e=>{
  console.error(e);
  process.exit(1);
});
