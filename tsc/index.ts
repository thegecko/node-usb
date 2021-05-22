import { promisify } from 'util';

import * as usb from './usb';
import { WebUSB } from './webusb';

const findByIds = (vid: number, pid: number): usb.Device | undefined => {
	const devices = usb.getDeviceList();
	return devices.find(item => item.deviceDescriptor.idVendor === vid && item.deviceDescriptor.idProduct === pid);
};

const findBySerialNumber = async (serialNumber: string): Promise<usb.Device | undefined> => {
	const devices = usb.getDeviceList();

	for (const device of devices) {
		try {
			device.open();

			const getStringDescriptor = promisify(device.getStringDescriptor).bind(device);
			const buffer = await getStringDescriptor(device.deviceDescriptor.iSerialNumber);

			if (buffer && buffer.toString() === serialNumber) {
				return device;
			}
		} catch {
			// Ignore any errors, device may be a system device or inaccessible
		} finally {
			try {
				device.close();
			} catch {
				// Ignore any errors, device may be a system device or inaccessible
			}
		}
	}

	return undefined;
};

const toExport = usb;

toExport.findByIds = findByIds;
toExport.findBySerialNumber = findBySerialNumber;
toExport.webusb = new WebUSB();

export = usb;
