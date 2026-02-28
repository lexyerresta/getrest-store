import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function encrypt(payload: any) {
  const secretKey = process.env.JWT_SECRET || "default_super_secret_key_dont_use_in_prod";
  const key = new TextEncoder().encode(secretKey);

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const secretKey = process.env.JWT_SECRET || "default_super_secret_key_dont_use_in_prod";
  const key = new TextEncoder().encode(secretKey);

  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function login(usernameInput: string, passwordInput: string) {
  try {
    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
      console.error("Missing ADMIN_USERNAME or ADMIN_PASSWORD in environment variables");
      return false;
    }

    if (usernameInput !== validUsername || passwordInput !== validPassword) {
      return false;
    }

    // Create session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = await encrypt({ admin: true, username: validUsername, expires });

    // Save session in a cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return true;
  } catch (error) {
    console.error("Login verification failed:", error);
    return false;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!session) return null;
  return await decrypt(session);
}
