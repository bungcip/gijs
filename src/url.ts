/// URL management

import {replace} from './string';

export let urlConfig = {
    baseUrl: ""
};

export function url(value: string, data?: Object): string {
    let result = urlConfig.baseUrl + value;
    return replace(result, data);
}

