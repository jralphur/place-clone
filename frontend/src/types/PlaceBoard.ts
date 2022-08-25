import {
  bitsToName,
  htmlColors,
  type PlaceColorName,
  type PlaceRawBoard,
} from "../types";
import type { RGBA } from "./RGBA";

class PlaceBoard {
  board: ImageData;
  view: Uint32Array;
  size: number;

  constructor(raw: PlaceRawBoard) {
    this.size = raw.byteLength * 2;
    const data = new ArrayBuffer(this.size * 4);

    const boardView = new Uint32Array(data);
    const rawView = new Uint8ClampedArray(raw);

    for (let i = 0, j = 0; i < rawView.length; i++, j += 2) {
      const byte = rawView[i];
      const upper = (byte & 0xf0) >> 4;
      const lower = byte & 0x0f;
      boardView[j] = htmlColors[bitsToName[upper]];
      boardView[j + 1] = htmlColors[bitsToName[lower]];
    }

    this.board = new ImageData(
      new Uint8ClampedArray(data),
      Math.sqrt(this.size)
    );
    this.view = boardView;
  }

  width(): number {
    return this.size / 1000;
  }

  height(): number {
    return this.size / 1000;
  }

  update(x: number, y: number, color: PlaceColorName) {
    const offset = this.offset(x, y);
    this.view[offset] = htmlColors[color];
  }

  at(x: number, y: number): RGBA {
    const offset = this.offset(x, y);
    const ret = {
      red: this.board.data[offset],
      green: this.board.data[offset + 1],
      blue: this.board.data[offset + 2],
      alpha: this.board.data[offset + 3],
    };
    return ret;
  }

  offset(x: number, y: number): number {
    return y * (this.size * 4) + x * 4;
  }
}

export default PlaceBoard;
