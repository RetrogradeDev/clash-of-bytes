import sys
from time import time

def run_user_code(code: str):
    try:
        exec(code)
    except Exception as e:
        print(e, file=sys.stderr)

if __name__ == "__main__":
    code = sys.stdin.read()

    start_time = time()
    run_user_code(code)
    end_time = time()
    print(f"_TIME${(end_time - start_time) * 1000}", flush=True)
