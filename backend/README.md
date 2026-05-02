# AI Resume Truth Checker Backend

Production-oriented Express backend scaffold for:

- Resume upload and parsing
- Structured JSON extraction with OpenAI
- GitHub profile and repository analysis
- Resume-to-GitHub evaluation
- Final scoring and explainable results

## Structure

```text
backend/
  src/
    config/
    controllers/
    database/
    middlewares/
    models/
    routes/
    services/
    utils/
    validators/
```

## Getting started

1. Copy `.env.example` to `.env`
2. Install dependencies with `npm install`
3. Start dev server with `npm run dev`

## Planned modules

- `resume` ingestion and file handling
- `llm` extraction and normalization
- `github` data collection
- `evaluation` scoring and explanation engine
- `report` persistence and retrieval
