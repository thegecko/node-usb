assert = require('assert')
util = require('util')
webusb = require('../').webusb

if typeof gc is 'function'
	# running with --expose-gc, do a sweep between tests so valgrind blames the right one
	afterEach -> gc()

describe 'Module', ->
	it 'should describe basic constants', ->
		assert.notEqual(webusb, undefined, "webusb must be undefined")

describe 'requestDevice', ->
	it 'should return a device', ->
		device = await webusb.requestDevice({ filters: [{ vendorId: 0x59e3 }] });
		assert.ok(device != undefined)

describe 'Device', ->
	device = null
	before ->
		device = await webusb.requestDevice({ filters: [{ vendorId: 0x59e3 }] });

	it 'should have usb version properties', ->
		assert.equal(device.usbVersionMajor, 1)
		assert.equal(device.usbVersionMinor, 1)
		assert.equal(device.usbVersionSubminor, 0)

	it 'should have device version properties', ->
		assert.equal(device.deviceVersionMajor, 1)
		assert.equal(device.deviceVersionMinor, 1)
		assert.equal(device.deviceVersionSubminor, 0)

	it 'should have class properties', ->
		assert.equal(device.deviceClass, 0)
		assert.equal(device.deviceSubclass, 0)

	it 'should have protocol property', ->
		assert.equal(device.deviceProtocol, 0)

	it 'should have vid/pid properties', ->
		assert.equal(device.vendorId, 0x59e3)
		assert.equal(device.productId, 0x0a23)

	it 'should have configurations', ->
		assert.ok(device.configurations.length > 0)

	it 'should have a configuration property', ->
		assert.ok(device.configuration != undefined)

	it 'gets string descriptors', ->
		assert.equal(device.serialNumber, "TEST_DEVICE")
		assert.equal(device.manufacturerName, "Nonolith Labs")
		assert.equal(device.productName, "STM32F103 Test Device")

#	after ->
#		device.close()

#  attribute EventHandler onconnect;
#  attribute EventHandler ondisconnect;
#  Promise<sequence<USBDevice>> getDevices();

#  readonly attribute boolean opened;
#  Promise<undefined> open();
#  Promise<undefined> selectConfiguration(octet configurationValue);
#  Promise<undefined> close();
#  Promise<undefined> claimInterface(octet interfaceNumber);
#  Promise<undefined> releaseInterface(octet interfaceNumber);
#  Promise<undefined> selectAlternateInterface(octet interfaceNumber, octet alternateSetting);
#  Promise<USBInTransferResult> controlTransferIn(USBControlTransferParameters setup, unsigned short length);
#  Promise<USBOutTransferResult> controlTransferOut(USBControlTransferParameters setup, optional BufferSource data);
#  Promise<undefined> clearHalt(USBDirection direction, octet endpointNumber);
#  Promise<USBInTransferResult> transferIn(octet endpointNumber, unsigned long length);
#  Promise<USBOutTransferResult> transferOut(octet endpointNumber, BufferSource data);
#  Promise<USBIsochronousInTransferResult> isochronousTransferIn(octet endpointNumber, sequence<unsigned long> packetLengths);
#  Promise<USBIsochronousOutTransferResult> isochronousTransferOut(octet endpointNumber, BufferSource data, sequence<unsigned long> packetLengths);
#  Promise<undefined> reset();
