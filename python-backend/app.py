from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CodeKids Python Backend",
    root_path="/py"
)


# CORS配置
# Note: According to the CORS specification, credentialed requests cannot
# use a wildcard ("*") for `Access-Control-Allow-Origin`. The previous
# configuration set `allow_origins` to "*" while also enabling
# `allow_credentials`, which results in browsers rejecting requests that
# include credentials. Since the backend is currently configured with a
# wildcard origin, disable credentials by default to avoid this runtime
# error. If credentialed requests are required, specify explicit origins
# instead of "*".
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 可根据安全策略调整
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Python backend running (CodeKids Enterprise)"}
