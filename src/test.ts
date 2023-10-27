import {sign} from "./sign";
import {qrcode, schools, schoolCache} from "./api";
import * as open from "open";
import {MD5} from "crypto-js";
import Client from "./client";
import * as Fs from "fs";

const {AutoComplete, prompt, Select, Input, Password} = require('enquirer');


const client: Client = new Client();


Fs.mkdirSync(process.cwd() + "/cache", {recursive: true});

(async () => {
    await schools()
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


    let type: string = "";
    await login.run().then((data: any) => {
        if (data === "账户密码") {
            type = "password";
            schoolIn.run().then((data: any) => {
                username.run().then((uname: any) => {
                    password.run().then((pwd: any) => {
                        client.doLogin("password", {
                            sch: schoolCache[data],
                            username: uname,
                            password: pwd
                        }).then((dataa) => {
                            console.log("登录完成pwd")
                            console.log(dataa)
                        })
                    })
                })
            })
        }
        if (data === ("二维码登陆(强烈推荐)")) {
            type = "qrcode";
            qrcode().then((data) => {
                console.log(data.terminal)
                console.log("请在1分钟之内，使用pu口袋校园app扫描上方二维码登录。")
                client.doLogin("qrcode", data.token).then((dataa) => {
                    console.log("登录完成qrcode")

                })
            })
        }
        if (data === "浏览器token(不推荐)") {
            type = "token";
        }
    })
})()

