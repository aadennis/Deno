// Credit for the basics:
// https://github.com/oakserver/oak/blob/main/examples/routingServer.ts
// Setup: Install deno
// Usage: deno run -A ./DenoPost.ts
// Use e.g. Postman to POST the json payload to http://127.0.0.1:8000/book
// Use e.g. any browser to read the json in memory: http://127.0.0.1:8000/book

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

interface IBook {
    id: string;
    title: string;
    author: string;
}

const books = new Map<string, IBook>();

books.set("1939", {
    id: "1939",
    title: "1984",
    author: "Orwell, George",
});

function notFound(context: Context) {
    context.response.status = Status.NotFound;
    context.response.body =
        `<html><body><h1>404 - Not Found</h1><p>Path <code>${context.request.url}</code> not found.`;
}

const router = new Router();
router
    .get("/", (context) => {
        context.response.body = "Hello world!";
    })
    .get("/book", (context) => {
        context.response.body = Array.from(books.values());
    })
    .post("/book", async (context: RouterContext) => {
        if (!context.request.hasBody) {
            context.throw(Status.BadRequest, "The request has no body");
        }
        const body = context.request.body();
        console.log("body type: " + body.type)
        const supportedTypesMsg = "This script only supports POST messages sent as Json.";
        if (body.type !== "json") {
            throw new Error(supportedTypesMsg);
        }

        //https://stackoverflow.com/questions/15826745/typescript-creating-an-empty-typed-container-array
        // 3 examples of initializing an array of type Interface
        //let tempBook:IBook[] = [];
        //let tempBook = [] as IBook[];
        //let tempBook = new Array<IBook>();

        var book = await body.value;
        if (book) {
            if (book.keys === undefined) {
                console.log("the content:" + JSON.stringify(book))
                let tempBook = new Array<IBook>();
                tempBook.push(book);
                console.log("the array content:" + tempBook)

                // assumption - the body is valid JSON (todo - add json validator)
                console.log("Handling a single JSON record, not an array");
                console.log("tempBook.keys:" + tempBook.keys)
                book = tempBook
            } else {
                console.log("This is a json array");
            }

            book.forEach((obj: { id: string; title: string; author: string }) => {
                console.log("--------------------");
                console.log("id: " + obj.id);
                console.log("title: " + obj.title);
                console.log("author: " + obj.author);
                books.set(obj.id, obj as IBook);
            });
            var currentBook = book[0];

            context.assert(currentBook.id && typeof currentBook.id === "string", Status.BadRequest);
            books.set(currentBook.id, currentBook as IBook);
            context.response.status = Status.OK;
            context.response.body = currentBook;
            context.response.type = "json";
            return;
        }
        context.throw(Status.BadRequest, "Bad Request");
    })
    .get<{ id: string }>("/book/:id", async (context, next) => {
        if (context.params && books.has(context.params.id)) {
            context.response.body = books.get(context.params.id);
        } else {
            return notFound(context);
        }
    });

const app = new Application();

// Logger
app.use(async (context, next) => {
    await next();
    const rt = context.response.headers.get("X-Response-Time");
    console.log(
        `${green(context.request.method)} ${cyan(decodeURIComponent(context.request.url.pathname))
        } - ${bold(
            String(rt),
        )
        }`,
    );
});

// Response Time
app.use(async (context, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    context.response.headers.set("X-Response-Time", `${ms}ms`);
});

// Error handler
app.use(async (context, next) => {
    try {
        await next();
    } catch (err) {
        if (isHttpError(err)) {
            context.response.status = err.status;
            const { message, status, stack } = err;
            if (context.request.accepts("json")) {
                context.response.body = { message, status, stack };
                context.response.type = "json";
            } else {
                context.response.body = `${status} ${message}\n\n${stack ?? ""}`;
                context.response.type = "text/plain";
            }
        } else {
            console.log(err);
            throw err;
        }
    }
});

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

// Example JSON data:
// 1. array - 2 records
// [{"id":"4568","title":"The Player of Games","author":"Banks, Iain M."},
// {"id":"5461","title":"101 Christmas Hits for Buskers","author":"Wise Publications"}]
// 2. array - 1 record (sic)
// [{"id":"4568","title":"The Player of Games","author":"Banks, Iain M."}]
// 3. 1 record - no array brace
// {"id":"4568","title":"The Player of Games","author":"Banks, Iain M."}
// 4. nonsense - (need check for valid JSON)
// Anything I jolly well like.
