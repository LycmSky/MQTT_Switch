# MQTT_Switch
通过MQTT控制设备开关机

# 功能
在网络中部署该服务，通过MQTT协议接收指令，可接入HomeAssistant等服务  
用于控制本地设备的开机和关机

## MQTT
通过MQTT协议进行通讯，执行指令，上报状态
## wake_on_lan
通过主板的网络唤醒功能执行设备唤醒任务
## ssh2
通过ssh登录目标机器执行设备关机任务