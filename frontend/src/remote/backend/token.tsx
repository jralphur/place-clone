let token: string;

const getToken = (): string => {
  if (token.length === 0) {
    return "";
  }

  return "bearer " + token;
};

const setToken = (t: string) => {
  token = t;
};

export default { getToken, setToken };
