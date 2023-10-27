import {prompt} from 'enquirer';
import {clearInterval} from "timers";
import {sign} from "./sign";
import * as nconf from "nconf"
import {requestOptions, schoolCache, search} from "./api";
import {Provider} from "nconf";

export type loginType = "qrcode" | "password" | "token" | "save";
const users: Provider = nconf.file({file: process.cwd() + "/userinfo/users.json"});
nconf.set("abc:aaa", "34")
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
        users.set(this.uid, this.loginData)
        users.save(() => {
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
                console.log("二维码超时")
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
}