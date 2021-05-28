import * as usb from './usb';
import { WebUSB } from './webusb';

const toExport = usb;
toExport.webusb = new WebUSB();
export = usb;
