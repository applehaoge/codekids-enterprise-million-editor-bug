from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CodeKids Python Backend",
    root_path="/py"
)


# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 可根据安全策略调整
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/")
def read_root():
    return {"message": "Python backend running (CodeKids Enterprise)"}
