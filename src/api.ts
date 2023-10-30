import * as QRCode from "qrcode";

export let schoolCache: any = undefined;
export let schoolListCache: any = undefined;

export const requestOptions = {
    method: 'POST',
}

export const schools = async (): Promise<any> => {
    if (schoolCache != undefined) {
        return schoolCache;
    }
    const schoolList = "https://pocketuni.net/index.php?app=api&mod=Sitelist&act=getSchools";
    return await fetch(schoolList)
        .then(response => {
            if (!response.ok) {
                throw new Error('网络请求失败');
            }
            return response.json();
        })
        .then(data => {
            schoolCache = data;

            while (true) {
                let school = data.pop();
                if (school != undefined) {
                    schoolCache[school.name] = school.email
                } else {
                    break;
                }

            }

            return schoolCache;
        })

};

export interface School {
    name: string;
    email: string;
    school: string;
    displayer_order: string
}

export const search = async (schoolName: string): Promise<{ sch: Array<School>; count: number }> => {
    let r: any = {sch: [], count: 0};
    await schools().then(async (data: Array<School>) => {
            while (true) {
                let school = data.pop();
                if (school != undefined) {
                    if (school.name.includes(schoolName)) {
                        r.sch.push(school)
                        r.count++;
                    }
                } else {
                    break;
                }

            }
        }
    )
    return r;
};


