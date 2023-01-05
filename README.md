# Here is a tutorial on how to build sign in and sign up pages and store the user in a context in a Next.js app.

If you want you can clone this repo to get the code for the tutorial:

```bash
git clone https://github.com/JIdayyy/authentication-next-typescript
cd authentication-next-typescript
npm install
npm run dev
```

Then you need to create a folder in the pages folder called `auth` and create two files in it called `signin.tsx` and `signup.tsx`.

In those pages we will create two forms, one for signing in and one for signing up. We will also create a context to store the user in.

## Context.

The idea here is to create a context that will store the user and provide it to the rest of the app. We will use the `useContext` hook to access the user.

First, create the src folder and inside it create a folder called `context` and inside it create a file called `UserContext.tsx`.

In this file you will create the `UserContext`.
First, import the method `createContext` from React and create the user context.

```ts
import { createContext } from "react";

const UserContext = createContext({});
```

As you know, we use Typescript so we have to create a type for our context.
In the same file create an interface `IUserContext` and a `User` type like below:

```ts
type TUser = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
};

interface IUserContext {
  user: TUser | null;
  isAuth: boolean;
  signIn: (credentials: TCredentials) => Promise<void>;
  signOut: () => Promise<void>;
}
```

As you can see our interface have 4 keys, one containing the User one is a boolean wich will be true/false if the user is connected or not and two methods signIn & signOut with will handle the API call, the token logic and set the user state.
The User type basically represent our User.

When those types are good, we need to type our context like this :

```ts
const UserContext = (createContext < IUserContext) | (null > null);
```

Now let's create our context provider.

```ts
type TUserContextProviderProps = {
  children: React.ReactNode;
};

const UserContextProvider = ({ children }: TUserContextProviderProps) => {
  return <UserContext.Provider>{children}</UserContext.Provider>;
};
```

This component will handle all the logic of our authentication flow.
We will create a state inside with two keys, isAuth and user.

```ts
type AuthState = {
  user: TUser | null,
  isAuth: boolean,
};

const UserContextProvider = ({ children }: TUserContextProviderProps) => {
  const [authState, setAuthState] =
    useState <
    AuthState >
    {
      user: null,
      isAuth: false,
    };

  return <UserContext.Provider>{children}</UserContext.Provider>;
};
```

Good, now we have our state in the provider, we have now to create the signIn and signOut methods to authenticate our users.

In a separate files create an instance of axios like this :

```ts
//src/utils/axiosInstance.ts
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SERVER_URL || "SERVER_URL",
  withCredentials: true,
});

export default axiosInstance;
```

Don't forget to add the server url in your .env file.
We will use this instance of axios in our provider so import it.

The `signIn` is a function who take an object as argument with two keys : email & password.

```ts
const signIn = async ({ email, password }: TCredentials) => {
  try {
    const { data, headers } = await axiosInstance.post("/auth/signin", {
      email,
      password,
    });
    setAuthState((state) => ({
      isAuth: true,
      user: data,
    }));
    const token = headers["authorization"];
    axiosInstance.defaults.headers.common["authorization"] = token;
    localStorage.setItem("token", token || "");
  } catch (error) {
    console.log(error);
  }
};
```

This function make a post request to our signin endpoint, set the user in the response body in our state and pass the isAuth key at `true`.
Here the jwt token is in the authorization header, so we get it from the axios response headers and set it in the local storage.

For the signOut method it is way more simple, the function simply set the user state key as null and the isAuth key as false and remove the token from the local storage.

```ts
const signOut = async () => {
  setAuthState({
    user: null,
    isAuth: false,
  });

  localStorage.removeItem("token");
  axiosInstance.defaults.headers.common["authorization"] = "";
};
```

We have now to pass all this stuff to our provider like this

```ts
<UserContext.Provider
  value={{
    user: authState.user,
    isAuth: authState.isAuth,
    signIn,
    signOut,
  }}
>
  {children}
</UserContext.Provider>
```

At the end our UserContextProvider file should look like this :

```ts
// src/context/userContext.tsx
import { useRouter } from "next/router";
import { createContext, useContext, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

type TUser = {
  id: string;
  email: string;
  name: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
};

interface IUserContext {
  user: TUser | null;
  isAuth: boolean;
  signIn: (credentials: TCredentials) => Promise<void>;
  signOut: () => Promise<void>;
}

type TUserContextProviderProps = {
  children: React.ReactNode;
};

type TCredentials = {
  email: string;
  password: string;
};

type AuthState = {
  user: TUser | null;
  isAuth: boolean;
};

const UserContext = (createContext < IUserContext) | (null > null);

const UserContextProvider = ({ children }: TUserContextProviderProps) => {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuth: false,
  });

  const signIn = async ({ email, password }: TCredentials) => {
    try {
      const { data, headers } = await axiosInstance.post("/auth/signin", {
        email,
        password,
      });
      setAuthState((state) => ({
        isAuth: true,
        user: data,
      }));
      const token = headers["authorization"];
      axiosInstance.defaults.headers.common["authorization"] = token;
      localStorage.setItem("token", token || "");
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  const signOut = async () => {
    setAuthState({
      user: null,
      isAuth: false,
    });
    localStorage.removeItem("token");
    axiosInstance.defaults.headers.common["authorization"] = "";
    router.push("/auth/signin");
  };

  return (
    <UserContext.Provider
      value={{
        user: authState.user,
        isAuth: authState.isAuth,
        signIn,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
```

To consume this context I use to create a custom hook in the same file like this :

```ts
// src/context/userContext.tsx
export const useAuth = () => {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error("useAuth must be used within a UserContextProvider");
  }
  return context;
};
```

As you can see we use the `useContext` hook to get the context and throw an error if the context is null.
With this hook we can use the context in our components like this :

```ts
export default function MyComponent() {
  const { user, isAuth, signIn, signOut } = useAuth();
  return <div>MyComponent</div>;
}
```

Don't forget to wrap your app with the provider in the `_app.tsx` file like this :

```ts
// pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import UserContextProvider from "../src/context/UserContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserContextProvider>
      <Component {...pageProps} />
    </UserContextProvider>
  );
}
```

## Usage.

Now we can use the context in our components.
In the `signin.tsx` page we can use the `signIn` function like this :

```ts
// pages/auth/signin.tsx
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

  return <div>// You form component here</div>;
}
```

And in the `index.tsx` page we can use the `signOut` function like this :

```ts
// pages/index.tsx
import { useAuth } from "../src/context/UserContext";

export default function Home() {
  const { signOut } = useAuth();
  return (
    <div>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}
```

I know there is a lot of informations here, but in the end it is not that complicated to implement a context in your nextjs app and it is really useful to manage your user state.
Once you have done this you can use the context in all your components and pages to get the user informations like the email or avatar.
The token is also stored in the localStorage so you can use it to make authenticated requests to your backend.

If you wan't to know how to implement authentication on the server side check this link : [Server authentication on express](https://tutorials.jidayyy.com/tutorial/server-authentication-on-express)

If you have any questions or suggestions feel free to ask in the comments ( you have to be logged in first 🚀 !).
