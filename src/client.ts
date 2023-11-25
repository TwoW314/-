import {ClientOption, Filter, StrNum, UserInfo} from "./entity/entities";
import {EventInfo, SchoolEvent} from "./entity/event";
import {
    CancelEvent,
    EventDetail,
    EventList,
    JoinEvent,
    Login,
    MSchoolInfo,
    MUserInfo,
    MyEventCollect,
    Qrcode
} from "./internal";
import {getMTime} from "./utils";
import {MD5} from 'crypto-js';
import {getLogger} from "log4js";
import {SchoolInfo, StudentInfo} from "./entity/user";
import * as Fs from "fs";

const logger = getLogger("CLIENT");
let baseDir = process.cwd() + "/pu-client";
export declare class Client {
    processing: boolean;
    userinfo: StudentInfo | undefined;
    joinDelay: number;
    school: SchoolInfo | undefined;
    qrcodeToken: string | undefined;
    oauth_token: string | undefined;
    oauth_token_secret: string | undefined;
    options: ClientOption;
    originLoginData: any;
    userdataPath: string | undefined;
    //登录
    login(qrcodeToken: string): Promise<this>;
    //登录
    login(username?: StrNum, password?: StrNum, school?: string): Promise<this>;

    //获取活动列表
    eventList(keyword: string, page: number): Promise<DataResult<Array<SchoolEvent>>>;
    //获取活动列表
    eventList(keyword: string, page: number, filter: Filter): Promise<DataResult<Array<SchoolEvent>>>;

    //加入活动
    joinEvent(eventId: StrNum): Promise<DataResult<string>>;

    //获取活动详情
    eventInfo(eventId: StrNum): Promise<DataResult<EventInfo>>;

    //测试当前用户token是否有效
    test(): Promise<void>;

    //取消活动
    cancelEvent(eventId: StrNum): Promise<DataResult<string>>;

    updateInfo(): Promise<void>;

    // myEventList(eventId:StrNum):Promise<string>;
    myCollectEventList(): Promise<Array<SchoolEvent>>;

}

export class ClientBase implements Client {
    joinDelay: number = -1;
    originLoginData: any;
    processing: boolean = false;
    userinfo: StudentInfo | undefined;
    qrcodeToken: string | undefined;
    oauth_token: string | undefined;
    oauth_token_secret: string | undefined;
    school: SchoolInfo | undefined;
    options: ClientOption = {
        cacheTime: 1000 * 60 * 4,
        usecache: true
    };
    userdataPath: string | undefined;
    async login(username?: StrNum, password?: StrNum, school?: string, qrcodeToken?: string): Promise<this> {
        if (this.processing) {
            return Promise.reject("正在登录中");
        }
        let rspData;
        this.processing = true
        if (password && username && school) {
            rspData = await Login(this, school, password, username).then((v) => {
                return v
            })
        } else {
            this.qrcodeToken = (username as string);
            try {
                rspData = await this.poll().then((v) => {
                    return v
                })
            } catch (e) {
                return Promise.reject(e)
            }
        }
        if (rspData.message === "success") {
            this.userinfo = rspData.content.user_info;
            this.oauth_token = rspData.content.oauth_token;
            this.oauth_token_secret = rspData.content.oauth_token_secret;
        } else {
            return Promise.reject(rspData.message)
        }
        this.processing = false
        await this.updateInfo();
        return this;
    }

    private count: number = 30;
    private async poll() {
        while (true) {
            this.count--;
            if (this.count < 0) {
                return Promise.reject("二维码超时")
            }
            const data = await Qrcode(this, this.qrcodeToken + "").then((data) => {

                return data;
            })
            if (data.message === "success") {
                return data;
            }
            await new Promise(r => setTimeout(r, 1000))
        }
    }

    async joinEvent(eventId: StrNum): Promise<DataResult<string>> {
        if (Date.now() < this.joinDelay) {
            return {status: false, data: "操作过于频繁，请稍候再试"};
        }
        this.joinDelay = Date.now() + 1000 * 2.4;
        return await JoinEvent(this, eventId).then((data) => {

            if (data.msg.includes("记得准时签到哦~")) {
                return {status: true, data: data.msg};
            }
            // if(data.msg.includes("操作过于频繁，请稍候再试")){
            //     return "ok";
            // }
            return {status: false, data: data.msg};
        })
    }

