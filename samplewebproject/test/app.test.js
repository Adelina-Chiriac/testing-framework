const assert = require("assert");
const render = require("../../render");

it("Has a text input", async () => {
    const dom = await render("index.html");
    
    const input = dom.window.document.querySelector("input");
    
    assert(input);
});

it("Shows a success message with a valid email", async () => {
    const dom = await render("index.html");

    const input = dom.window.document.querySelector("input");
    input.value = "hello@email.com";

    dom.window.document
        .querySelector("form")
        .dispatchEvent(new dom.window.Event("submit"));

    const h1 = dom.window.document.querySelector("h1");

    assert.strictEqual(h1.innerHTML, "Valid email :)");
});

it("Shows an error message with an invalid email", async () => {
    const dom = await render("index.html");

    const input = dom.window.document.querySelector("input");
    input.value = "helloemail.com";

    dom.window.document
        .querySelector("form")
        .dispatchEvent(new dom.window.Event("submit"));

    const h1 = dom.window.document.querySelector("h1");

    assert.strictEqual(h1.innerHTML, "Invalid email!");
});