// Usage: deno run -A ./DenoApi.ts

import {
  bold,
  cyan,
  green,
  yellow,
} from "https://deno.land/std@0.73.0/fmt/colors.ts";

import {
  Application,
  Context,
  isHttpError,
  Router,
  RouterContext,
  Status,
} from 'https://deno.land/x/oak/mod.ts';

function notFound(context: Context) {
  context.response.status = Status.NotFound;
  context.response.body =
    `<html><body><h1>404 - Not Found</h1><p>Path <code>${context.request.url}</code> not found.`;
}


const router = new Router();
router
  .get("/", (context: Context) => {
    context.response.body = `<html><body><h1>You have reached a valid address (e.g. http://localhost:8000). However, no useful action is defined for this no-parameter get </h1>`;
  })
  .post("/action", async (context: RouterContext) => {
    if (!context.request.hasBody) {
      context.throw(Status.BadRequest, "The request has no body");
    }
    const body = context.request.body();
        console.log("body type: " + body.type)
        const supportedTypesMsg = "This script only supports POST messages sent as Form.";
        if (body.type !== "form") {
            throw new Error(supportedTypesMsg);
        }
        var book = await body.value;
    let actionContent = book;
    //let file = actionContent.filename;
    //let content = `${actionContent.action} | ${actionContent.message} | ${file}`;
    // todo - review getting values from a form: https://github.com/oakserver/oak/issues/114
    // right now, getting...
    // This confirms you reached e.g. http://localhost:8000/action with a Post request of [action=AuditOrder&message=10+Kg+oranges+-+%24400&filename=c%3A%5Ctemp%5Cs1.log] 
    context.response.body = `This confirms you reached e.g. http://localhost:8000/action with a Post request of [${actionContent}] `;
  });


const app = new Application();

// Use the router
app.use(router.routes());
app.use(router.allowedMethods());

// A basic 404 page
app.use(notFound);

app.addEventListener("listen", ({ hostname, port }) => {
  console.log(
    bold("Start listening on ") + yellow(`${hostname}:${port}`),
  );
});

await app.listen({ hostname: "127.0.0.1", port: 8000 });
console.log(bold("Finished."));

