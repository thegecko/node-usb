import { EventEmitter } from 'events';
import { Device, LibUSBException, Transfer } from '*usb_bindings';
import { EndpointDescriptor } from './descriptors';

/** Common base for InEndpoint and OutEndpoint. */
export abstract class Endpoint extends EventEmitter {
    public address: number;

    /** Endpoint direction: `"in"` or `"out"`. */
    public abstract direction: 'in' | 'out';

    /** Endpoint type: `usb.LIBUSB_TRANSFER_TYPE_BULK`, `usb.LIBUSB_TRANSFER_TYPE_INTERRUPT`, or `usb.LIBUSB_TRANSFER_TYPE_ISOCHRONOUS`. */
    public transferType: number;

    /** Sets the timeout in milliseconds for transfers on this endpoint. The default, `0`, is infinite timeout. */
    public timeout: number = 0;

    /** Object with fields from the endpoint descriptor -- see libusb documentation or USB spec. */
    public descriptor: EndpointDescriptor;

    constructor(protected device: Device, descriptor: EndpointDescriptor) {
        super();
        this.descriptor = descriptor
        this.address = descriptor.bEndpointAddress
        this.transferType = descriptor.bmAttributes & 0x03
    }

    /** Clear the halt/stall condition for this endpoint. */
    public clearHalt(callback: (error: undefined | LibUSBException) => void): void {
        return this.device.__clearHalt(this.address, callback);
    }

    /**
     * Create a new `Transfer` object for this endpoint.
     *
     * The passed callback will be called when the transfer is submitted and finishes. Its arguments are the error (if any), the submitted buffer, and the amount of data actually written (for
     * OUT transfers) or read (for IN transfers).
     *
     * @param timeout Timeout for the transfer (0 means unlimited).
     * @param callback Transfer completion callback.
     */
    public makeTransfer(timeout: number, callback: (error: undefined | LibUSBException, buffer?: Buffer, actualLength?: number) => void): Transfer {
        return new Transfer(this.device, this.address, this.transferType, timeout, callback);
    }
}

/** Endpoints in the IN direction (device->PC) have this type. */
export class InEndpoint extends Endpoint {

    /** Endpoint direction. */
    public direction: 'in' | 'out' = 'in';

    constructor(device: Device, descriptor: EndpointDescriptor) {
        super(device, descriptor);
    }

    /**
     * Perform a transfer to read data from the endpoint.
     *
     * If length is greater than maxPacketSize, libusb will automatically split the transfer in multiple packets, and you will receive one callback with all data once all packets are complete.
     *
     * `this` in the callback is the InEndpoint object.
     *
     * The device must be open to use this method.
     * @param length
     * @param callback
     */
    /*
    public transfer(length: number, callback: (error: undefined | LibUSBException, data?: Buffer) => void): InEndpoint {
        var self = this
        var buffer = Buffer.alloc(length)
    
        function callback(error, buf, actual){
            cb.call(self, error, buffer.slice(0, actual))
        }
    
        try {
            this.makeTransfer(this.timeout, callback).submit(buffer)
        } catch (e) {
            process.nextTick(function() { cb.call(self, e); });
        }
        return this;
    }
    */

    /**
     * Start polling the endpoint.
     *
     * The library will keep `nTransfers` transfers of size `transferSize` pending in the kernel at all times to ensure continuous data flow.
     * This is handled by the libusb event thread, so it continues even if the Node v8 thread is busy. The `data` and `error` events are emitted as transfers complete.
     *
     * The device must be open to use this method.
     * @param nTransfers
     * @param transferSize
     */
    /*
    public startPoll(nTransfers?: number, transferSize?: number): void {
        var self = this
        this.pollTransfers = this.poll(nTransfers, transferSize, transferDone)
    
        function transferDone(error, buf, actual){
            if (!error){
                self.emit("data", buf.slice(0, actual))
            }else if (error.errno != usb.LIBUSB_TRANSFER_CANCELLED){
                self.emit("error", error)
                self.stopPoll()
            }
    
            if (self.pollActive){
                startTransfer(this)
            }else{
                self.pollPending--
    
                if (self.pollPending == 0){
                    delete self.pollTransfers;
                    self.emit('end')
                }
            }
        }
    
        function startTransfer(t){
            try {
                t.submit(Buffer.alloc(self.pollTransferSize), transferDone);
            } catch (e) {
                self.emit("error", e);
                self.stopPoll();
            }
        }
    
        this.pollTransfers.forEach(startTransfer)
        self.pollPending = this.pollTransfers.length
    }

    private poll(nTransfers?: number, transferSize?: number, callback): void {
        if (this.pollTransfers){
            throw new Error("Polling already active")
        }
    
        nTransfers = nTransfers || 3;
        this.pollTransferSize = transferSize || this.descriptor.wMaxPacketSize;
        this.pollActive = true
        this.pollPending = 0
    
        var transfers = []
        for (var i=0; i<nTransfers; i++){
            transfers[i] = this.makeTransfer(0, callback)
        }
        return transfers;
    }
*/
    /**
     * Stop polling.
     *
     * Further data may still be received. The `end` event is emitted and the callback is called once all transfers have completed or canceled.
     *
     * The device must be open to use this method.
     * @param callback
     */
    /*
    public stopPoll(callback?: () => void): void {
        if (!this.pollTransfers) {
            throw new Error('Polling is not active.');
        }
        for (var i=0; i<this.pollTransfers.length; i++){
            try {
                this.pollTransfers[i].cancel()
            } catch (err) {
                this.emit('error', err);
            }
        }
        this.pollActive = false
        if (cb) this.once('end', cb);
    }
    */
}

/** Endpoints in the OUT direction (PC->device) have this type. */
export class OutEndpoint extends Endpoint {

    /** Endpoint direction. */
    public direction: 'in' | 'out' = 'out';

    constructor(device: Device, descriptor: EndpointDescriptor) {
        super(device, descriptor);
    }

    /**
     * Perform a transfer to write `data` to the endpoint.
     *
     * If length is greater than maxPacketSize, libusb will automatically split the transfer in multiple packets, and you will receive one callback once all packets are complete.
     *
     * `this` in the callback is the OutEndpoint object.
     *
     * The device must be open to use this method.
     * @param buffer
     * @param callback
     */
    /*
    public transfer(buffer: Buffer, cb?: (error: undefined | LibUSBException) => void): OutEndpoint {
        var self = this
        if (!buffer){
            buffer = Buffer.alloc(0)
        }else if (!isBuffer(buffer)){
            buffer = Buffer.from(buffer)
        }
    
        function callback(error: undefined | LibUSBException, buf: Buffer, actual){
            if (cb) cb.call(self, error)
        }
    
        try {
            this.makeTransfer(this.timeout, callback).submit(buffer);
        } catch (e) {
            process.nextTick(function() { callback(e); });
        }
    
        return this;
    }

    public transferWithZLP(buffer: Buffer, callback: (error: undefined | LibUSBException) => void): void {
        if (buffer.length % this.descriptor.wMaxPacketSize == 0) {
            this.transfer(buffer);
            this.transfer(Buffer.alloc(0), callback);
        } else {
            this.transfer(buffer, callback);
        }
    }
    */
}
