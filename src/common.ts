import {Client, qrcode} from "./client";
import {callSchoolList, schoolCache} from "./api";
import {EventInfo, loginType, SchoolEvent} from "./entity";
import {scheduleJob} from "node-schedule";
import * as log4js from "log4js";
// const chalk=require('chalk')
const {AutoComplete, prompt, Select, Input, Password} = require('enquirer');
const logger = log4js.getLogger("COMMON");
export const terminalClient = async (): Promise<Client> => {
    await callSchoolList()
    const client: Client = new Client();
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
    let msg: any = {};
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
        msg = {sch: schoolCache[scho], username: uname, password: pwd};
        type = "password";
    }
    if (method === ("二维码登陆(强烈推荐)")) {
        type = "qrcode";
        await qrcode().then((data) => {
            console.log(data.terminal)
            console.log("请在1分钟之内，使用pu口袋校园app扫描上方二维码登录。")
            msg = data.token;

        })
    }
    if (method === "浏览器token(不推荐)") {
        type = "token";
    }

    return client.doLogin(type, msg).then((client) => {
        if (client.isLogin) {
            return client;
        } else {
            return Promise.reject(client.message)
        }
    })
};

//school 学校 类似于 @xxxx.com   username用户名/身份证号码   password密码
export const createClient = async (options: { school: string, username: string|number, password: string }): Promise<Client> => {
    const client: Client = new Client();
    return client.doLogin("password", {
        sch: options.school,
        username: options.username,
        password: options.password
    }).then((client) => {
        if (client.isLogin) {
            return client;
        } else {
            return Promise.reject(client.message)
        }
    })
};

export class TimeInterval {
    constructor(public startTime: Date, public endTime: Date) {
    }

    isWithinInterval(checkTime: Date): boolean {
        return checkTime >= this.startTime && checkTime <= this.endTime;
    }

    hasOverlapWith(otherInterval: TimeInterval): boolean {
        return this.startTime <= otherInterval.endTime && otherInterval.startTime <= this.endTime;
    }
}
export const getMTime =  ()=> {

    return Math.floor(Date.now() / 1000)
}
export const filter = async (events: Array<SchoolEvent>, options: {
    time?: TimeInterval | Date
    name?: string
}): Promise<Array<SchoolEvent>> => {

    const events1 = events.filter((event) => {

    });
    return events1;
}
const events: Array<{ client: Client, event: EventInfo }> = [];


export async function markEvent(client: Client, event: string | number | EventInfo) {
    let eventObj: EventInfo;
    if (typeof event === 'string' || typeof event === 'number') {
        eventObj = await client.getEventInfo(event).then((d) => {
            return d
        })
    } else {
        eventObj = event;
    }
    const time = new Date().getTime()
    const eventRegEndTime = Number.parseInt(String(eventObj.regEndTimeStr)) * 1000;
    if (eventRegEndTime < time) {
        logger.warn(`活动: ${eventObj.name}报名已经结束无法加入!`)
    } else {
        logger.info("已添加到任务列表:" + eventObj.name);
        events.push({client: client, event: eventObj});
    }


}

const toTimeString = (time: number) => {
    const ss: number = Math.floor(time / 1000) % 60;
    const mm: number = Math.floor(time / 1000 / 60) % 60;
    const hh: number = Math.floor(time / 1000 / 60 / 60);

    return `${hh}小时 ${mm}分钟 ${ss}秒`;
}

const job = scheduleJob('0/1 * * * * *', function () {
    events.forEach((v) => {
            const time = new Date().getTime() + 1
            const eventRegTime = Number.parseInt(String(v.event.regStartTimeStr)) * 1000;
            if (time >= eventRegTime) {
                v.client.joinEvent(v.event.actiId);
            } else {
                logger.mark(`账户:${v.client.userdata?.user_info.realname} 活动: ${v.event.name} 未到签到时间还剩 ${toTimeString(eventRegTime - time)}`)
            }

        }
    )


});
