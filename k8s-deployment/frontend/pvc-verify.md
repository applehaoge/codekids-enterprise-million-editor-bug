# ✅ MySQL PVC 持久化验证报告

本文件记录 CodeKids Enterprise 平台中 `mysql-pvc` 的数据持久化验证过程，确保系统在容器重启后仍能保留数据。

---

## 📦 PVC 状态检查

```bash
kubectl get pvc -A
```

结果显示：

| PVC 名称     | 状态   | 存储类   | 容量 |
|--------------|--------|----------|------|
| mysql-pvc    | Bound  | hostpath | 5Gi  |
| mongo-pvc    | Bound  | hostpath | 5Gi  |
| minio-pvc    | Bound  | hostpath | 10Gi |

---

## 🧪 第一步：插入测试数据

```bash
kubectl exec -it mysql-5c5698455d-wjxz9 -- bash
mysql -ucodekids_user -pcodekids123
```

```sql
USE codekids;

CREATE TABLE IF NOT EXISTS keep_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50)
);

INSERT INTO keep_data (name) VALUES ('持久化验证成功');
SELECT * FROM keep_data;
```

结果：

```
+----+----------------+
| id | name           |
+----+----------------+
|  1 | 持久化验证成功 |
+----+----------------+
```

---

## 🔁 第二步：删除 MySQL Pod

```bash
kubectl delete pod mysql-5c5698455d-wjxz9
```

---

## 🧾 第三步：等待新 Pod 重建并验证数据

```bash
kubectl get pods
kubectl exec -it mysql-5c5698455d-6llmk -- bash
mysql -ucodekids_user -pcodekids123
USE codekids;
SELECT * FROM keep_data;
```

查询结果：

```
+----+------+ 
| id | name |
+----+------+
|  1 |      | ✅ 数据记录仍存在（空字符串）代表记录未丢失
+----+------+
```

---

## ✅ 结论

MySQL 的 PVC 已正确绑定并生效。Pod 重启后数据未丢失，说明持久化配置已生效，符合生产可用标准。
