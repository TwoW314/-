import {sign} from "./sign";
import {qrcode, schools, schoolCache} from "./api";
import * as open from "open";
import {MD5} from "crypto-js";
import Client from "./client";
import * as Fs from "fs";
import * as nconf from "nconf"

const {AutoComplete, prompt, Select, Input, Password} = require('enquirer');


const client: Client = new Client();


Fs.mkdirSync(process.cwd() + "/cache", {recursive: true});

Fs.mkdirSync(process.cwd() + "/userinfo", {recursive: true});
Fs.writeFileSync(process.cwd() + "/userinfo/users.json", "{}", {flag: "w"});

Fs.mkdirSync(process.cwd() + "/config", {recursive: true});


nconf.file({file: process.cwd() + "/userinfo/users.json"});
nconf.set("abc:aaa", "34")
nconf.save((e: any) => {
    console.log(e)
});
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


    let type: string;
    let msg: any = {};
    await login.run().then((data: any) => {

        if (data === "账户密码") {
            schoolIn.run().then((data: any) => {
                username.run().then((uname: any) => {
                    password.run().then((pwd: any) => {
                        msg = {sch: schoolCache[data], username: uname, password: pwd};
                        type = "password";
                    })
                })
            })
        }
        if (data === ("二维码登陆(强烈推荐)")) {
            type = "qrcode";
            qrcode().then((data) => {
                console.log(data.terminal)
                console.log("请在1分钟之内，使用pu口袋校园app扫描上方二维码登录。")
                msg = data.token;

            })
        }
        if (data === "浏览器token(不推荐)") {
            type = "token";
        }
    })
    client.doLogin("qrcode", msg).then((dataa) => {
        console.log("登录完成pwd")
        console.log(dataa)
    })
})();


const doAfterLogin = async (data: any): Promise<void> => {
    console.log("登陆成功！")
    const interval = setInterval(async () => {
            // const formData = new FormData();
            // const time = Math.floor(Date.now() / 1000);
            // if(time>=1698292800){
            //     formData.append('id',52558+"");
            //     formData.append('time',time+"");
            //     formData.append('version',"7.10.0");
            //     formData.append('from',"pc");
            //     formData.append('oauth_token', data.content.oauth_token);
            //     formData.append('oauth_token_secret',   data.content.oauth_token_secret);
            //     formData.append('sign',sign(data.content.user_info.uid,52598));
            //     await  fetch("https://pocketuni.net/index.php?app=api&mod=Event&act=join2",   Object.assign(requestOptions,{
            //         body:formData
            //     })).then((data)=>{
            //         return data.json();
            //     }).then(data=>{
            //         if(data.msg.includes("记得准时签到哦~")){
            //             console.log(data)
            //             console.log("已完成!");
            //         }
            //
            //     }
            // )
            // }else {
            //     const v=1698292800-time;
            //     console.log("将在"+v+"秒后开始!")
            // }


        }, 1000
    );
}
