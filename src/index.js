const Devices = require('./utils/devices')
const MqttClient = require('./utils/mqtt')
const logger = require('./utils/log4js').getLogger('index', 'debug');
const configuration = require('../conf/settings.json')

logger.info('创建MQTT服务')
client = new MqttClient(configuration.mqtt)

logger.info('实例化设备')
for (i in configuration.devices) {
    try {
        const device = new Devices(configuration.devices[i])
        client.enrollDevices(device)
    } catch (error) {
        logger.error(error)
    }

}

