import { promisify } from 'util';
import { Interface } from './interface';
import {
    Device,
    getDeviceList,
    LibUSBException,
    LIBUSB_CONTROL_SETUP_SIZE,
    LIBUSB_DT_STRING,
    LIBUSB_ENDPOINT_IN,
    LIBUSB_ERROR_NOT_FOUND,
    LIBUSB_REQUEST_GET_DESCRIPTOR,
    LIBUSB_TRANSFER_TYPE_CONTROL,
    Transfer
} from '../build/Release/usb_bindings';

const isBuffer = (obj: any): obj is Uint8Array => obj && obj instanceof Uint8Array;

export const findByIds = (vid: number, pid: number): Device | undefined => {
	const devices = getDeviceList();
    return devices.find(item => item.deviceDescriptor.idVendor === vid && item.deviceDescriptor.idProduct === pid);
}

export const findBySerialNumber = async (serialNumber: string): Promise<Device | undefined> => {
    const devices = getDeviceList();

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

Device.prototype.timeout = 1000;

Object.defineProperty(Device.prototype, 'configDescriptor', {
	get: function() {
		try {
			return this._configDescriptor || (this._configDescriptor = this.__getConfigDescriptor())
		} catch(e) {
			// Check descriptor exists
			if (e.errno == LIBUSB_ERROR_NOT_FOUND) return null;
			throw e;
		}
	}
});

Device.prototype.open = function(defaultConfig: boolean): void {
	this.__open();
	if (defaultConfig === false) {
        return;
    }
	this.interfaces = []
    const len = this.configDescriptor ? this.configDescriptor.interfaces.length : 0;
	for (let i = 0; i < len; i++){
		this.interfaces[i] = new Interface(this, i)
    }
};

Device.prototype.close = function(): void {
	this.__close();
	this.interfaces = undefined;
}

Device.prototype.controlTransfer = function(bmRequestType: number, bRequest: number, wValue: number, wIndex: number, data_or_length: number | Buffer,
    callback: (error: undefined | LibUSBException, buffer?: Buffer) => void): Device {
	const self = this
	const isIn = !!(bmRequestType & LIBUSB_ENDPOINT_IN)
	const wLength = isIn ? data_or_length as number : (data_or_length as Buffer).length;

	if (isIn){
		if (!(data_or_length >= 0)){
			throw new TypeError("Expected size number for IN transfer (based on bmRequestType)")
		}
	} else {
		if (!isBuffer(data_or_length)){
			throw new TypeError("Expected buffer for OUT transfer (based on bmRequestType)")
		}
	}

	// Buffer for the setup packet
	// http://libusbx.sourceforge.net/api-1.0/structlibusb__control__setup.html
	var buf = Buffer.alloc(wLength + LIBUSB_CONTROL_SETUP_SIZE)
	buf.writeUInt8(   bmRequestType, 0)
	buf.writeUInt8(   bRequest,      1)
	buf.writeUInt16LE(wValue,        2)
	buf.writeUInt16LE(wIndex,        4)
	buf.writeUInt16LE(wLength,       6)

	if (!isIn){
		buf.set(data_or_length as Buffer, LIBUSB_CONTROL_SETUP_SIZE)
	}

	var transfer = new Transfer(this, 0, LIBUSB_TRANSFER_TYPE_CONTROL, this.timeout,
		function(error, buf, actual){
			if (callback){
				if (isIn){
					callback.call(self, error, buf.slice(LIBUSB_CONTROL_SETUP_SIZE, LIBUSB_CONTROL_SETUP_SIZE + actual))
				}else{
					callback.call(self, error)
				}
			}
		}
	)

	try {
		transfer.submit(buf)
	} catch (e) {
		if (callback){
			process.nextTick(function() { callback.call(self, e); });
		}
	}
	return this;
}

Device.prototype.getStringDescriptor = function(desc_index: number, callback: (error?: LibUSBException, value?: string) => void): void {
	var langid = 0x0409;
	var length = 255;
	this.controlTransfer(
		LIBUSB_ENDPOINT_IN,
		LIBUSB_REQUEST_GET_DESCRIPTOR,
		((LIBUSB_DT_STRING << 8) | desc_index),
		langid,
		length,
		(error?: LibUSBException, buffer?: Buffer) => {
			if (error) {
                return callback(error);
            }
			callback(undefined, buffer ? buffer.toString('utf16le', 2) : undefined);
		}
	);
}

export { getDeviceList } from '../build/Release/usb_bindings';
