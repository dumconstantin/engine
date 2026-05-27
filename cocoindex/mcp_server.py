from __future__ import annotations

import asyncio
import os
import pathlib

import asyncpg
from dotenv import load_dotenv
from mcp.server import FastMCP
from pgvector.asyncpg import register_vector

from cocoindex.ops.sentence_transformers import SentenceTransformerEmbedder

load_dotenv(pathlib.Path(__file__).parent / ".env")

DATABASE_URL = os.getenv(
    "POSTGRES_URL", "postgres://cocoindex:cocoindex@localhost/cocoindex"
)
TABLE_NAME = "code_embeddings"
PG_SCHEMA_NAME = "engine_index"
EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
TOP_K = 5

mcp = FastMCP("cocoindex")

_pool: asyncpg.Pool | None = None
_embedder: SentenceTransformerEmbedder | None = None


async def _get_resources() -> tuple[asyncpg.Pool, SentenceTransformerEmbedder]:
    global _pool, _embedder
    if _pool is None:
        _pool = await asyncpg.create_pool(DATABASE_URL, init=register_vector)
    if _embedder is None:
        _embedder = SentenceTransformerEmbedder(EMBED_MODEL)
    return _pool, _embedder


@mcp.tool()
async def search_code(query: str, top_k: int = TOP_K) -> str:
    """Search the codebase using semantic similarity. Returns relevant code chunks with file paths and line numbers."""
    pool, embedder = await _get_resources()
    query_vec = await embedder.embed(query)

    async with pool.acquire() as conn:
        await conn.execute("SET ivfflat.probes = 10")
        rows = await conn.fetch(
            f"""
            SELECT filename, code, embedding <=> $1 AS distance, start_line, end_line
            FROM "{PG_SCHEMA_NAME}"."{TABLE_NAME}"
            ORDER BY distance ASC
            LIMIT $2
            """,
            query_vec,
            top_k,
        )

    if not rows:
        return "No results found."

    parts: list[str] = []
    for r in rows:
        score = 1.0 - float(r["distance"])
        parts.append(
            f"[score={score:.3f}] {r['filename']}:{r['start_line']}-{r['end_line']}\n"
            f"```\n{r['code']}\n```"
        )
    return "\n\n---\n\n".join(parts)


if __name__ == "__main__":
    mcp.run(transport="stdio")
