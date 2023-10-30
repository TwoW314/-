import * as Fs from "fs";
import * as nconf from "nconf"
import {requestOptions, schoolCache, search} from "./api";
import {Provider} from "nconf";
import * as QRCode from "qrcode";
import {sign} from "./sign";

export type loginType = "qrcode" | "password" | "token" | "save";


Fs.mkdirSync(process.cwd() + "/cache", {recursive: true});
Fs.mkdirSync(process.cwd() + "/userinfo", {recursive: true});
Fs.writeFileSync(process.cwd() + "/config/client.json", "{}", {flag: "w"});

const client: Provider = nconf.file({file: process.cwd() + "/userinfo/client.json"});


export default class Client {
    private count: number = 30;
    private token: string | undefined;
    loginData: any = undefined;
    isLogin: boolean = false;
    username: string = "";
    uid: string = "";
    errmsg: string = "";

    async doLogin(login: loginType, data: any | string): Promise<Client> {
        switch (login) {
            case "qrcode": {
                this.token = data;
                await this.poll()
                this.doAfter();
                return this;
            }
            case "password": {
                await this.pwd(data)
                this.doAfter();
                return this;
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
        this.username = this.loginData.content.user_info.username;
        this.uid = this.loginData.content.user_info.uid;
        client.set(this.uid, this.loginData)
        client.save(() => {
        })
    }
    //二维码轮询
    private async poll() {
        while (true) {
            this.count--;
            if (this.loginData != undefined) {
                return this.loginData;
            }
            if (this.count < 0) {

                this.errmsg = "二维码超时";
                break
            }
            const formData = new FormData();
            formData.append('token', this.token as string);
            await fetch("https://pocketuni.net/index.php?app=api&mod=Sitelist&act=pollingLogin&0", Object.assign(requestOptions, {
                body: formData
            })).then(async (data) => {
                return data.json();
            }).then((data) => {
                switch (data.message) {
                    case "继续轮询": {
                        return
                    }
                    case "success": {
                        this.isLogin = true;
                        this.loginData = data;
                        break
                    }
                    default: {
                        this.errmsg = data.message;
                    }
                }

            })
            await new Promise(r => setTimeout(r, 1000))
        }
    }

    private async pwd(data: any) {
        const formData = new FormData();
        formData.append('email', data.username + "" + data.sch);
        formData.append('type', "pc");
        formData.append('password', data.password);
        formData.append('usernum', data.username);
        formData.append('sid', "");
        formData.append('school', data.sch);
        return fetch("https://pocketuni.net/index.php?app=api&mod=Sitelist&act=login", Object.assign(requestOptions, {
            body: formData
        })).then(async (data) => {
            return data.json();
        }).then(async (data) => {
            if (data.message === "success") {
                this.isLogin = true;
            }
            this.errmsg = data.message;
            this.loginData = data;
            return data
        })
    }
    public async joinEvent(eventId:string|number){
        const formData = new FormData();
        const time = Math.floor(Date.now() / 1000);

            formData.append('id',eventId+"");
            formData.append('time',time+"");
            formData.append('version',"7.10.0");
            formData.append('from',"pc");
            formData.append('oauth_token', this.loginData.content.oauth_token);
            formData.append('oauth_token_secret',   this.loginData.content.oauth_token_secret);
            formData.append('sign',sign(this.loginData.content.user_info.uid,eventId));
         return    await  fetch("https://pocketuni.net/index.php?app=api&mod=Event&act=join2&",   Object.assign(requestOptions,{
                body:formData
            })).then((data)=>{
                return data.json();
            }).then(data=>{
                if(data.msg.includes("记得准时签到哦~")){
                    console.log("加入成功！")

                }else {
                    console.log("加入失败！")
                }
return data;
            }
        )

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