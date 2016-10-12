import * as ko from "knockout";

/**
 * String Replacer
 * Helper function to create simple template string
 * Example:
 * 
 * gi.replace("hello {name}", {
 *   name: 'jane'
 * })
 * 
 */
export function replace(str: string, dict: Object): string {
    for (var key in dict) {
        str = str.replace("{" + key + "}", ko.unwrap(dict[key]));
    }

    return str;
}
