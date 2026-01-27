#!/usr/bin/env python3
"""Run the Neural Discourse server."""

import os
import uvicorn

if __name__ == "__main__":
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    reload = os.getenv("ENVIRONMENT", "development") == "development"

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload,
    )
