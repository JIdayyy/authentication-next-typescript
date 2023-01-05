import { useRouter } from "next/router";
import { useAuth } from "../src/context/UserContext";

export default function Home() {
  const { user, isAuth } = useAuth();
  const router = useRouter();

  return (
    <div>
      <h1>Home</h1>
      <p>{isAuth ? "Authenticated" : "Not authenticated"}</p>
      <p>{user ? user.email : "No user"}</p>
      {!isAuth ? (
        <button onClick={() => router.push("/auth/signin")}>Sign In</button>
      ) : (
        <button onClick={() => router.push("/auth/signin")}>Sign Out</button>
      )}
    </div>
  );
}
