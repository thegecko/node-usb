// Type definitions for node-usb 1.5
// Project: https://github.com/tessel/node-usb
// Definitions by: Eric Brody <https://github.com/underscorebrody>
//                 Rob Moran <https://github.com/thegecko>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare type DeviceDescriptor = import('./descriptors').DeviceDescriptor;
declare type ConfigDescriptor = import('./descriptors').ConfigDescriptor;
declare type BosDescriptor = import('./descriptors').BosDescriptor;
declare type ExtendedDevice = import('./device').Device;

declare module '*usb_bindings' {

    type EventListeners = 'newListener' | 'removeListener';

    interface DeviceEvents {
        attach: ExtendedDevice;
        detach: ExtendedDevice;
    }

    export function addListener<K extends keyof DeviceEvents>(event: K, listener: (arg: DeviceEvents[K]) => void): void;
    export function addListener<K extends keyof DeviceEvents>(event: EventListeners, listener: (event: K, listener: (arg: DeviceEvents[K]) => void) => void): void;
    export function removeListener<K extends keyof DeviceEvents>(event: K, listener: (arg: DeviceEvents[K]) => void): void;
    export function removeListener<K extends keyof DeviceEvents>(event: EventListeners, listener: (event: K, listener: (arg: DeviceEvents[K]) => void) => void): void;
    export function on<K extends keyof DeviceEvents>(event: K, listener: (arg: DeviceEvents[K]) => void): void;
    export function on<K extends keyof DeviceEvents>(event: EventListeners, listener: (event: K, listener: (arg: DeviceEvents[K]) => void) => void): void;
    export function off<K extends keyof DeviceEvents>(event: K, listener: (arg: DeviceEvents[K]) => void): void;
    export function off<K extends keyof DeviceEvents>(event: EventListeners, listener: (event: K, listener: (arg: DeviceEvents[K]) => void) => void): void;
    export function once<K extends keyof DeviceEvents>(event: K, listener: (arg: DeviceEvents[K]) => void): void;
    export function once<K extends keyof DeviceEvents>(event: EventListeners, listener: (event: K, listener: (arg: DeviceEvents[K]) => void) => void): void;
    export function listeners<K extends keyof DeviceEvents>(event: K): Function[];
    export function rawListeners<K extends keyof DeviceEvents>(event: K): Function[];
    export function removeAllListeners<K extends keyof DeviceEvents>(event?: K): void;
    export function emit<K extends keyof DeviceEvents>(event: K, arg: DeviceEvents[K]): boolean;
    export function listenerCount<K extends keyof DeviceEvents>(event: K): number;

    /**
     * Return a list of `Device` objects for the USB devices attached to the system.
     */
    export function getDeviceList(): ExtendedDevice[];

    export const INIT_ERROR: number;

    export class LibUSBException extends Error {
        errno: number;
    }

    /**
     * Set the libusb debug level (between 0 and 4)
     * @param level libusb debug level (between 0 and 4)
     */
    export function setDebugLevel(level: number): void;

    export function _enableHotplugEvents(): void;
    export function _disableHotplugEvents(): void;

    /** Represents a USB transfer */
    export class Transfer {
        constructor(device: Device, endpointAddr: number, type: number, timeout: number, callback: (error: LibUSBException, buf: Buffer, actual: number) => void);

        /**
         * (Re-)submit the transfer.
         *
         * @param buffer Buffer where data will be written (for IN transfers) or read from (for OUT transfers).
         */
        submit(buffer: Buffer, callback?: (error: undefined | LibUSBException, buffer: Buffer, actualLength: number) => void): Transfer;

        /**
         * Cancel the transfer.
         *
         * Returns `true` if the transfer was canceled, `false` if it wasn't in pending state.
         */
        cancel(): boolean;
    }

    /** Represents a USB device. */
    export class Device {
        /** Integer USB device number */
        busNumber: number;

        /** Integer USB device address */
        deviceAddress: number;

        /** Array containing the USB device port numbers, or `undefined` if not supported on this platform. */
        portNumbers: number[];

        /** Object with properties for the fields of the device descriptor. */
        deviceDescriptor: DeviceDescriptor;

        _bosDescriptor?: BosDescriptor;

        __open(): void;
        __close(): void;
        __getParent(): Device;
        __getConfigDescriptor(): ConfigDescriptor;
        __getAllConfigDescriptors(): ConfigDescriptor[];
        __setConfiguration(desired: number, callback: (error?: LibUSBException) => void): void;
        __clearHalt(addr: number, callback: (error: undefined | LibUSBException) => void): void;
        __setInterface(addr: number, altSetting: number, callback: (error?: LibUSBException) => void): void;
        __claimInterface(addr: number): void;
        __releaseInterface(addr: number, callback: (error?: LibUSBException) => void): void;
        __detachKernelDriver(addr: number): void;
        __attachKernelDriver(addr: number): void;
        __isKernelDriverActive(addr: number): boolean;

