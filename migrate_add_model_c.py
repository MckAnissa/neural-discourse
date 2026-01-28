"""
Migration script to add model_c and system_prompt_c columns to conversations table.
Run this once to update the database schema.
"""
import asyncio
from sqlalchemy import text
from app.database import engine


async def migrate():
    async with engine.begin() as conn:
        # Add model_c column
        try:
            await conn.execute(text(
                "ALTER TABLE conversations ADD COLUMN model_c VARCHAR(100)"
            ))
            print("✓ Added model_c column")
        except Exception as e:
            print(f"model_c column might already exist: {e}")

        # Add system_prompt_c column
        try:
            await conn.execute(text(
                "ALTER TABLE conversations ADD COLUMN system_prompt_c TEXT"
            ))
            print("✓ Added system_prompt_c column")
        except Exception as e:
            print(f"system_prompt_c column might already exist: {e}")

    print("\nMigration complete!")


if __name__ == "__main__":
    asyncio.run(migrate())
