
import * as log4js from 'log4js';
import {markEvent, terminalClient} from "./common";
import {Client} from "./client";

const {Input} = require('enquirer');
log4js.configure({
    appenders: {
        console: {
            type: 'console',
            layout: {
                type: 'pattern',
                pattern: '[%d{DATETIME}][%p][%c]: %m',
            },
        },
        file: {
            type: 'file',
            filename: 'logs/app.log',
            layout: {
                type: 'pattern',
                pattern: '[%d{ISO8601}] [%p] %c - %m%n',
            },
        },
    },
    categories: {
        default: {appenders: ['console', 'file'], level: 'info'},
    },
});
terminalClient().then((client: Client) => {
    console.log(`登陆成功用户名: ${client.userinfo?.realname}`)
    const events = new Input({
        name: 'eventId',
        message: '输入需要的活动id多个用/隔开',
    });
    events.run().then((data: any) => {
        (data as string).split("/").forEach((v) => {
            markEvent(client, Number(v))
        })
        console.log(data)
    })
})