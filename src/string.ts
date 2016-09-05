import * as ko from "knockout";

// string replacer
export function replace(str: string, dict: Object): string {
    for (var key in dict) {
        str = str.replace("{" + key + "}", ko.unwrap(dict[key]));
    }

    return str;
}
