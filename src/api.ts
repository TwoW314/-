import {Client} from "./client";
import {sign} from "./sign";
import * as Log4js from "log4js"

export let schoolCache: any | undefined;

export const requestOptions = {
    method: 'POST',
};

const schoolList = "https://pocketuni.net/index.php?app=api&mod=Sitelist&act=getSchools";
const logger = Log4js.getLogger("API")


export const callSchoolList = async (): Promise<any> => {
    if (schoolCache !== undefined) {
        return schoolCache;
    }

    try {
        const response = await fetch(schoolList);
        if (!response.ok) {
            new Error('网络请求失败');
        }
        const data = await response.json();
        schoolCache = data.reduce((cache: any, school: any) => {
            if (school) {
                cache[school.name] = school.email;
            }
            return cache;
        }, {});

        return schoolCache;
    } catch (error) {
        console.error('获取学校列表失败:', error);
        throw error;
    }
};

export const callAPI = async (client: Client, options: {
    endpoint: string,
    login: boolean,
    formData?: FormData,
    additionalFormData?: (formData: FormData, client: Client) => void,
    processResponse?: (data: any) => any,
}): Promise<any> => {
    if (client.userdata !== undefined || !options.login) {
        const formData = options.formData || new FormData();
        formData.append("from", "pc");
        if (client.userdata !== undefined) {
            formData.append("sid", client.userdata.user_info.sid);
            addAuthTokens(formData, client.userdata);
        }
        if (options.additionalFormData) {
            options.additionalFormData(formData, client);
        }
        formData.append('version', "7.10.0");
        formData.append('from', "pc");
        logger.debug("called api => " + options.endpoint + "  data: " + options.formData)
        try {
            const response = await fetch(options.endpoint, Object.assign(requestOptions, {
                body: formData
            }));
            const data = await response.json();

            if (options.processResponse) {
                return options.processResponse(data);
            }
            return data;
        } catch (error) {
            console.log("API请求失败:", error);
            throw error;
        }
    } else {
        console.log("未登录");
        return Promise.reject("未登录");
    }
};

export const callPassword = async (client: Client, data: any): Promise<any> => {
    return callAPI(client, {
        endpoint: "https://pocketuni.net/index.php?app=api&mod=Sitelist&act=login",
        login: false,
        formData: (function () {
            const formData = new FormData();
            formData.append('email', `${data.username}${data.sch}`);
            formData.append('type', "pc");
            formData.append('password', data.password);
            formData.append('usernum', data.username);
            formData.append('sid', "");
            formData.append('school', data.sch);
            return formData;
        })(),
        processResponse: (rv) => {
            if (rv.message === "success") {
                return rv.content;
            }
            return Promise.reject(rv);
        },
    });
};

export const callJoinEvent = async (client: Client, eventId: string | number): Promise<any> => {
    return callAPI(client, {
        endpoint: "https://pocketuni.net/index.php?app=api&mod=Event&act=join2&",
        login: true,
        formData: (function () {
            const formData = new FormData();
            const time = Math.floor(Date.now() / 1000);
            formData.append('id', eventId + "");
            formData.append('time', time + "");
            formData.append('sign', sign(`${client.userdata?.user_info.uid}`, eventId));
            return formData;
        })(),
        processResponse: (data) => {
            return data;
        },
    });
};

export const callEventList = async (client: Client, page: number, keyword: string): Promise<any> => {
    return callAPI(client, {
        endpoint: "https://pocketuni.net/index.php?app=api&mod=Event&act=newEventList&",
        login: true,
        formData: (function () {
            const formData = new FormData();
            formData.append("keyword", keyword);
            formData.append("url", "");
            formData.append("page", `${page}`);
            return formData;
        })(),
        processResponse: (data) => {
            return data;
        },
    });
};

export const callQrcode = async (client: Client): Promise<any> => {
    return callAPI(client, {
        endpoint: "https://pocketuni.net/index.php?app=api&mod=Event&act=newEventList&",
        login: true,
        formData: (function () {
            return new FormData();
        })(),
        processResponse: (data) => {
            return data;
        },
    });
};
export const callQrcode1 = async (client: Client, token: string): Promise<any> => {
    return callAPI(client, {
        endpoint: "https://pocketuni.net/index.php?app=api&mod=Sitelist&act=pollingLogin&0",
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
};

export const callEventInfo = async (client: Client, eventId: string|number): Promise<any> => {
    return callAPI(client, {
        endpoint: `https://pocketuni.net/index.php?app=api&mod=Event&act=queryActivityDetailById&from=pc&actiId=${eventId}`,
        login: false,
        formData: (function () {
            return new FormData();
        })(),
        processResponse: (data) => {
            return data;
        },
    });
};

function addAuthTokens(formData: FormData, userdata: any) {
    formData.append('oauth_token', userdata.oauth_token);
    formData.append('oauth_token_secret', userdata.oauth_token_secret);
}