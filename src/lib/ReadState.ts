/**
 * Wraps a buffer with a read head pointer.
 */
export class ReadState {
  public _offset: number = 0;
  private _dataView: DataView;

  constructor(arrayBuffer: ArrayBuffer) {
    this._dataView = new DataView(arrayBuffer);
  }

  /** Used to skip bytes for reading headers. */
  public incrementOffset(): void {
    this._offset++;
  }

  public peekUInt8(): number {
    return this._dataView.getUint8(this._offset)
  }

  public readUInt8(): number {
    return this._dataView.getUint8(this._offset++)
  }

  public readUInt16(): number {
    var r = this._dataView.getUint16(this._offset)
    this._offset += 2
    return r
  }

  public readUInt32(): number {
    var r = this._dataView.getUint32(this._offset)
    this._offset += 4
    return r
  }

  public readInt8(): number {
    return this._dataView.getInt8(this._offset++)
  }

  public readInt16(): number {
    var r = this._dataView.getInt16(this._offset, true)
    this._offset += 2
    return r
  }

  public readInt32(): number {
    var r = this._dataView.getInt32(this._offset, true)
    this._offset += 4
    return r
  }

  public readFloat(): number {
    var r = this._dataView.getFloat32(this._offset)
    this._offset += 4
    return r
  }

  public readDouble(): number {
    var r = this._dataView.getFloat64(this._offset)
    this._offset += 8
    return r
  }

  public readBuffer(length: number): ArrayBuffer {
    if (this._offset + length > this._dataView.byteLength) {
      throw new RangeError('Trying to access beyond byte length')
    }
    
    const arrayBuffer = this._dataView.buffer.slice(this._offset, this._offset + length)
    this._offset += length
    
    return arrayBuffer;
  }

  public hasEnded(): boolean {
    return this._offset === this._dataView.byteLength
  }
}

export default ReadState;
