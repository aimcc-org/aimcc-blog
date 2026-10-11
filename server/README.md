# Server

Spring Boot 4.1.1 + JDK 25 + MyBatis-Plus + MySQL + Flyway + Sa-Token + Redis

## 本地启动

需要环境变量：
- `DB_PASSWORD`：MySQL 密码
- `REDIS_PASSWORD`：Redis 密码

```bash
./mvnw spring-boot:run
```

## 打包部署

```bash
./mvnw clean package -DskipTests
scp target/server-0.0.1-SNAPSHOT.jar root@47.96.92.202:/opt/blog/blog.jar
ssh root@47.96.92.202 "systemctl restart blog"
```

## 服务器排障

```bash
journalctl -u blog -n 50 --no-pager    # 看最近 50 行日志
journalctl -u blog -f                  # 实时日志
systemctl status blog --no-pager       # 服务状态
curl http://localhost:8080/api/articles  # 本机自测
```

## 目录结构

```
server/
├── mvnw              # Maven 构建脚本（Mac/Linux 用）
├── mvnw.cmd          # Maven 构建脚本（Windows 用）
├── pom.xml           # 依赖配置文件
├── .gitignore        # Git 忽略配置（不用管）
├── .gitattributes    # 换行符自动处理（不用管）
└── src/main/java/com/aimcc/blog/
    ├── controller/    # 接口入口
    ├── service/       # 业务逻辑（接口 + 实现类）
    ├── mapper/        # 数据库操作
    ├── entity/        # 数据库表对应实体类
    ├── dto/           # 请求参数和返回数据
    ├── common/        # 统一返回格式、工具类
    ├── exception/     # 全局异常处理
    ├── config/        # 配置类
    └── ServerApplication.java  # 启动入口
```
