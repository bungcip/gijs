'use strict';

export {replace} from './string';
export {url} from './url';
export {modal} from './modal';
export * from './ajax';

import {urlConfig} from './url';


export function setup(data: {baseUrl: string}){
    urlConfig.baseUrl = data.baseUrl;
}