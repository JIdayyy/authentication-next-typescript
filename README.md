# Here is a tutorial on how to build sign in and sign up pages and store the user in a context in a Next.js app.

If you want you can clone this repo to get the code for the tutorial:

```bash
git clone
cd therepo
npm install
```

Then you need to create a folder in the pages folder called `auth` and create two files in it called `signin.tsx` and `signup.tsx`.

In those pages we will create two forms, one for signing in and one for signing up. We will also create a context to store the user in.

## Context.

The idea here is to create a context that will store the user and provide it to the rest of the app. We will use the `useContext` hook to access the user.

First, create the src folder and inside it create a folder called `context` and inside it create a file called `UserContext.tsx`.

In this file you will create the `UserContext`.
First, import the method `createContext` from React and create the user context.

```js
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

```js
const UserContext = (createContext < IUserContext) | (null > null);
```

Now let's create our context provider.

```js
type TUserContextProviderProps = {
  children: React.ReactNode,
};

const UserContextProvider = ({ children }: TUserContextProviderProps) => {
  return <UserContext.Provider>{children}</UserContext.Provider>;
};
```

This component will handle all the logic of our authentication flow.
We will create a state inside with two keys, isAuth and user.

```js
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

```js
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

```js
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

```js
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

```js
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

At the end our UserContextProvider component should look like this :

```js
// src/context/userContext.tsx
const UserContextProvider = ({ children }: TUserContextProviderProps) => {
  const [authState, setAuthState] =
    useState <
    AuthState >
    {
      user: null,
      isAuth: false,
    };

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

  const signOut = async () => {
    setAuthState({
      user: null,
      isAuth: false,
    });
    localStorage.removeItem("token");
    axiosInstance.defaults.headers.common["authorization"] = "";
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
```

If you want to see the usage you can check the two pages in the repo

```
- pages/auth/signin.tsx
- pages/index.tsx
```
