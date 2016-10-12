/// URL management

import {replace} from './string';

export let urlConfig = {
    baseUrl: ""
};

export function url(value: string, data?: Object): string {
    let result = urlConfig.baseUrl + value;
    if(data === null){
        return result;
    }
    let param = data as Object;
    return replace(result, param);
}

