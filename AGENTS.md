# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

PinBoard is a zero-dependency static website (HTML/CSS/JS) with two pages: a Pinterest-style image gallery (`index.html`) and a calculator (`calculadora.html`). There is also a standalone Python CLI calculator (`calculadora.py`). All JS/CSS dependencies are loaded from CDNs at runtime; there is no `package.json`, no build step, and no backend.

### Running the app

Serve the repository root with any static HTTP server:

```
python3 -m http.server 8080 --directory /workspace
```

Then open `http://localhost:8080/index.html` (gallery) or `http://localhost:8080/calculadora.html` (calculator).

### Running the Python CLI calculator

```
python3 calculadora.py <operacao> <num1> <num2>
```

Operations: `soma`, `subtrai`, `multiplica`, `divide`.

### Linting / testing

There is no linting or test framework configured. Validation is manual via browser interaction and running `calculadora.py` from the command line.

### Notes

- All images and third-party libraries (Bootstrap, Masonry, Ionicons, Google Fonts) are fetched from external CDNs. Internet access is required for full rendering.
- State (theme preference, calculator history) is persisted in `localStorage`.
- The GitHub Actions workflow (`.github/workflows/calculadora.yml`) references a Windows-specific absolute path and would fail in CI; this is a pre-existing issue in the repo.