        /**
        * Performs a reset of the device. Callback is called when complete.
        *
        * The device must be open to use this method.
        * @param callback
        */
        reset(callback: (error: undefined | LibUSBException) => void): void;
    }

    /**
     * In the context of a \ref libusb_device_descriptor "device descriptor",
     * this bDeviceClass value indicates that each interface specifies its
     * own class information and all interfaces operate independently.
     */
    export const LIBUSB_CLASS_PER_INTERFACE: number;
    /** Audio class */
    export const LIBUSB_CLASS_AUDIO: number;
    /** Communications class */
    export const LIBUSB_CLASS_COMM: number;
    /** Human Interface Device class */
    export const LIBUSB_CLASS_HID: number;
    /** Printer class */
    export const LIBUSB_CLASS_PRINTER: number;
    /** Image class */
    export const LIBUSB_CLASS_PTP: number;
    /** Mass storage class */
    export const LIBUSB_CLASS_MASS_STORAGE: number;
    /** Hub class */
    export const LIBUSB_CLASS_HUB: number;
    /** Data class */
    export const LIBUSB_CLASS_DATA: number;
    /** Wireless class */
    export const LIBUSB_CLASS_WIRELESS: number;
    /** Application class */
    export const LIBUSB_CLASS_APPLICATION: number;
    /** Class is vendor-specific */
    export const LIBUSB_CLASS_VENDOR_SPEC: number;

    // libusb_standard_request
    /** Request status of the specific recipient */
    export const LIBUSB_REQUEST_GET_STATUS: number;
    /** Clear or disable a specific feature */
    export const LIBUSB_REQUEST_CLEAR_FEATURE: number;
    /** Set or enable a specific feature */
    export const LIBUSB_REQUEST_SET_FEATURE: number;
    /** Set device address for all future accesses */
    export const LIBUSB_REQUEST_SET_ADDRESS: number;
    /** Get the specified descriptor */
    export const LIBUSB_REQUEST_GET_DESCRIPTOR: number;
    /** Used to update existing descriptors or add new descriptors */
    export const LIBUSB_REQUEST_SET_DESCRIPTOR: number;
    /** Get the current device configuration value */
    export const LIBUSB_REQUEST_GET_CONFIGURATION: number;
    /** Set device configuration */
    export const LIBUSB_REQUEST_SET_CONFIGURATION: number;
    /** Return the selected alternate setting for the specified interface */
    export const LIBUSB_REQUEST_GET_INTERFACE: number;
    /** Select an alternate interface for the specified interface */
    export const LIBUSB_REQUEST_SET_INTERFACE: number;
    /** Set then report an endpoint's synchronization frame */
    export const LIBUSB_REQUEST_SYNCH_FRAME: number;

    // libusb_descriptor_type
    /** Device descriptor. See libusb_device_descriptor. */
    export const LIBUSB_DT_DEVICE: number;
    /** Configuration descriptor. See libusb_config_descriptor. */
    export const LIBUSB_DT_CONFIG: number;
    /** String descriptor */
    export const LIBUSB_DT_STRING: number;
    export const LIBUSB_DT_BOS: number;
    /** Interface descriptor. See libusb_interface_descriptor. */
    export const LIBUSB_DT_INTERFACE: number;
    /** Endpoint descriptor. See libusb_endpoint_descriptor. */
    export const LIBUSB_DT_ENDPOINT: number;
    /** HID descriptor */
    export const LIBUSB_DT_HID: number;
    /** HID report descriptor */
    export const LIBUSB_DT_REPORT: number;
    /** Physical descriptor */
    export const LIBUSB_DT_PHYSICAL: number;
    /** Hub descriptor */
    export const LIBUSB_DT_HUB: number;

    // libusb_endpoint_direction
    /** In: device-to-host */
    export const LIBUSB_ENDPOINT_IN: number;
    /** Out: host-to-device */
    export const LIBUSB_ENDPOINT_OUT: number;

    // libusb_transfer_type
    /** Control endpoint */
    export const LIBUSB_TRANSFER_TYPE_CONTROL: number;
    /** Isochronous endpoint */
    export const LIBUSB_TRANSFER_TYPE_ISOCHRONOUS: number;
    /** Bulk endpoint */
    export const LIBUSB_TRANSFER_TYPE_BULK: number;
    /** Interrupt endpoint */
    export const LIBUSB_TRANSFER_TYPE_INTERRUPT: number;

