import type {
  LoginFormRequestData,
  PlaceLoginResponseBody,
  PlaceRegisterResponseBody,
  RegisterFormRequestData,
} from "../../types";

const baseUrl = `${import.meta.env.VITE_BACKEND_URL}/api/auth`;

const userLogin = async (
  login: LoginFormRequestData
): Promise<PlaceLoginResponseBody> => {
  const body = {
    body: JSON.stringify(login),
  };
  const b = await fetch(baseUrl + "/login", body);
  const j = await b.json();

  if (typeof j === "object" && j !== null && "username" in j && "token" in j) {
    if (typeof j.username === "string" && typeof j.token === "string") {
      return { username: j.username, token: j.token };
    }
  }

  throw new Error("unknown response " + j);
};

const userRegister = async (
  register: RegisterFormRequestData
): Promise<PlaceRegisterResponseBody> => {
  const body = {
    body: JSON.stringify(register),
  };
  const b = await fetch(baseUrl + "/register", body);
  const j = await b.json();

  if (typeof j === "object" && j !== null && "username" in j && "token" in j) {
    if (typeof j.username === "string" && typeof j.token === "string") {
      return { username: j.username, token: j.token };
    }
  }

  throw new Error("unknown response " + j);
};

export default { userLogin, userRegister };
