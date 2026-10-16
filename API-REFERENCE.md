# API Reference



This document describes the three public functions exported by `index.js` in this project.



## Requirements



- Node.js 22 or later.

- An OpenAI SDK client configured with a valid API key.

- Access to the configured model, `gpt-5.5`.



The functions accept a client as an argument, making them easier to test with a mock client.



## `generateGreeting(client, onMetric)`



Generates a friendly, one-sentence greeting using the OpenAI Responses API.



### Parameters



| Parameter | Type | Required | Description |

|---|---|---|---|

| `client` | OpenAI-compatible client | Yes | Provides `client.responses.create()`. |

| `onMetric` | Function | No | Receives observability metrics. Defaults to `console.log`. |



### Returns



A promise that resolves to the generated greeting as a string.



### Example



```js

import OpenAI from "openai";

import { generateGreeting } from "./index.js";



const client = new OpenAI();

const greeting = await generateGreeting(client);



console.log(greeting);

```



This example requires a valid API key in the environment.



## `summarizeText(client, text, onMetric)`



Summarizes supplied text clearly and concisely using the OpenAI Responses API.



### Parameters



| Parameter | Type | Required | Description |

|---|---|---|---|

| `client` | OpenAI-compatible client | Yes | Provides `client.responses.create()`. |

| `text` | String | Yes | Non-empty text to summarize. |

| `onMetric` | Function | No | Receives observability metrics. Defaults to `console.log`. |



### Returns



A promise that resolves to the generated summary as a string.



### Validation



The function rejects non-string, empty, or whitespace-only input with:



`Text to summarize is required.`



### Example



```js

import OpenAI from "openai";

import { summarizeText } from "./index.js";



const client = new OpenAI();



const summary = await summarizeText(

&#x20; client,

&#x20; "Clear documentation helps developers understand and use APIs."

);



console.log(summary);

```



## `streamText(client, prompt, onText, onMetric)`



Streams generated text incrementally, passing each text fragment to a callback.



### Parameters



| Parameter | Type | Required | Description |

|---|---|---|---|

| `client` | OpenAI-compatible client | Yes | Provides `client.responses.create()`. |

| `prompt` | String | Yes | Non-empty prompt sent to the model. |

| `onText` | Function | Yes | Receives each generated text fragment. |

| `onMetric` | Function | No | Receives observability metrics. Defaults to `console.log`. |



### Returns



A promise that resolves when streaming finishes. The function does not return the complete generated text. Collect the fragments inside `onText` if you need to retain them.



### Validation



An empty or whitespace-only prompt rejects with:



`Prompt is required.`



If `onText` is not a function, the promise rejects with:



`A text callback is required.`



### Example



```js

import OpenAI from "openai";

import { streamText } from "./index.js";



const client = new OpenAI();



await streamText(

&#x20; client,

&#x20; "Explain how an API works",

&#x20; (fragment) => process.stdout.write(fragment)

);



console.log();

```



This example requires a valid API key, model access, and a working network connection.



## Errors and observability



The functions use the project's observability wrapper to record operation metrics. SDK errors can propagate to the caller, so callers should handle rejected promises appropriately.



For command-line usage and troubleshooting guidance, see \[QUICKSTART.md](./QUICKSTART.md).



## Scope



This reference documents the three exported functions in `index.js`. It does not describe every method in the OpenAI SDK.
