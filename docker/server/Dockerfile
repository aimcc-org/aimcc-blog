# 基础镜像：自带 Java 25 运行时的 Linux
# 用 jre 不用 jdk：jar 已经编译好，运行只需要 JRE，体积小一半
FROM eclipse-temurin:25-jre

# 容器内的工作目录，后面的相对路径都以它为基准
WORKDIR /app

# 把打好的 jar 拷进镜像
# 源路径相对于「构建上下文」= server/ 目录，不是相对这个 Dockerfile 所在的位置
# 所以构建命令是：docker build -f docker/server/Dockerfile ./server
# 目标路径写绝对路径，避免相对路径被 WORKDIR 拼接后和启动命令对不上
COPY target/server-0.0.1-SNAPSHOT.jar /app/app.jar

# 容器启动时执行的命令：运行 jar
# 用 JSON 数组形式，java 才是容器内的 1 号进程，能收到 SIGTERM 优雅停机
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

# 声明服务监听 8080
# 只是声明，真正对外映射由 docker run -p 或 compose 的 ports 决定
EXPOSE 8080
