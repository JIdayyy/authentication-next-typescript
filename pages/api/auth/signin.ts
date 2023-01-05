import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

const users = [
  {
    id: 1,
    name: "John Doe",
    email: "johndoe@gmail.com",
    avatar: "https://i.pravatar.cc/150?img=1",
    password: "test",
  },
];

const signInHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, password } = req.body;

  const user = users.find((user) => user.email === email);

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const valid = password === user.password;

  if (!valid) {
    return res.status(400).json({ message: "Invalid password" });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string, {
    expiresIn: "1d",
  });

  res.setHeader("authorization", `Bearer ${token}`);

  res.status(200).json(user);
};

export default signInHandler;
