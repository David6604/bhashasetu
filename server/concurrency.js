// server/concurrency.js
import { Worker } from "worker_threads";
import os from "os";

const MAX_WORKERS = os.cpus().length;
const queue = [];
let active = 0;

/**
 * Run a heavy function in a worker thread.
 * The function must be serialisable (no closures).
 */
export function enqueueTask(fn) {
  return new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    tryNext();
  });
}

function tryNext() {
  if (active >= MAX_WORKERS || queue.length === 0) return;
  const { fn, resolve, reject } = queue.shift();
  active++;

  const worker = new Worker(
    `const { parentPort } = require('worker_threads');
     parentPort.on('message', async (fnString) => {
       const fn = eval('(' + fnString + ')');
       try {
         const result = await fn();
         parentPort.postMessage({ result });
       } catch (e) {
         parentPort.postMessage({ error: e.message });
       }
     });`,
    { eval: true }
  );

  worker.on("message", ({ result, error }) => {
    active--;
    error ? reject(new Error(error)) : resolve(result);
    worker.terminate();
    tryNext();
  });
  worker.on("error", (e) => {
    active--;
    reject(e);
    worker.terminate();
    tryNext();
  });

  worker.postMessage(fn.toString());
}