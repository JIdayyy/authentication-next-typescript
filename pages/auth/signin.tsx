import React from "react";
import { useAuth } from "../../src/context/UserContext";

type Props = {};

export default function Signin({}: Props) {
  const { signIn } = useAuth();
  const [credentials, setCredentials] = React.useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <label htmlFor="">
        <p>Email :</p>
        <input
          type="text"
          name="email"
          value={credentials.email}
          onChange={handleChange}
        />
      </label>
      <label htmlFor="">
        <p>Password :</p>
        <input
          type="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
        />
      </label>
      <button onClick={() => signIn(credentials)}>Sign In</button>
    </div>
  );
}
