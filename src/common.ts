import {Client, qrcode} from "./client";
import {callSchoolList, schoolCache} from "./api";
import {loginType, SchoolEvent} from "./entity";
import {scheduleJob} from "node-schedule";

const {AutoComplete, prompt, Select, Input, Password} = require('enquirer');
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
export const createClient = async (options: { sch: string, username: string, password: string }): Promise<Client> => {
    const client: Client = new Client();
    return client.doLogin("password", {
        sch: options.sch,
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

export const filter = async (events: Array<SchoolEvent>, options: {
    time?: TimeInterval | Date
    name?: string
}): Promise<Array<SchoolEvent>> => {

    const events1 = events.filter((event) => {

    });
    return events1;
}
const events: Array<any> = [];
export const markEvent = (client: Client, eventId: string | number): void => {
    events.push({client: client, eventId: eventId})
}
const job = scheduleJob('0/1 * * * * *', function () {
    console.log(1698811200000 - new Date().getTime())
    if (new Date().getTime() >= 1698811200000) {
        events.forEach((v) => {
            console.log("exe---")
            v.client.joinEvent(v.eventId).then((v: any) => {
                console.log(v)
            })
            console.log(`t >${v.client.userdata.user_info.uid
            } event> ${v.eventId}`)
        })
    }

});
