//https://github.com/deligenius/multiparser
//https://github.com/eveningkid/denodb/issues/146
//Google: TS1205 [ERROR]: Re-exporting a type when the '--isolatedModules' flag is provided requires using 'export type'

// example call:
// deno run -A ShortForm.ts
// Once running, open localhost/8000

import { serve } from "https://deno.land/std@0.61.0/http/server.ts";
import { multiParser } from 'https://deno.land/x/multiparser@v2.0.3/mod.ts'

const s = serve({ port: 8000 });
console.log("er...")
for await (const req of s) {
  console.log("running now on port 8000")
  if (req.url === "/upload") {
    const form = await multiParser(req)
    console.log("and here?")
    if (form) {
      console.log("is a form")
      console.log(form)
    } else {
      console.log("not a form")
    }
  }

  req.respond({
    headers: new Headers({ "Content-Type": "text/html; charset=utf-8" }),
    body: `
    <h3>Deno http module</h3>
    <form action="/upload" enctype="multipart/form-data" method="post">
      <div>singleStr: <input type="text" name="singleStr" /></div>
      <div>singleImg: <input type="file" name="singleImg"/></div>
      <input type="submit" value="Upload" />
    </form>
  ` });
}

// As-is, this prints out on console (with entries of kkk and 4.jpg)...

// er...
// running now on port 8000
// and here?
// is a form
// {
//   fields: { singleStr: "kkk\r" },
//   files: {
//     singleImg: {
//       name: "singleImg",
//       filename: "4.jpg",
//       contentType: "image/jpeg",
//       size: 536013,
//       content: Uint8Array(536013) [
//         255, 216, 255, 224,   0,  16,  74, 70,  73,  70,   0,   1,   1, 0,  0,
//           1,   0,   1,   0,   0, 255, 225, 14, 138,  69, 120, 105, 102, 0,  0,
//          77,  77,   0,  42,   0,   0,   0,  8,   0,  16,   1,   0,   0, 3,  0,
//           0,   0,   1,  13, 128,   0,   0,  1,   1,   0,   3,   0,   0, 0,  1,
//          18,   0,   0,   0,   1,   2,   0,  3,   0,   0,   0,   3,   0, 0,  0,
//         206,   1,  15,   0,   2,   0,   0,  0,   7,   0,   0,   0, 212, 1, 16,
//           0,   2,   0,   0,   0,   8,   0,  0,   0, 219,
//         ... 535913 more items
//       ]
//     }
//   }
// }
// running now on port 8000

