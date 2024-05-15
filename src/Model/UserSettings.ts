import rangeOf from "Support/rangeOf";
import { KeyBindings } from "./KeyBindings";


export * as UserSettings from "./UserSettings";


export type UserSettings = {
    autoSaveByDefault: boolean,
    keyBindings: KeyBindings,
};


export type UserSettingsField = keyof UserSettings;
export const UserSettingsFields = rangeOf<UserSettingsField>()("autoSaveByDefault", "keyBindings");


export function isUserSettings (settings: any): settings is UserSettings {
    return UserSettingsFields.every(field => field in settings);
}
