import {MD5} from 'crypto-js';
// 20871749 4462300 1698216891 s25ycjfxcehwzs60yookgq8fx1es05af
//    uid     eventid      当前时间戳              keys(固定?)
//组合后MD5 全小写为 form表单 sign字段
const keys = "s25ycjfxcehwzs60yookgq8fx1es05af"

//签名算法
export const sign = (uid: string | number, eventId: string | number): string => {
    const time = Math.floor(Date.now() / 1000);
    const text = `${uid}${eventId}${time}${keys}`;
    const hashedData = MD5(text).toString().toLowerCase();
    return hashedData;
};
