import {UserInfo} from "./entities";

export interface StudentInfo extends UserInfo {
    // 头像链接
    face: string;
    // 真实姓名
    realname: string;
    // 学号
    sno: string;
    // 学院
    yx: string;
    // 专业
    major: string;
    // 年级
    year: string;
    // 班级
    class: string;
    // 学分
    credit: number;
    // 诚信度百分比 xxx%
    cx: string;
    // 未知
    amount2: string;
    // 参与活动次数
    event_count: string;
    // 部落数量
    group_count: string;
}

export interface SchoolInfo {
    // 学校名称
    school_name: string;
    // 学校标志
    school_logo: string;
    // 学分名称
    credit_name: string;
}