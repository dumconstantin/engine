from __future__ import annotations

import asyncio
import os
import pathlib
import sys
from dataclasses import dataclass
from typing import AsyncIterator, Annotated

import asyncpg
from dotenv import load_dotenv
from numpy.typing import NDArray
from pgvector.asyncpg import register_vector

import cocoindex as coco
from cocoindex.connectors import localfs, postgres
from cocoindex.ops.sentence_transformers import SentenceTransformerEmbedder
from cocoindex.ops.text import RecursiveSplitter, detect_code_language
from cocoindex.resources.chunk import Chunk
from cocoindex.resources.file import FileLike, PatternFilePathMatcher
from cocoindex.resources.id import IdGenerator

load_dotenv()

DATABASE_URL = os.getenv(
    "POSTGRES_URL", "postgres://cocoindex:cocoindex@localhost/cocoindex"
)
TABLE_NAME = "code_embeddings"
PG_SCHEMA_NAME = "engine_index"
TOP_K = 5

EMBED_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
PG_DB = coco.ContextKey[asyncpg.Pool]("engine_db")
EMBEDDER = coco.ContextKey[SentenceTransformerEmbedder]("embedder", detect_change=True)

_splitter = RecursiveSplitter()

REPO_ROOT = pathlib.Path(__file__).parent.parent


@dataclass
class CodeEmbedding:
    id: int
    filename: str
    code: str
    embedding: Annotated[NDArray, EMBEDDER]
    start_line: int
    end_line: int


@coco.lifespan
async def coco_lifespan(builder: coco.EnvironmentBuilder) -> AsyncIterator[None]:
    async with asyncpg.create_pool(DATABASE_URL) as pool:
        builder.provide(PG_DB, pool)
        builder.provide(EMBEDDER, SentenceTransformerEmbedder(EMBED_MODEL))
        yield


@coco.fn
async def process_chunk(
    chunk: Chunk,
    filename: pathlib.PurePath,
    id_gen: IdGenerator,
    table: postgres.TableTarget[CodeEmbedding],
) -> None:
    embedding = await coco.use_context(EMBEDDER).embed(chunk.text)
    table.declare_row(
        row=CodeEmbedding(
            id=await id_gen.next_id(chunk.text),
            filename=str(filename),
            code=chunk.text,
            embedding=embedding,
            start_line=chunk.start.line,
            end_line=chunk.end.line,
        ),
    )


@coco.fn(memo=True)
async def process_file(
    file: FileLike,
    table: postgres.TableTarget[CodeEmbedding],
) -> None:
    text = await file.read_text()
    language = detect_code_language(filename=str(file.file_path.path.name))
    chunks = _splitter.split(
        text,
        chunk_size=1000,
        min_chunk_size=300,
        chunk_overlap=300,
        language=language,
    )
    id_gen = IdGenerator()
    await coco.map(process_chunk, chunks, file.file_path.path, id_gen, table)


@coco.fn
async def app_main(sourcedir: pathlib.Path) -> None:
    target_table = await postgres.mount_table_target(
        PG_DB,
        table_name=TABLE_NAME,
        table_schema=await postgres.TableSchema.from_class(
            CodeEmbedding,
            primary_key=["id"],
        ),
        pg_schema_name=PG_SCHEMA_NAME,
    )
    target_table.declare_vector_index(column="embedding")

    files = localfs.walk_dir(
        sourcedir,
        recursive=True,
        path_matcher=PatternFilePathMatcher(
            included_patterns=["**/*.ts", "**/*.tsx"],
            excluded_patterns=[
                "**/node_modules/**",
                "**/.yarn/**",
                "**/*.d.ts",
                "**/*.test.ts",
                "**/*.spec.ts",
                "**/dist/**",
                "**/build/**",
            ],
        ),
        live=True,
    )
    await coco.mount_each(process_file, files.items(), target_table)


app = coco.App(
    coco.AppConfig(name="EngineCodeIndex"),
    app_main,
    sourcedir=REPO_ROOT,
)


async def query_once(
    pool: asyncpg.Pool,
    embedder: SentenceTransformerEmbedder,
    query: str,
    *,
    top_k: int = TOP_K,
) -> None:
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

    for r in rows:
        score = 1.0 - float(r["distance"])
        print(f"[{score:.3f}] {r['filename']} (L{r['start_line']}-L{r['end_line']})")
        print(f"    {r['code'][:200]}")
        print("---")


async def query(initial_query: str | None = None) -> None:
    embedder = SentenceTransformerEmbedder(EMBED_MODEL)
    async with asyncpg.create_pool(DATABASE_URL, init=register_vector) as pool:
        if initial_query is not None:
            await query_once(pool, embedder, initial_query)
            return
        while True:
            q = input("Search query (Enter to quit): ").strip()
            if not q:
                break
            await query_once(pool, embedder, q)


if __name__ == "__main__":
    initial = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else None
    asyncio.run(query(initial))
