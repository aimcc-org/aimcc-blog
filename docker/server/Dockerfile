# ============================================================
# 后端通用镜像：一个 Dockerfile 服务三个模块（gateway / public / admin）
#
# 构建上下文是 server/ 目录，用 MODULE 指定要打哪个模块的 jar：
#   docker build -f docker/server/Dockerfile \
#     --build-arg MODULE=blog-public-service \
#     -t aimcc-blog-public:latest ./server
#
# MODULE 不传会直接构建失败（下面有校验），避免默默打出一个空镜像
# PORT 只是镜像元信息，真正监听端口由各模块 application.yaml 的 server.port 决定
# ============================================================
FROM eclipse-temurin:25-jre-alpine

# 要打进去的模块目录名；blog-common 不产出可运行 jar，不能选它
ARG MODULE

# 声明端口：gateway 8080 / public 8081 / admin 8082
ARG PORT=8080

# 没传 MODULE 就在构建层直接报错，而不是拷一个不存在的路径
RUN test -n "$MODULE" || (echo "错误：必须传 --build-arg MODULE=blog-public-service|blog-admin-service|blog-gateway" && exit 1)

WORKDIR /app

# 源路径相对构建上下文（server/），所以是 <模块>/target/*.jar
# 用通配符兜住带版本号的 jar 名，升级版本不用改 Dockerfile
# 目标写绝对路径，避免被 WORKDIR 拼接后和启动命令对不上
COPY ${MODULE}/target/*.jar /app/app.jar

# JVM 参数留一个空壳，需要时 compose 里注入 JAVA_OPTS 即可
ENV JAVA_OPTS=""

# 用 sh -c 包一层是为了让 JAVA_OPTS 生效；exec 保证 java 仍是 1 号进程，能收到 SIGTERM 优雅停机
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]

# 只是声明，真正对外映射由 docker run -p 或 compose 的 ports 决定
EXPOSE ${PORT}
