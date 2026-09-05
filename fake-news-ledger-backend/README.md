# Fake News Ledger Backend

FastAPI backend for the Fake News Ledger frontend.

## 1. Setup

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

## 2. Run

```bash
uvicorn app.main:app --reload
```

API docs:
- http://localhost:8000/docs
- http://localhost:8000/health

## 3. Test

```bash
curl -X POST http://localhost:8000/api/verify   -H "Content-Type: application/json"   -d '{"claim":"Sample news claim entered by the user"}'
```

Then open:
`http://localhost:8000/api/verify/<ID>`

## AI

Without `OPENAI_API_KEY`, the app performs a dynamic Google News RSS evidence search and returns an uncertainty-based assessment for the submitted claim. With the key configured, the LLM evaluates the retrieved evidence.
With a key, it calls the configured model for structured analysis.

The current implementation includes a live evidence-retrieval layer. For production, add trusted fact-check databases and source verification before allowing strong verdicts.

## Web3

`blockchain_service.py` is an integration point. The demo currently creates a deterministic placeholder transaction hash and labels the network `Demo/Testnet`. Do not present it as a real on-chain transaction.

For production/hackathon deployment, replace that function with a real smart-contract call using a testnet and keep private keys server-side.
