import {
    callEventInfo,
    callEventList,
    callJoinEvent,
    callPassword,
    callQrcode1,
    requestOptions,
    schoolCache
} from "./api";
import * as QRCode from "qrcode";
import {sign} from "./sign";
import {Sequelize} from "sequelize";
import {EventInfo, loginType, SchoolEvent, UserData} from "./entity";
import * as Log4js from "log4js"
import {markEvent} from "./common";

const logger = Log4js.getLogger("API")

export const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'data/db.sqlite'
});

export class Client {
    private count: number = 30;
    private token: string | undefined;
    userdata: UserData | undefined;
    isLogin: boolean = false;
    message: string = "";
    async doLogin(login: loginType, data: any | string): Promise<Client> {
        switch (login) {
            case "qrcode": {
                this.token = data;
                await this.poll().then((v) => {
                        this.isLogin = true;
                        this.userdata = v;
                    }
                ).catch((v) => {
                        this.isLogin = false;
                        this.userdata = v;
                    }
                )
                break;
            }
            case "password": {
                await callPassword(this, data).then((v) => {
                        this.isLogin = true;
                        this.userdata = v;
                    }
                ).catch((v) => {
                        this.isLogin = false;
                        this.userdata = v;
                        this.message = v.message;
                    }
                )
                break;
            }
            case "token": {
            }
        }
        return this;
    }

    private doAfter() {
        if (!this.isLogin) {
            return;
        }
    }
    //二维码轮询
    private async poll() {
        while (true) {
            this.count--;
            if (this.userdata != undefined) {
                return this.userdata;
            }
            if (this.count < 0) {
                return Promise.reject("二维码超时")
            }
            const formData = new FormData();
            formData.append('token', this.token as string);
            await callQrcode1(this, this.token + "").then((data) => {
                switch (data.message) {
                    case "继续轮询": {
                        return
                    }
                    case "success": {
                        this.userdata = data.content;
                        break
                    }
                }
            })
            await new Promise(r => setTimeout(r, 1000))
        }
    }
    private async pwd(data: any) {
        await callPassword(this, data).then((data => {
            if (data.message === "success") {
                return data
            }
            return Promise.reject(data.message)

        }))
    }

    public async joinEvent(eventId: string | number): Promise<{ status: boolean, message: string }> {
        return await callJoinEvent(this, eventId).then((data) => {
            if (data.msg.includes("记得准时签到哦~")) {
                logger.info(`活动 ${eventId} 加入成功！`)
                return {status: true, message: data.msg};
            } else {
                logger.info(`活动 ${eventId} 加入失败！`)
                return {status: false, message: data.msg};
            }
        })
    }
    public async markEvent(eventid:string|number){
        return markEvent(this,eventid);
    }
    public async eventList(page: number, keyword: string): Promise<Array<SchoolEvent>> {
        return await callEventList(this, page, keyword).then((data) => {
            return data.content;
        })
    }
    public async getEventInfo(eventId:string|number): Promise<EventInfo> {
        return await callEventInfo(this, eventId).then((data:any) => {
            return data.content;
        })
    }


}
export const qrcode = async (start?: number, end?: number): Promise<{
    token: string;
    qrcode: string;
    terminal: string;
    filePath: string
}> => {
    const url = 'https://pocketuni.net/index.php?app=api&mod=Sitelist&act=loginQrcode';
    return await fetch(url, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('网络请求失败');
            }
            return response.json();
        })
        .then(async (data): Promise<{ token: string, qrcode: string, terminal: string; filePath: string }> => {
            const qrcodeUrl = `https://h5.pocketuni.net/QR_login/index.html?token=${data.content.token}`;
            await QRCode.toFile(process.cwd() + "/cache/qrcode.png", qrcodeUrl)
            let terminalText: string = ""
            QRCode.toString(qrcodeUrl, {type: 'terminal', scale: 20}, (err: any, url: string) => {
                terminalText = url;
            })

            return {
                filePath: process.cwd() + "/cache/qrcode.png",
                qrcode: `${qrcodeUrl}`,
                terminal: `${terminalText}`,
                token: `${data.content.token}`
            }
        })
}


