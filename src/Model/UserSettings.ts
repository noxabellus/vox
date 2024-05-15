import RangeOf from "Support/RangeOf";
import { KeyBindings } from "./KeyBindings";


export * as UserSettings from "./UserSettings";


export type UserSettings = {
    autoSaveByDefault: boolean,
    keyBindings: KeyBindings,
};


export type UserSettingsField = keyof UserSettings;
export const UserSettingsFields = RangeOf<UserSettingsField>()("autoSaveByDefault", "keyBindings");


export function isUserSettings (settings: any): settings is UserSettings {
    return UserSettingsFields.every(field => field in settings);
}
