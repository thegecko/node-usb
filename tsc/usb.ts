import { EventEmitter } from 'events';
import { Interface } from './interface';
import { Capability } from './capability';
import { isBuffer } from './util';

import * as usb from '../build/Release/usb_bindings';

if (usb.INIT_ERROR) {
	console.warn('Failed to initialize libusb.');
}

usb.Device.prototype.timeout = 1000;

Object.defineProperty(usb.Device.prototype, 'configDescriptor', {
	get: function (): ConfigDescriptor | undefined {
		try {
			return this._configDescriptor || (this._configDescriptor = this.__getConfigDescriptor())
		} catch (e) {
			// Check descriptor exists
			if (e.errno == usb.LIBUSB_ERROR_NOT_FOUND) {
				return undefined;
			}
			throw e;
		}
	}
});

Object.defineProperty(usb.Device.prototype, "allConfigDescriptors", {
	get: function (): ConfigDescriptor[] {
		try {
			return this._allConfigDescriptors || (this._allConfigDescriptors = this.__getAllConfigDescriptors())
		} catch (e) {
			// Check descriptors exist
			if (e.errno == usb.LIBUSB_ERROR_NOT_FOUND) {
				return [];
			}
			throw e;
		}
	}
});

Object.defineProperty(usb.Device.prototype, "parent", {
	get: function (): usb.Device {
		return this._parent || (this._parent = this.__getParent())
	}
});

Object.defineProperty(usb.Device.prototype, "interfaces", {
	get: function (): Interface[] {
		if (!this._interfaces) {
			throw new Error("Device must be open before listing interfaces");
		}

		return this._interfaces;
	}
});

usb.Device.prototype.open = function (defaultConfig: boolean = true): void {
	this.__open();
	if (defaultConfig === false) {
		return;
	}
	this._interfaces = []
	const len = this.configDescriptor ? this.configDescriptor.interfaces.length : 0;
	for (let i = 0; i < len; i++) {
		this._interfaces[i] = new Interface(this, i)
	}
};

usb.Device.prototype.close = function (): void {
	this.__close();
	this._interfaces = undefined;
}

usb.Device.prototype.setConfiguration = function (desired: number, callback?: (error: undefined | usb.LibUSBException) => void): void {
	const self = this;
	this.__setConfiguration(desired, function (err) {
		if (!err) {
			self.interfaces = []
			const len = self.configDescriptor ? self.configDescriptor.interfaces.length : 0
			for (let i = 0; i < len; i++) {
				self.interfaces[i] = new Interface(self, i);
			}
		}
		if (callback) {
			callback.call(self, err);
		}
	});
}

usb.Device.prototype.controlTransfer = function (bmRequestType: number, bRequest: number, wValue: number, wIndex: number, data_or_length: number | Buffer,
	callback?: (error: undefined | usb.LibUSBException, buffer?: Buffer) => void): usb.Device {
	const self = this
	const isIn = !!(bmRequestType & usb.LIBUSB_ENDPOINT_IN)
	const wLength = isIn ? data_or_length as number : (data_or_length as Buffer).length;

	if (isIn) {
		if (!(data_or_length >= 0)) {
			throw new TypeError("Expected size number for IN transfer (based on bmRequestType)")
		}
	} else {
		if (!isBuffer(data_or_length)) {
			throw new TypeError("Expected buffer for OUT transfer (based on bmRequestType)")
		}
	}

	// Buffer for the setup packet
	// http://libusbx.sourceforge.net/api-1.0/structlibusb__control__setup.html
	const buf = Buffer.alloc(wLength + usb.LIBUSB_CONTROL_SETUP_SIZE)
	buf.writeUInt8(bmRequestType, 0)
	buf.writeUInt8(bRequest, 1)
	buf.writeUInt16LE(wValue, 2)
	buf.writeUInt16LE(wIndex, 4)
	buf.writeUInt16LE(wLength, 6)

	if (!isIn) {
		buf.set(data_or_length as Buffer, usb.LIBUSB_CONTROL_SETUP_SIZE)
	}

	const transfer = new usb.Transfer(this, 0, usb.LIBUSB_TRANSFER_TYPE_CONTROL, this.timeout,
		function (error, buf, actual) {
			if (callback) {
				if (isIn) {
					callback.call(self, error, buf.slice(usb.LIBUSB_CONTROL_SETUP_SIZE, usb.LIBUSB_CONTROL_SETUP_SIZE + actual))
				} else {
					callback.call(self, error)
				}
			}
		}
	)

	try {
		transfer.submit(buf)
	} catch (e) {
		if (callback) {
			process.nextTick(function () { callback.call(self, e); });
		}
	}
	return this;
}

