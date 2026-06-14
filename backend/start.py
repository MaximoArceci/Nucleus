import argparse
from main_constants import HOST_APP, PORT_APP


def start_app(reload: bool = False):
    import uvicorn
    uvicorn.run(
        "main:main_app",
        host=HOST_APP,
        port=PORT_APP,
        reload=reload
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--reload", action="store_true")
    args = parser.parse_args()
    start_app(reload=args.reload)
