import {requestOptions} from "./o/api";
import * as QRCode from "qrcode";
import {baseDir} from "./client";

export const getMTime = () => {

    return Math.floor(Date.now() / 1000)
}


export const Qrcode = async (): Promise<{
    token: string;
    qrcode: string;
    terminal: string;
    filePath: string;
    base64: string;

}> => {
    const url = 'https://pocketuni.net/index.php?app=api&mod=Sitelist&act=loginQrcode';
    return await fetch(url, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('网络请求失败');
            }
            return response.json();
        })
        .then(async (data): Promise<{ token: string, qrcode: string, terminal: string, filePath: string, base64: string; }> => {
            const qrcodeUrl = `https://h5.pocketuni.net/QR_login/index.html?token=${data.content.token}`;
            await QRCode.toFile(baseDir + "/qrcode.png", qrcodeUrl)
            let terminalText: string = ""
            QRCode.toString(qrcodeUrl, {type: 'terminal', scale: 20}, (err: any, url: string) => {
                terminalText = url;
            })

            return {
                filePath: baseDir + "/qrcode.png",
                qrcode: `${qrcodeUrl}`,
                terminal: `${terminalText}`,
                token: `${data.content.token}`,
                base64: data.content.dataUrl
            }
        })
}