usb.Device.prototype.interface = function (addr: number): Interface {
	if (!this._interfaces) {
		throw new Error("Device must be open before searching for interfaces");
	}

	addr = addr || 0
	for (let i = 0; i < this._interfaces.length; i++) {
		if (this._interfaces[i].interfaceNumber == addr) {
			return this._interfaces[i]
		}
	}

	throw new Error(`Interface not found for address: ${addr}`);
}

usb.Device.prototype.getStringDescriptor = function (desc_index: number, callback: (error?: usb.LibUSBException, value?: string) => void): void {
	const langid = 0x0409;
	const length = 255;
	this.controlTransfer(
		usb.LIBUSB_ENDPOINT_IN,
		usb.LIBUSB_REQUEST_GET_DESCRIPTOR,
		((usb.LIBUSB_DT_STRING << 8) | desc_index),
		langid,
		length,
		(error?: usb.LibUSBException, buffer?: Buffer) => {
			if (error) {
				return callback(error);
			}
			callback(undefined, buffer ? buffer.toString('utf16le', 2) : undefined);
		}
	);
}

usb.Device.prototype.getBosDescriptor = function (callback: (error?: usb.LibUSBException, descriptor?: BosDescriptor) => void): void {
	const self = this;

	if (this._bosDescriptor) {
		// Cached descriptor
		return callback(undefined, this._bosDescriptor);
	}

	if (this.deviceDescriptor.bcdUSB < 0x201) {
		// BOS is only supported from USB 2.0.1
		return callback(undefined, undefined);
	}

	this.controlTransfer(
		usb.LIBUSB_ENDPOINT_IN,
		usb.LIBUSB_REQUEST_GET_DESCRIPTOR,
		(usb.LIBUSB_DT_BOS << 8),
		0,
		usb.LIBUSB_DT_BOS_SIZE,
		function (error, buffer) {
			if (error) {
				// Check BOS descriptor exists
				if (error.errno == usb.LIBUSB_TRANSFER_STALL) return callback(undefined, undefined);
				return callback(error, undefined);
			}

			if (!buffer) {
				return callback(undefined, undefined);
			}

			const totalLength = buffer.readUInt16LE(2);
			self.controlTransfer(
				usb.LIBUSB_ENDPOINT_IN,
				usb.LIBUSB_REQUEST_GET_DESCRIPTOR,
				(usb.LIBUSB_DT_BOS << 8),
				0,
				totalLength,
				function (error, buffer) {
					if (error) {
						// Check BOS descriptor exists
						if (error.errno == usb.LIBUSB_TRANSFER_STALL) return callback(undefined, undefined);
						return callback(error, undefined);
					}

					if (!buffer) {
						return callback(undefined, undefined);
					}

					const descriptor: BosDescriptor = {
						bLength: buffer.readUInt8(0),
						bDescriptorType: buffer.readUInt8(1),
						wTotalLength: buffer.readUInt16LE(2),
						bNumDeviceCaps: buffer.readUInt8(4),
						capabilities: []
					};

					let i = usb.LIBUSB_DT_BOS_SIZE;
					while (i < descriptor.wTotalLength) {
						const capability = {
							bLength: buffer.readUInt8(i + 0),
							bDescriptorType: buffer.readUInt8(i + 1),
							bDevCapabilityType: buffer.readUInt8(i + 2),
							dev_capability_data: buffer.slice(i + 3, i + buffer.readUInt8(i + 0))
						};

						descriptor.capabilities.push(capability);
						i += capability.bLength;
					}

					// Cache descriptor
					self._bosDescriptor = descriptor;
					callback(undefined, self._bosDescriptor);
				}
			);
		}
	);
}

usb.Device.prototype.getCapabilities = function (callback: (error: undefined | usb.LibUSBException, capabilities?: Capability[]) => void): void {
	const capabilities: Capability[] = [];
	const self = this;

	this.getBosDescriptor(function (error, descriptor) {
		if (error) return callback(error, undefined);

		const len = descriptor ? descriptor.capabilities.length : 0
		for (let i = 0; i < len; i++) {
			capabilities.push(new Capability(self, i))
		}

		callback(undefined, capabilities);
	});
}

Object.setPrototypeOf(usb, EventEmitter.prototype);

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

export = usb;
