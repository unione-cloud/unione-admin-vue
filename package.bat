chcp 65001
REM 编译源码
call npm run build

REM 构建镜像
call docker build -t unione.cloud/web:1.0.1 .

REM 程序更新完成
pause
