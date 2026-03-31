"""Test MCP PostgreSQL connection."""
import asyncio
import asyncpg


async def test():
    try:
        conn = await asyncpg.connect(
            "postgresql://postgres:040393@localhost:5432/liquidity_risk"
        )
        result = await conn.fetchval(
            """
            SELECT COUNT(*) FROM information_schema.tables 
            WHERE table_schema IN ('staging', 'warehouse', 'lineage', 'validation')
            """
        )
        await conn.close()
        print(f"✓ MCP connection works. Found {result} tables in the 4 schemas.")
        return True
    except Exception as e:
        print(f"✗ MCP connection failed: {e}")
        return False


if __name__ == "__main__":
    success = asyncio.run(test())
    exit(0 if success else 1)
