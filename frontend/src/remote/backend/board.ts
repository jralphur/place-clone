import {
  colors,
  type PlaceColorScheme,
  type PlaceTileRequest,
  type PlaceTimestamp,
} from "../../types";
import PlaceBoard from "../../types/PlaceBoard";
import token from "./token";

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/board`;

const getBoard = async (): Promise<PlaceBoard> => {
  const b = await fetch(baseUrl);
  const ab = await b.arrayBuffer();
  return new PlaceBoard(ab);
};

const putTile = async (tile: PlaceTileRequest) => {
  const config = {
    method: "POST",
    body: JSON.stringify(tile),
    headers: { Authorization: token.getToken() },
  };

  await fetch(baseUrl, config);
};

const getColors = async (): Promise<PlaceColorScheme> => {
  const b = await fetch(baseUrl + "/colors");
  const j = await b.json();

  if (
    typeof j === "object" &&
    j !== null &&
    "colors" in j &&
    typeof j.colors === "object"
  ) {
    const entry = Object.keys(j.colors);
    entry.forEach((en) => {
      if (en in colors || typeof j.colors[en] !== "number") {
        throw new Error("unknown response " + j);
      }
    });

    return j.colors;
  }

  throw new Error("unknown response: " + j);
};

const getTimestamp = async (): Promise<PlaceTimestamp> => {
  const config = {
    method: "GET",
    headers: { Authorization: token.getToken() },
  };

  const b = await fetch(baseUrl + "/timestamp", config);
  const j = await b.json();

  if (
    typeof b === "object" &&
    j !== null &&
    "timestamp" in j &&
    typeof j.timestamp === "number"
  ) {
    return j;
  }

  throw new Error("unknown response: " + j);
};
export { getBoard, putTile, getColors, getTimestamp };
