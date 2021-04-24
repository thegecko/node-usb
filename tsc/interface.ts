import type { Device } from "*usb_bindings";

export class Interface {
    /** Integer interface number. */
    public interfaceNumber: number;

    /** Integer alternate setting number. */
    // public altSetting = 0;

    /** Object with fields from the interface descriptor -- see libusb documentation or USB spec. */
    // public descriptor: InterfaceDescriptor;

    /** List of endpoints on this interface: InEndpoint and OutEndpoint objects. */
    // public endpoints: Endpoint[];

    constructor(protected device: Device, protected id: number) {
        this.interfaceNumber = 0;

    }
}
/*
//         constructor(device: Device, id: number);
function Interface(device, id){
    this.device = device
    this.id = id
    this.altSetting = 0;
    this.__refresh()
}

Interface.prototype.__refresh = function(){
    this.descriptor = this.device.configDescriptor.interfaces[this.id][this.altSetting]
    this.interfaceNumber = this.descriptor.bInterfaceNumber
    this.endpoints = []
    var len = this.descriptor.endpoints.length
    for (var i=0; i<len; i++){
        var desc = this.descriptor.endpoints[i]
        var c = (desc.bEndpointAddress&usb.LIBUSB_ENDPOINT_IN)?InEndpoint:OutEndpoint
        this.endpoints[i] = new c(this.device, desc)
    }
}
*/
/**
 * Claims the interface. This method must be called before using any endpoints of this interface.
 *
 * The device must be open to use this method.
 */
        //claim(): void;
/*
Interface.prototype.claim = function(){
this.device.__claimInterface(this.id)
}
*/
/**
 * Releases the interface and resets the alternate setting. Calls callback when complete.
 *
 * It is an error to release an interface with pending transfers.
 *
 * The device must be open to use this method.
 * @param callback
 */
		// release(callback?: (error: undefined | LibUSBException) => void): void;
/**
* Releases the interface and resets the alternate setting. Calls callback when complete.
*
* It is an error to release an interface with pending transfers. If the optional closeEndpoints
* parameter is true, any active endpoint streams are stopped (see `Endpoint.stopStream`),
* and the interface is released after the stream transfers are cancelled. Transfers submitted
* individually with `Endpoint.transfer` are not affected by this parameter.
*
* The device must be open to use this method.
* @param closeEndpoints
* @param callback
*/
        // release(closeEndpoints?: boolean, callback?: (error: undefined | LibUSBException) => void): void;
/*
Interface.prototype.release = function(closeEndpoints, cb){
var self = this;
if (typeof closeEndpoints == 'function') {
cb = closeEndpoints;
closeEndpoints = null;
}

if (!closeEndpoints || this.endpoints.length == 0) {
next();
} else {
var n = self.endpoints.length;
self.endpoints.forEach(function (ep, i) {
    if (ep.pollActive) {
        ep.once('end', function () {
            if (--n == 0) next();
        });
        ep.stopPoll();
    } else {
        if (--n == 0) next();
    }
});
}

function next () {
self.device.__releaseInterface(self.id, function(err){
    if (!err){
        self.altSetting = 0;
        self.__refresh()
    }
    cb.call(self, err)
})
}
}

*/
/**
 * Returns `false` if a kernel driver is not active; `true` if active.
 *
 * The device must be open to use this method.
 */
        // isKernelDriverActive(): boolean;
/*
Interface.prototype.isKernelDriverActive = function(){
return this.device.__isKernelDriverActive(this.id)
}

/**
 * Detaches the kernel driver from the interface.
 *
 * The device must be open to use this method.
 */
        // detachKernelDriver(): void;
/*
Interface.prototype.detachKernelDriver = function() {
return this.device.__detachKernelDriver(this.id)
};


/**
 * Re-attaches the kernel driver for the interface.
 *
 * The device must be open to use this method.
 */
        // attachKernelDriver(): void;
/*
Interface.prototype.attachKernelDriver = function() {
return this.device.__attachKernelDriver(this.id)
};


/**
 * Sets the alternate setting. It updates the `interface.endpoints` array to reflect the endpoints found in the alternate setting.
 *
 * The device must be open to use this method.
 * @param altSetting
 * @param callback
 */
        // setAltSetting(altSetting: number, callback: (error: undefined | LibUSBException) => void): void;
/*
Interface.prototype.setAltSetting = function(altSetting, cb){
    var self = this;
    this.device.__setInterface(this.id, altSetting, function(err){
        if (!err){
            self.altSetting = altSetting;
            self.__refresh();
        }
        cb.call(self, err)
    })
}

        /**
         * Return the InEndpoint or OutEndpoint with the specified address.
         *
         * The device must be open to use this method.
         * @param addr
         */
        //endpoint(addr: number): Endpoint;
/*
Interface.prototype.endpoint = function(addr){
for (var i=0; i<this.endpoints.length; i++){
if (this.endpoints[i].address == addr){
    return this.endpoints[i]
}
}
}
*/

/*

export class Interface {
  /** Integer interface number. */
  //interfaceNumber: number;

  /** Integer alternate setting number. */
 /// altSetting: number;

  /** Object with fields from the interface descriptor -- see libusb documentation or USB spec. */
 // descriptor: InterfaceDescriptor;

  /** List of endpoints on this interface: InEndpoint and OutEndpoint objects. */
 // endpoints: Endpoint[];

//   constructor(device: Device, id: number);

  /**
   * Claims the interface. This method must be called before using any endpoints of this interface.
   *
   * The device must be open to use this method.
   */
//   claim(): void;

  /**
   * Releases the interface and resets the alternate setting. Calls callback when complete.
   *
   * It is an error to release an interface with pending transfers.
   *
   * The device must be open to use this method.
   * @param callback
   */
//   release(callback?: (error: undefined | LibUSBException) => void): void;

  /**
   * Releases the interface and resets the alternate setting. Calls callback when complete.
   *
   * It is an error to release an interface with pending transfers. If the optional closeEndpoints
   * parameter is true, any active endpoint streams are stopped (see `Endpoint.stopStream`),
   * and the interface is released after the stream transfers are cancelled. Transfers submitted
   * individually with `Endpoint.transfer` are not affected by this parameter.
   *
   * The device must be open to use this method.
   * @param closeEndpoints
   * @param callback
   */
//   release(closeEndpoints?: boolean, callback?: (error: undefined | LibUSBException) => void): void;

  /**
   * Returns `false` if a kernel driver is not active; `true` if active.
   *
   * The device must be open to use this method.
   */
//   isKernelDriverActive(): boolean;

  /**
   * Detaches the kernel driver from the interface.
   *
   * The device must be open to use this method.
   */
//   detachKernelDriver(): void;

  /**
   * Re-attaches the kernel driver for the interface.
   *
   * The device must be open to use this method.
   */
//   attachKernelDriver(): void;

  /**
   * Sets the alternate setting. It updates the `interface.endpoints` array to reflect the endpoints found in the alternate setting.
   *
   * The device must be open to use this method.
   * @param altSetting
   * @param callback
   */
//   setAltSetting(altSetting: number, callback: (error: undefined | LibUSBException) => void): void;

  /**
   * Return the InEndpoint or OutEndpoint with the specified address.
   *
   * The device must be open to use this method.
   * @param addr
   */
//   endpoint(addr: number): Endpoint;
// }


