const wol = require('wake_on_lan');
const ssh = require('ssh2');
const logger = require('./log4js').getLogger('devices', 'info');
const validate = require('jsonschema').validate;
const configSchema = require('../../conf/schema.json').devices

class Devices {
    // init
    constructor(configuration) {
        logger.info(`初始化设备实例 <${configuration.name}>`)
        let optionError = validate(configuration, configSchema).errors
        if (optionError.length !== 0) { throw optionError }
        this.options = configuration
        this.sshOptions = {
            'host': this.options.ipAddress,
            'port': this.options.sshPort,
            'username': this.options.username,
            'password': this.options.password,
            'readyTimeout': 1000
        }

        this.sshClient = new ssh.Client();
        this.name = this.options.name
        this.state = 'UNKNOW'
    }

    // 获取设备在线状态
    checkState() {
        let devices = this
        let client = new ssh.Client();
        client.on('ready', function () {
            devices.state = 'ON'
        }).on('error', function () {
            devices.state = 'OFF'
        }).connect(this.sshOptions)
        return this.state
    }

    // wake on lan
    boot() {
        wol.wake(this.options.macAddress, {
            address: this.options.ipAddress.replace(/\d+$/g, 255),
            port: this.options.wakePort
        }, function (error) {
            if (error)
                logger.error(error)
        });
    }

    // ssh shutdown
    shutdown() {
        let devices = this
        this.sshClient
            .on('ready', function () {
                devices.sshClient.exec('shutdown -h now', (error, stream) => {
                    if (error) { throw error }
                })
            })
            .connect(this.sshOptions)
    }
}

module.exports = Devices;