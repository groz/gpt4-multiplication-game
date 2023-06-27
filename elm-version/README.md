# Running

Running SPA (Single Page Application) requires a web server to direct all requests to `index.html`.
There are multiple options.

## Using lite-server

```sh
npx lite-server
```

## Using elm-live

```sh
npm install elm-live
npx elm-live src/Main.elm --open --pushstate --start-page=index.html
```
