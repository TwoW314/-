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
    credit: number;
    credit_old: number;
    coverId: string;
    sTime: string;
    eTime: number;
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
    credit_num: number | string;
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


// 对应 api
// https://pocketuni.net/index.php?app=api&mod=Event&act=queryActivityDetailById&from=pc&actiId={}
export interface EventInfo{
    createrId: string;
    actiId: string;
    name: string;
    actiIcon: string;
    sid: string;
    actiPoster: string;
    startTime: number;
    endTime: number;
    is_need_sign_out: string;
    is_school_event: string;
    credit: string;
    score: string;
    cost: string;
    location: string;
    joinNum: number;
    leftNum: number;
    descs: string;
    uid: string;
    needTel: string;
    status: number;
    gid: string;

    free_attend: string;
    regStartTimeStr: number;
    //报名结束时间
    regEndTimeStr: number;
    // 1 报名需要审核  2 不需要审核  审核为自动判断
    allow: number;
    allow_school: string[];
    allow_year: string[];
    allow_user_type: string;
    allow_group: string[];
    allow_area: string[];

    isTicket: string;
    cTime: string;
    is_gps_sign: string;
    levelId: string;
    audit_uid: string;
    is_outside: string;
    typeId2: string;
    hours: string;
    pu_amount: string;
    player_upload: string;
    work_upload: string;
    school_venue: string;
    show_hours: string;
    approval: string;
    notRegSignIn: string;
    createrName: string;
    category_title: string;
    category: {
        categoryId: string;
        name: string;
    };
    type2_name: string;
    xm_id: string;
    xm_name: string;
    descsUrl: string;
    type: number;
    thinAssn: any;
    isExpire: number;
    collectFlag: number;
    permission: number;
    isJoin: number;
    actiNotice: any;
    isVote: string;
    checkoutFlag: number;
    signTips: string;
    regStatus: number;
    creditName: string;
    tags: string[];
    eventStatus: {
        title: string;
        status: number;
        desc: string;
    }[];
    contact_user: string;
    contact_user_phone: string;
    level_name: string;
    seriesName: string;
    event_user_status: {
        title: string;
        status: number;
        desc: string;
    }[];
    isAllow: number;
    allow_school_objs: {
        id: string;
        pid: string;
        display_order: string;
        title: string;
        cityId: string;
        domain: string;
        tj_year: string;
        sort: string;
        level: string;
    }[];
    allow_group_obj: any[];
    allow_area_obj: any[];
    limitNum: number;
    audit_user: string;
    orga_name: string;
    sign_in_start_time: string;
    sign_out_start_time: string;
    sign_out_status: any;
    sign_in_status: any;
    sign_in_num: string;
    sign_out_num: number;
    schoolArea: string[];
    is_evaluate: number;
    //没用的东西
    button_status: {
        join_button: string;
        join_status: string;
        player_button: string;
    };
    current_time: number;
    input_list: any[];
    show_event_photo_button: string;

}
