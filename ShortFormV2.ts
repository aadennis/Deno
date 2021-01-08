//https://github.com/deligenius/multiparser
//https://github.com/eveningkid/denodb/issues/146
//Google: TS1205 [ERROR]: Re-exporting a type when the '--isolatedModules' flag is provided requires using 'export type'

// example call:
// deno run -A ShortFormV2.ts
// Once running, open the file submit-actionV2.html
// MAKE SURE IT IS V2, BECAUSE THIS CONTAINS THE NECESSARY HEADERS AND ENCODING METADATA, 
// e.g.     <meta Content-Type="text/html; charset=utf-8"> and
// <form action="http://localhost:8000/action" enctype="multipart/form-data" method="POST">

import { serve } from "https://deno.land/std@0.61.0/http/server.ts";
import { multiParser } from 'https://deno.land/x/multiparser@v2.0.3/mod.ts'

const s = serve({ port: 8000 });
console.log("running now on port 8000")
for await (const req of s) {
  if (req.url === "/action") {
    ProcessAction(req);
  }
}

async function ProcessAction(req: any) {
  const form = await multiParser(req)

  if (form) {
    console.log("is a form")
    console.log(form.fields)
  } else {
    console.log("not a form")
  }
}
