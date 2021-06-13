import * as usb from './usb';
import { WebUSB } from './webusb';

export = {
    ...usb,
    webusb: new WebUSB()
};
