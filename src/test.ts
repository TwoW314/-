import {sign} from "./sign";
import {qrcode, schools, schoolCache} from "./api";
import * as open from "open";
import {MD5} from "crypto-js";
import Client, {loginType} from "./client";
import * as Fs from "fs";
import * as nconf from "nconf"
import inquirer from "inquirer";
import {Provider} from "nconf";

const {AutoComplete, prompt, Select, Input, Password} = require('enquirer');
const config: Provider = nconf.file({file: process.cwd() + "/config/client.json"});


(async () => {
    await schools()
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

    client.doLogin(type, msg).then((client) => {
        if (client.isLogin) {
            console.log(`登陆成功! 用户名${client.uid}`)
            const auto = new Select(
                {
                    name: 'autologin',
                    message: `是否将此账户(${client.uid})设为自动登陆？`,
                    choices: ["是", "否"]
                }
            );
            const autoLogin = auto.run().then((v: string) => {
                return v;
            })
            if (autoLogin === "是") {

                config.set("autoLogin", client.uid);
                config.save(() => {
                })

            }
        } else {
            console.log(`登陆失败! ` + client.errmsg)
        }

    })


})();
