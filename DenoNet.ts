// Usage: deno run -A ./DenoNet.ts

import { serve } from "https://deno.land/std@0.74.0/http/server.ts";

const port = 8000;
const s = serve({ port: port });
const path = "http://localhost:" + port + "/"
console.log(path);

for await (const req of s) {
  req.respond({ body: "Hello World\n" });
}


