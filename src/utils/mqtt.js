const mqtt = require('mqtt')
const schedule = require('node-schedule');
const logger = require('./log4js').getLogger('mqtt', 'debug');
const validate = require('jsonschema').validate;
const configSchema = require('../../conf/schema.json').mqtt

class MqttClient {
    // init
    constructor(configuration) {
        logger.info('初始化MQTT服务')
        let optionError = validate(configuration, configSchema).errors
        if (optionError.length !== 0) { throw optionError }
        this.args = configuration
        this.deviceList = Object

        logger.info('与MQTT服务器建立连接')
        this.client = mqtt.connect(this.args.url, {})
        this._listenConnectError()
        this._subscribeSetTopic()
        this._listenCommands()
    }

    // 添加设备实例到服务
    enrollDevices(device) {
        let deviceNmae = device.name
        let topic = device.topic = `${this.args.discoveryPrefix}/switch/wol/${deviceNmae}`
        let _client = this.client
        let message = `{"name": "${deviceNmae}", "command_topic": "${topic}/set", "state_topic": "${topic}/state"}`
        logger.info(`注册设备：<${deviceNmae}>`)
        this.client.publish(`${topic}/config`, message)
        this.deviceList[deviceNmae] = device
        this._getState(deviceNmae, `<${deviceNmae}>: 状态已同步`)

        schedule.scheduleJob(`0 */${this.args.checkInterval} * * * *`, function () {
            let oldState = device.state
            let newState = device.checkState()
            _client.publish(`${device.topic}/state`, newState)
            logger.info(`<${deviceNmae}>: 校验设备状态 ${oldState} --> ${newState} `)
        })
    }

    // 获取设备状态
    _getState(deviceNmae, msg=false) {
        let device = this.deviceList[deviceNmae]
        let STATE = device.state
        let client = this.client
        schedule.scheduleJob('* * * * * *', function () {
            device.checkState()
            if (device.state == STATE) {
                client.publish(`${device.topic}/state`, 'None')
            } else {
                client.publish(`${device.topic}/state`, device.state)
                if(msg){logger.info(msg)}
                this.cancel()
            }
        });
    }

    // 关机
    _powerOff(deviceNmae) {
        logger.info(`<${deviceNmae}>: 正在关机`)
        this.deviceList[deviceNmae].shutdown()
        this.client.publish(`${this.deviceList[deviceNmae].topic}/state`, 'None')
        this._getState(deviceNmae, `<${deviceNmae}>: 关机完成`)
    }

    // 开机
    _powerOn(deviceNmae) {
        logger.info(`<${deviceNmae}>: 正在启动`)
        this.deviceList[deviceNmae].boot()
        this.client.publish(`${this.deviceList[deviceNmae].topic}/state`, 'None')
        this._getState(deviceNmae, `<${deviceNmae}>: 启动完成`)
    }

    // 解析收到的指令
    _parseCommand(topic, message) {
        let deviceNmae = topic.split('/')[3]
        logger.info(`---<${deviceNmae} : ${message}>---`)
        if (!(deviceNmae in this.deviceList)) {
            logger.info('无效指令：设备不在列表中')
            return
        }
        let deviceState = this.deviceList[deviceNmae].state
        this.client.publish(`${this.deviceList[deviceNmae].topic}/state`, deviceState)
        if (message == 'ON' && deviceState == 'OFF') {
            this._powerOn(deviceNmae)
        } else if (message == 'OFF' && deviceState == 'ON') {
            this._powerOff(deviceNmae)
        } else {
            logger.info('无效指令：设备状态未同步')
        }
    }

    // 监听订阅的主题
    _listenCommands() {
        logger.info('开始监听指令')
        let mqttClient = this
        this.client.on('message', function (topic, message) {
            mqttClient._parseCommand(topic, message)
        })
    }

    // 订阅主题
    _subscribeSetTopic() {
        let topicOfSet = `${this.args.discoveryPrefix}/switch/wol/+/set`
        this.client.subscribe(topicOfSet)
        logger.info(`订阅监听主题: ${topicOfSet}`)
    }

    // 监听异常
    _listenConnectError() {
        this.client.on('error', function (error) {
            logger.error('连接MQTT 服务器失败')
            throw error
        })
    }
}

module.exports = MqttClient;