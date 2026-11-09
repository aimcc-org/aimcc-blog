# ============================================================
# 基础镜像：自带 Java 25 运行时（JRE）的精简 Linux
# - 选 jre 而不是 jdk：jar 已经编译好，容器里只需要跑，不需要 javac
# - 体积差别很大，jre 大约 200MB 级别，jdk 要 400MB 以上
# ============================================================
FROM eclipse-temurin:25-jre

# 容器内的工作目录：后面的相对路径都以它为基准
WORKDIR /app

# 把宿主机上打好包的 jar 拷进镜像，并重命名为 app.jar
# 注意两点：
#   1. 源路径 target/... 是相对构建上下文（即 server/ 目录）说的，
#      所以 docker build 必须在 server/ 目录下执行
#   2. 目标路径写绝对路径 /app/app.jar，避免相对路径被 WORKDIR 拼接后
#      跟下面 ENTRYPOINT 里写的路径对不上（这个坑我第一次就踩了）
COPY target/server-0.0.1-SNAPSHOT.jar /app/app.jar

# 容器启动时执行的命令
# 用 JSON 数组形式（exec form）：java 进程会成为容器内的 1 号进程，
# 能正确接收 SIGTERM 信号做优雅停机；写成 shell 形式则会被包一层 sh
ENTRYPOINT ["java", "-jar", "/app/app.jar"]

# 声明本镜像的服务监听 8080 端口
# 纯声明性质，不会真的开放端口；真正映射要到 docker run 时用 -p 指定
EXPOSE 8080
