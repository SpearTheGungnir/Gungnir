#!/bin/bash
# 杀死监听3000端口的进程
node_pid=$(lsof -t -i:3000)
# [ -n str ]判断str是否不为空，⑨表示强制
[ -n "$node_pid" ] && kill -9 $node_pid

rm -rf /home/myapp
cp -r ${WORKSPACE}/source/server/myapp /home
cd /home/myapp
npm install

BUILD_ID=DONTKILLME
# startnode.sh
# cd /home/myapp
# npm install
# nohup npm start&
# 不知为何要套一层sh才能不被杀死
sh /home/startnode.sh
