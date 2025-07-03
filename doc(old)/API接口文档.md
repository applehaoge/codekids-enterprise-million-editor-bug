
# API接口文档

## 用户相关
- POST /api/login
- POST /api/register
- GET /api/user/info

## 课程相关
- GET /api/courses
- GET /api/courses/{id}
- POST /api/courses/{id}/submit

## 任务状态
- GET /api/task/{task_id}/status
- GET /api/task/{task_id}/logs

## 管理端
- GET /api/admin/users
- GET /api/admin/tasks
- GET /api/admin/statistics
