# Hello Speaking 👋

A tiny, dependency-free web app that says "hello" out loud in dozens of
languages, using the browser's built-in [Web Speech
API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis).

## Features

- 65+ languages, each shown with its native greeting, native language name,
  and flag
- Click any card to hear it spoken with a matching voice (when your browser/
  OS provides one)
- "Speak all" to cycle through every visible greeting in sequence
- Live search/filter by language name (English or native) or greeting text
- Adjustable speech rate and pitch
- Responsive layout, light/dark themes based on system preference
- No build step, no dependencies — plain HTML/CSS/JS

## Running it

Just open `index.html` in a modern browser (Chrome, Edge, or Safari have the
best Web Speech API support). No installation needed.

To serve it locally instead (recommended if your browser restricts speech
synthesis on `file://` pages):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Notes on voices

Which languages actually get spoken — and how natural they sound — depends
entirely on the text-to-speech voices installed on your operating system
and exposed to the browser. If a language has no matching voice installed,
the browser will typically fall back to a default voice, and the greeting
text remains visible either way.

## Project structure

```
index.html        Page markup
styles.css         Styling (light/dark aware)
app.js             App logic: rendering, search, speech synthesis
data/languages.js  Language + greeting data (name, native, code, flag)
```

## Adding a language

Add an entry to `data/languages.js`:

```js
{ code: "xx-YY", name: "English name", native: "Native name", greeting: "Native greeting", flag: "🏳️" }
```

`code` should be a valid [BCP-47](https://en.wikipedia.org/wiki/IETF_language_tag)
tag so the browser can pick a matching voice.
