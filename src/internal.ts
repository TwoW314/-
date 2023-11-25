import * as Log4js from "log4js";
import {Client} from "./client";
import {StrNum} from "./entity/entities";
import {sign} from "./o/sign";
import {callAPI} from "./o/api";

const logger = Log4js.getLogger("API")

const root = "https://pocketuni.net";

export const requestOptions = {
    method: 'POST',
};

function addAuthTokens(formData: FormData, client: Client) {
    formData.append('oauth_token', client.oauth_token + "");
    formData.append('oauth_token_secret', client.oauth_token_secret + "");
}

let id = 0;

export async function Login(client: Client, school: StrNum, password: StrNum, username: StrNum): Promise<any> {
    return CallAPI(client, {
        endpoint: "/index.php?app=api&mod=Sitelist&act=login",
        login: false,
        formData: (function () {
            const formData = new FormData();
            formData.append("school", school.toString());
            formData.append("password", password.toString());
            formData.append("usernum", username.toString());
            formData.append("type", "pc");
            formData.append("email", username.toString() + school.toString());
            return formData;
        })(),
        processResponse: (data) => {
            return data;
        },
    });
}

export async function CallAPI(client: Client, options: {
    endpoint: string,
    login: boolean,
    formData?: FormData,
    additionalFormData?: (formData: FormData, client: Client) => void,
    processResponse?: (data: any) => any,
}): Promise<any> {
    if (client.userinfo !== undefined || !options.login) {
        const formData = options.formData || new FormData();

        if (client.userinfo !== undefined) {
            formData.append("sid", client.userinfo.sid);
            addAuthTokens(formData, client);
        }
        if (options.additionalFormData) {
            options.additionalFormData(formData, client);
        }
        formData.append('version', "7.10.0");
        formData.append('from', "pc");
        const tid = id;
        id++;
        logger.debug(`Called API  => ${tid} ` + options.endpoint)
        try {
            const response = await fetch(root + options.endpoint, Object.assign(requestOptions, {
                body: formData
            }));
            logger.debug(`API Response  => ${tid} ` + options.endpoint)
            const data = await response.json();
            if (data.message === "认证失败" || data.message === "授权失败") {
                return Promise.reject("认证失败")
            }
            if (options.processResponse) {
                return options.processResponse(data);
            }
            return data;
        } catch (error) {
            logger.error("API请求失败:", error);
            throw error;
        }
    } else {
        logger.error("API请求失败: ");
        return Promise.reject("未登录");
    }
}

export function Qrcode(client: Client, token: string): Promise<any> {
    return CallAPI(client, {
        endpoint: "/index.php?app=api&mod=Sitelist&act=pollingLogin&0",
        login: false,
        formData: (function () {
            const formData = new FormData();
            formData.append("token", token);
            return formData;
        })(),
        processResponse: (data) => {
            return data;
        },
    });
}

export function EventDetail(client: Client, eventId: string | number): Promise<any> {
    return CallAPI(client, {
        endpoint: "/index.php?app=api&mod=Event&act=queryActivityDetailById&",
        login: true,
        formData: (function () {
            const formData = new FormData();
            formData.append("actiId", eventId.toString());
            return formData;
        })(),
        processResponse: (data) => {
            return data;
        },
    });
}

export function EventList(client: Client, page: number, keyword: string): Promise<any> {
    return CallAPI(client, {
        endpoint: "/index.php?app=api&mod=Event&act=newEventList&",
        login: true,
        formData: (function () {
            const formData = new FormData();
            formData.append("page", page.toString());
            formData.append("keyword", keyword);
            return formData;
        })(),
        processResponse: (data) => {
            return data;
        },
    });
}

export function CancelEvent(client: Client, eventId: string | number): Promise<any> {
    return CallAPI(client, {
        endpoint: "/index.php?app=api&mod=Event&act=cancelEvent",
        login: true,
        formData: (function () {
            const formData = new FormData();
            formData.append("id", eventId.toString());
            return formData;
        })(),
        processResponse: (data) => {
            return data;
        },
    });
}

export function MyEventList(client: Client): Promise<any> {
    return CallAPI(client, {
        endpoint: "/index.php?app=api&mod=UserCredit&act=getEventList&",
        login: true,
        formData: undefined,
        processResponse: (data) => {
            return data;
        },
    });
}

export function JoinEvent(client: Client, eventId: string | number): Promise<any> {
    return CallAPI(client, {
        endpoint: "/index.php?app=api&mod=Event&act=join2&",
        login: true,
        formData: (function () {
            const formData = new FormData();
            const time = Math.floor(Date.now() / 1000);
            formData.append('id', eventId + "");
            formData.append('time', time + "");
            formData.append('sign', sign(`${client.userinfo?.uid}`, eventId));
            return formData;
        })(),
        processResponse: (data) => {
            return data;
        },
    });
}

export function MUserInfo(client: Client): Promise<any> {
    return CallAPI(client, {
        endpoint: "/index.php?app=api&mod=Pc&act=pcUser",
        login: true,
        processResponse: (data) => {
            return data;
        },
    });
}

export function MSchoolInfo(client: Client): Promise<any> {
    return CallAPI(client, {
        endpoint: "/index.php?app=api&mod=Pc&act=pcHead&sid=" + client.userinfo?.sid,
        login: true,
        processResponse: (data) => {
            return data;
        },
    });
}

//https://pocketuni.net/index.php?act=myEventCollect&mod=Collect&app=api
export function MyEventCollect(client: Client): Promise<any> {
    return CallAPI(client, {
        endpoint: "/index.php?act=myEventCollect&mod=Collect&app=api",
        login: true,
        processResponse: (data) => {
            return data;
        },
    });
}