    // libusb_iso_sync_type
    /** No synchronization */
    export const LIBUSB_ISO_SYNC_TYPE_NONE: number;
    /** Asynchronous */
    export const LIBUSB_ISO_SYNC_TYPE_ASYNC: number;
    /** Adaptive */
    export const LIBUSB_ISO_SYNC_TYPE_ADAPTIVE: number;
    /** Synchronous */
    export const LIBUSB_ISO_SYNC_TYPE_SYNC: number;

    // libusb_iso_usage_type
    /** Data endpoint */
    export const LIBUSB_ISO_USAGE_TYPE_DATA: number;
    /** Feedback endpoint */
    export const LIBUSB_ISO_USAGE_TYPE_FEEDBACK: number;
    /** Implicit feedback Data endpoint */
    export const LIBUSB_ISO_USAGE_TYPE_IMPLICIT: number;

    // libusb_transfer_status
    /**
     * Transfer completed without error. Note that this does not indicate
     * that the entire amount of requested data was transferred.
     */
    export const LIBUSB_TRANSFER_COMPLETED: number;
    /** Transfer failed */
    export const LIBUSB_TRANSFER_ERROR: number;
    /** Transfer timed out */
    export const LIBUSB_TRANSFER_TIMED_OUT: number;
    /** Transfer was cancelled */
    export const LIBUSB_TRANSFER_CANCELLED: number;
    /**
     * For bulk/interrupt endpoints: halt condition detected (endpoint
     * stalled). For control endpoints: control request not supported.
     */
    export const LIBUSB_TRANSFER_STALL: number;
    /** Device was disconnected */
    export const LIBUSB_TRANSFER_NO_DEVICE: number;
    /** Device sent more data than requested */
    export const LIBUSB_TRANSFER_OVERFLOW: number;

    // libusb_transfer_flags
    /** Report short frames as errors */
    export const LIBUSB_TRANSFER_SHORT_NOT_OK: number;
    /**
     * Automatically free() transfer buffer during libusb_free_transfer().
     * Note that buffers allocated with libusb_dev_mem_alloc() should not
     * be attempted freed in this way, since free() is not an appropriate
     * way to release such memory.
     */
    export const LIBUSB_TRANSFER_FREE_BUFFER: number;
    /**
     * Automatically call libusb_free_transfer() after callback returns.
     * If this flag is set, it is illegal to call libusb_free_transfer()
     * from your transfer callback, as this will result in a double-free
     * when this flag is acted upon.
     */
    export const LIBUSB_TRANSFER_FREE_TRANSFER: number;

    // libusb_request_type
    /** Standard */
    export const LIBUSB_REQUEST_TYPE_STANDARD: number;
    /** Class */
    export const LIBUSB_REQUEST_TYPE_CLASS: number;
    /** Vendor */
    export const LIBUSB_REQUEST_TYPE_VENDOR: number;
    /** Reserved */
    export const LIBUSB_REQUEST_TYPE_RESERVED: number;

    // libusb_request_recipient
    /** Device */
    export const LIBUSB_RECIPIENT_DEVICE: number;
    /** Interface */
    export const LIBUSB_RECIPIENT_INTERFACE: number;
    /** Endpoint */
    export const LIBUSB_RECIPIENT_ENDPOINT: number;
    /** Other */
    export const LIBUSB_RECIPIENT_OTHER: number;

    export const LIBUSB_CONTROL_SETUP_SIZE: number;
    export const LIBUSB_DT_BOS_SIZE: number;

    // libusb_error
    /** Input/output error */
    export const LIBUSB_ERROR_IO: number;
    /** Invalid parameter */
    export const LIBUSB_ERROR_INVALID_PARAM: number;
    /** Access denied (insufficient permissions) */
    export const LIBUSB_ERROR_ACCESS: number;
    /** No such device (it may have been disconnected) */
    export const LIBUSB_ERROR_NO_DEVICE: number;
    /** Entity not found */
    export const LIBUSB_ERROR_NOT_FOUND: number;
    /** Resource busy */
    export const LIBUSB_ERROR_BUSY: number;
    /** Operation timed out */
    export const LIBUSB_ERROR_TIMEOUT: number;
    /** Overflow */
    export const LIBUSB_ERROR_OVERFLOW: number;
    /** Pipe error */
    export const LIBUSB_ERROR_PIPE: number;
    /** System call interrupted (perhaps due to signal) */
    export const LIBUSB_ERROR_INTERRUPTED: number;
    /** Insufficient memory */
    export const LIBUSB_ERROR_NO_MEM: number;
    /** Operation not supported or unimplemented on this platform */
    export const LIBUSB_ERROR_NOT_SUPPORTED: number;
    /** Other error */
    export const LIBUSB_ERROR_OTHER: number;
}
