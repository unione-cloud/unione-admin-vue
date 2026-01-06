# 使用Nginx镜像部署
FROM nginx:alpine

# 复制自定义Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制本地构建的产物到Nginx的html目录
COPY dist /usr/share/nginx/html/portal

# 暴露端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]