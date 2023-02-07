# 功能
通过MQTT控制设备开关机，接入HomeAssistant

## MQTT
通过MQTT协议进行通讯，执行指令，上报状态
## wake_on_lan
通过主板的网络唤醒功能执行设备唤醒任务### ssh2
通过ssh登录目标机器执行设备关机任务

# 使用部署
## 一、配置目标设备
*请自行查询配置方法*
- 开启ssh
- 开启网络唤醒

## 二、下载项目到本地
- git clong
    ```git
    git clone https://github.com/LycmSky/MQTT_Switch.git
    ```
- 下载压缩包  
    https://github.com/LycmSky/MQTT_Switch/archive/refs/heads/main.zip

## 三、填写配置
在 `conf/settings.json` 中填入自己的配置信息
### mqtt  
|关键字|描述|
|:---|:--|
|url|MQTT服务器的地址(及端口)|
|options|连接MQTT服务器的参数 ([options](#options))|
|discoveryPrefix|HomeAssistant中MQTT自动发现的前缀|
|checkInterval|检查矫正设备在线状态的间隔时间(分钟)|

### devices
此项为设备配置列表，([设备配置](#设备配置))

### options
|关键字|描述|
|:---|:---|
|clean|(可选) true: 清除会话, false: 保留会话|
|connectTimeout|(可选) 超时时间|
|clientId|(可选) 设置客户端ID|
|username|(可选) 用户名|
|password|(可选) 用户密码|

### 设备配置
|关键字|描述|
|:---|:---|
|name|设备名称|
|macAddress|设备唤醒网卡的MAC地址|
|ipAddress|设备的IP地址|
|wakePort|用于网络唤醒的端口|
|username|SSH 用户名|
|password|SSH 密码|
|sshPort|SSH 端口|

## 四、运行项目
### 安装依赖
```shell
pnpm install
```
### 启动项目
```shell
pnpm start
```