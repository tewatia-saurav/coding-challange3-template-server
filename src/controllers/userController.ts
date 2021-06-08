import User from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const register = async (req: any, res: any) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    res.status(409).send({
      status: "fail",
      message: "User email already present in the system",
    });
  } else {
    let hashedPwd = await bcrypt.hash(req.body.password, 10);

    let user = new User({ ...req.body, password: hashedPwd });

    user.save((err: any, result: any) => {
      if (err) {
        res.status(404).send({ status: "fail", message: err });
      } else {
        res.status(201).send({ status: "pass", message: "user created" });
      }
    });
  }
};

export const login = async (req: any, res: any) => {
  let user = await User.findOne({ email: req.body.email });

  if (user) {
    let verify = await bcrypt.compare(req.body.password, user.password);
    if (verify) {
      //@ts-ignore
      const token = jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET);
      res.status(200).send({
        token: token,
      });
    } else {
      res.status(401).send({ message: "Password mismatch" });
    }
  } else {
    res.status(404).send({ message: "User not found" });
  }
};
