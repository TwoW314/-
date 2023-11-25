import {BClient, qrcode} from "./o/BClient";
import {EventInfo, loginType} from "./o/entity";
import {scheduleJob} from "node-schedule";
import * as log4js from "log4js";
import {Client, ClientImp} from "./client";
import {callSchoolList, requestOptions, schoolCache} from "./o/api";
const {AutoComplete, prompt, Select, Input, Password} = require('enquirer');
const logger = log4js.getLogger("COMMON");

/*
不属于模块函数
 */
export async function markEvent(client: Client, event: string | number | EventInfo) {
    let eventObj: EventInfo;
    if (typeof event === 'string' || typeof event === 'number') {
        eventObj = await client.eventInfo(event).then((d) => {
            return d.data;
        })
    } else {
        eventObj = event;
    }
    const time = new Date().getTime()
    const eventRegEndTime = Number.parseInt(String(eventObj.regEndTimeStr)) * 1000;
    if (eventRegEndTime < time) {
        logger.warn(`活动: ${eventObj.name}报名已经结束无法加入!`)
    } else {
        if (eventObj.name) {
            logger.info("已添加到任务列表:" + eventObj.name);
            events.push({client: client, event: eventObj, bps: true});
        } else {
            logger.warn("活动不存在")
        }

    }


}

const events: Array<{ client: Client, event: EventInfo, bps: boolean }> = [];
const toTimeString = (time: number) => {
    const ss: number = Math.floor(time / 1000) % 60;
    const mm: number = Math.floor(time / 1000 / 60) % 60;
    const hh: number = Math.floor(time / 1000 / 60 / 60);

    return `${hh}小时 ${mm}分钟 ${ss}秒`;
}

const job = scheduleJob('0/1 * * * * *', function () {
    events.forEach((v) => {
            const time = new Date().getTime() - 1000
            const eventRegTime = Number.parseInt(String(v.event.regStartTimeStr)) * 1000;
            if (time >= eventRegTime) {
                if (v.bps) {


                    if (v.client.joinDelay < Date.now()) {
                        v.client.joinEvent(v.event.actiId).then((data) => {

                            if (data.status) {
                                logger.info(`账户:${v.client.userinfo?.realname} 活动: ${v.event.name} 报名成功`)
                                v.bps = false;
                            } else {
                                logger.warn(`账户:${v.client.userinfo?.realname} 活动: ${v.event.name} 报名失败 原因:${data.data}`)
                                if (data.data === "报名人数已达限制，无法报名哦~") {
                                    v.bps = false;
                                }
                            }
                        })
                    } else {
                        logger.warn(`cd中...`)

                    }
                }

            } else {
                logger.mark(`账户:${v.client.userinfo?.realname} 活动: ${v.event.name} 未到签到时间还剩 ${toTimeString(eventRegTime - time)}`)
            }

        }
    )
});
export const terminalClient = async (): Promise<Client> => {
    await callSchoolList()
    const client: Client = new ClientImp();
    const login = new Select(
        {
            name: "login",
            message: "请选择登录方式",
            choices: ['二维码登陆(强烈推荐)', '账户密码', '浏览器token(不推荐)']
        }
    );
    const schoolIn = new AutoComplete({
        name: 'school',
        message: '选择你的学校',
        limit: 10,
        initial: 2,
        choices: Object.keys(schoolCache)
    });
    const username = new Input({
        name: 'school',
        message: '输入你的学号或身份证',
    });

    const password = new Password({
        name: 'password',
        message: '输入你的密码',
    });
    let type: loginType = "save";
    let token;
    let un;
    let up;
    let sc;
    const method: any = await login.run().then((data: any) => {
        return data;
    })

    if (method === "账户密码") {
        const scho = await schoolIn.run().then((data: any) => {
            return data;
        })
        const uname = await username.run().then((uname: any) => {
            return uname;
        })
        const pwd = await password.run().then((password: any) => {
            return password;
        })
        un = uname;
        up = pwd;
        sc = schoolCache[scho];
        type = "password";
    }
    if (method === ("二维码登陆(强烈推荐)")) {
        type = "qrcode";
        await qrcode().then((data) => {
            console.log(data.terminal)
            console.log("请在1分钟之内，使用pu口袋校园app扫描上方二维码登录。")
            token = data.token;

        })
    }
    if (method === "浏览器token(不推荐)") {
        type = "token";
    }
    if (type === "password") {
        return client.login(un, up, sc).then((client) => {

            return client;

        })
    }
    if (type === "qrcode") {
        return client.login(token).then((client) => {

            return client;

        })
    }
    return Promise.reject("未知错误")
};