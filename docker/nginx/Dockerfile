# 基础镜像：nginx 官方 alpine 版，自带 nginx，体积约 50MB
# 这个镜像只是「提供运行环境」，不带任何静态文件
FROM nginx:alpine

# 用我们的配置替换掉默认的站点配置
# nginx 官方镜像默认会读 /etc/nginx/conf.d/*.conf，
# 其中 default.conf 是自带的示例站点，直接覆盖成我们的
COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# 把构建好的静态文件放进镜像
# 源路径相对于构建上下文，而构建上下文是「仓库根目录」，
# 所以这里要写完整路径：front/blog-web/dist/main
# 前提是前端已经构建过（pnpm build 产出 dist/main）
COPY front/blog-web/dist/main /usr/share/nginx/html

# 管理后台：React SPA 的打包产物，放进 /admin 子目录
# 访问路径就是 /admin/，由 nginx.conf 里的 location /admin/ 接管
# 前提是 admin 也构建过（pnpm build 产出 front/blog-admin/dist）
COPY front/blog-admin/dist /usr/share/nginx/html/admin

# 声明服务监听 80
# 只是声明，真正对外映射由 compose 的 ports 决定
EXPOSE 80
