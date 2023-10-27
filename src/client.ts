import {prompt} from 'enquirer';
import {clearInterval} from "timers";
import {sign} from "./sign";
import * as nconf from "nconf"
import {requestOptions, schoolCache, search} from "./api";


export default class Client {
    private count: number = 30;
    private token: string | undefined;
    private loginData: any = undefined;

    async doLogin(login: "qrcode" | "password" | "token" | "save" | string, data: any | string) {
        switch (login) {
            case "qrcode": {
                this.token = data;
                await this.poll()
                return this;
            }
            case "password": {
                await this.pwd(data)
                return this;
            }
            case "token": {

            }
        }

    }

    private async poll() {
        while (true) {
            this.count--;
            if (this.loginData != undefined) {
                return this.loginData;
            }
            if (this.count < 0) {
                console.log("二维码超时")
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
                        console.log("继续轮询")
                        break
                    }
                    case "success": {
                        this.loginData = data;
                        break
                    }
                }

            })
            await new Promise(r => setTimeout(r, 1000))
        }
    }

    private async pwd(data: any) {
        // {sch:schoolCache[data],username:uname,password:pwd}
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
            this.loginData = data;
            return data
        })
    }
}