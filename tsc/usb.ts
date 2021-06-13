import { promisify } from 'util';
import { EventEmitter } from 'events';
import { Device } from './device';
import * as usb from '../build/Release/usb_bindings';

if (usb.INIT_ERROR) {
	console.warn('Failed to initialize libusb.');
}

Object.setPrototypeOf(usb, EventEmitter.prototype);

Object.getOwnPropertyNames(Device.prototype).forEach(name => {
	Object.defineProperty(usb.Device.prototype, name, Object.getOwnPropertyDescriptor(Device.prototype, name) || Object.create(null));
});

usb.on('newListener', event => {
	if (event !== 'attach' && event !== 'detach') {
		return;
	}
	const listenerCount = usb.listenerCount('attach') + usb.listenerCount('detach');
	if (listenerCount === 0) {
		usb._enableHotplugEvents();
	}
});

usb.on('removeListener', event => {
	if (event !== 'attach' && event !== 'detach') {
		return;
	}
	const listenerCount = usb.listenerCount('attach') + usb.listenerCount('detach');
	if (listenerCount === 0) {
		usb._disableHotplugEvents();
	}
});

/**
 * Convenience method to get the first device with the specified VID and PID, or `undefined` if no such device is present.
 * @param vid
 * @param pid
 */
const findByIds = (vid: number, pid: number): Device | undefined => {
	const devices = usb.getDeviceList();
	return devices.find(item => item.deviceDescriptor.idVendor === vid && item.deviceDescriptor.idProduct === pid);
};

/**
 * Convenience method to get the device with the specified serial number, or `undefined` if no such device is present.
 * @param serialNumber
 */
const findBySerialNumber = async (serialNumber: string): Promise<Device | undefined> => {
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

const toExport = {
	...usb,
	findByIds,
	findBySerialNumber
};

export = toExport;