    async eventList(keyword: string, page: number, filter: Filter = {}): Promise<DataResult<Array<SchoolEvent>>> {
        let rtv:SchoolEvent[]=[];
        let flag=true;
        const time=getMTime()
        const cyc=page==-1;
        const max = page;
        while (flag){
            if(cyc){
                page++;
            } else {
                page++;
                if (page > max) {
                    break;
                }
            }
            rtv = rtv.concat(await EventList(this, page, keyword).then((data) => {
                if(filter){
                    return data.content.filter((v:SchoolEvent)=>{
                        v.client = this;
                        let flag1=true;
                        if(time>=v.eTime){
                            flag=false;
                        }
                        if(filter.allow){
                            flag1 = flag1 && v.allow === '0';
                        }
                        if(filter.name){
                            if(!v.title.includes(filter.name)){
                                flag1=flag1&&false;
                            }
                        }
                        if(filter.credit){
                            if(v.credit<filter.credit){
                                flag1=flag1&&false;
                            }
                        }
                        return flag1;
                    })
                }
                return data;
            }))
        }
        return {status: true, data: rtv};
    }

    async cancelEvent(eventId: StrNum): Promise<DataResult<string>> {
        return await CancelEvent(this, eventId).then((data) => {

            if (data.msg.includes("用户不存在")) {
                return {status: true, data: '未加入该活动'};
            }
            return {status: true, data: data.msg};

        })
    }

    async eventInfo(eventId: StrNum): Promise<DataResult<EventInfo>> {

        return await EventDetail(this, eventId).then((data: any) => {
            return {status: true, data: data.content};
        })

    }

    async test(): Promise<void> {
        return await MUserInfo(this).catch((e) => {
            return Promise.reject(e);
        })
    }

    async updateInfo(): Promise<void> {
        await MUserInfo(this).then((data: any) => {
            this.userinfo = Object.assign(data.content, this.userinfo)
        })
        await MSchoolInfo(this).then((data: any) => {
            this.school = data.content.school
        })
        this.userdataPath = baseDir + "/userdata/" + `${this.userinfo?.sno}_${this.userinfo?.sid}`;
        Fs.mkdirSync(this.userdataPath, {recursive: true})
        Fs.writeFileSync(this.userdataPath + "/userinfo.json", JSON.stringify(this))
    }

    async myCollectEventList(): Promise<Array<SchoolEvent>> {
        return await MyEventCollect(this).then((data) => {
            return data;
        })
    }
}

export class ClientImp extends ClientBase {
    readonly cacheHandler = {
        cache: new Map<string, CacheData>(),
        apply: async function (target: any, thisArg: ClientImp, args: Array<any>) {
            const hash = MD5(target.name + JSON.stringify(args)).toString().toLowerCase();
            const data = this.cache.get(hash);
            if (data !== undefined && getMTime() - data.time < thisArg.options.cacheTime) {
                return data.data;
            } else {
                logger.debug("cache missing " + target.name)
                const rv = target.bind(thisArg)(args[0], args[1], args[2], args[3], args[4], args[5])
                this.cache.set(hash, {time: getMTime() + thisArg.options.cacheTime, data: rv})
                return rv;
            }

        },
        withCache: (any: any) => {
            return new Proxy(any, this.cacheHandler);
        }
    };
    readonly eventList = this.cacheHandler.withCache(super.eventList);
    readonly eventInfo = this.cacheHandler.withCache(super.eventInfo);
    readonly myCollectEventList = this.cacheHandler.withCache(super.myCollectEventList);


}

export function createClient(qrcodeToken: string): Promise<Client>;
export function createClient(username: StrNum, password: StrNum, school: string): Promise<Client>;

export async function createClient(username?: StrNum, password?: StrNum, school?: string, qrcodeToken?: string): Promise<Client> {
    const client: Client = new ClientImp();
    if (qrcodeToken) {
        const client_1 = await client.login(qrcodeToken);
        return client_1;
    } else {
        const client_2 = await client.login(username, password, school);
        return client_2;
    }
}

/**
 * 从缓存中创建client
 * @param sno 学号
 * @param school 学校id
 * return client
 * return Promise.reject("不存在"||"认证失败")
 */
export async function createClientByCache(sno: StrNum, school: StrNum) {
    if (!Fs.existsSync(baseDir + "/userdata/" + `${sno}_${school}` + "/userinfo.json")) {
        return Promise.reject("不存在")
    }
    const client: Client = new ClientImp();
    const cac = JSON.parse(Fs.readFileSync(baseDir + "/userdata/" + `${sno}_${school}` + "/userinfo.json").toString());
    client.userinfo = cac.userinfo;
    client.oauth_token = cac.oauth_token;
    client.oauth_token_secret = cac.oauth_token_secret;
    client.school = cac.school;
    client.userdataPath = baseDir + "/userdata/" + `${sno}_${school}`;
    await client.test().catch((e) => {
        return Promise.reject(e);
    })
    return client;
}


interface CacheData {
    time: number;
    data: any;
}

export interface DataResult<T> {
    status: boolean;
    data: T;
}

export function setBaseDir(path: string) {
    baseDir = process.cwd() + "/" + path;
}

export function getBaseDir() {
    return baseDir;
}