export interface School {
    name: string;
    email: string;
    school: string;
    displayer_order: string
}

export type loginType = "qrcode" | "password" | "token" | "save";

export interface UserData {
    oauth_token: string;
    oauth_token_secret: string;
    low_password: number;
    jump_to: string;
    user_info: {
        uid: string | number;
        sid: string;
        sid1: string;
        is_init: string;
        realname: string;
        is_open_idcard: number;
        jump_to_old: number;
        is_youke: number;
        can_add_event: number;
    };

}

export interface SchoolEvent {
    id: string;
    title: string;
    hit: string;
    typeId: string;
    typeId2: string;
    is_school_event: string;
    credit: string;
    credit_old: string;
    coverId: string;
    sTime: string;
    eTime: string;
    joinCount: number;
    limitCount: number;
    note: string;
    is_prov_event: string;
    address: string;
    description: string;
    //活动可报名时间
    startline: string;
    deadline: string;
    //0 已结束 1 未开始
    status: number;
    school_audit: string;
    is_need_sign_out: string;
    allow: string;
    score: string;
    is_outside: string;
    free_attend: string;
    pu_amount: string;
    school_venue: string;
    eventStatus: number;
    cover: string;
    friendCount: number;
    isTop: string;
    cName: string;
    isCredit: string;
    credit_num: number | string; // This field can be a number or a string
    credit_name: string;
    tags: Tag[];
    area: number;
    isAllowEvent: number;
    category: string;
}

export interface Tag {
    id: number;
    name: string;
    color: string;
}