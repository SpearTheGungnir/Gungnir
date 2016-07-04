#!/bin/bash
# 杀死监听3000端口的进程
node_pid=$(lsof -t -i:3000)
# [ -n str ]判断str是否不为空，⑨表示强制
[ -n "$node_pid" ] && kill -9 $node_pid

# 更新目录
rm -rf /home/myapp
cp -r ${WORKSPACE}/source/server/myapp /home

# 将启动相关的脚本放在startnode.sh内
# cd /home/myapp
# npm install
# nohup npm start&
daemonize -E BUILD_ID=dontKillMe /home/startnode.sh
