import {Router} from "express";
import dotenv from "dotenv";
import {getDB} from "../mongo"
import { ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {JwtPayload, User } from "./types"
dotenv.config();

const router = Router();

const SECRET = process.env.SECRET;

const coleccion = () => getDB().collection<User>("users"); 





router.post("/register", async (req,res)=>{
    try {
        if((!req.body.email && !req.body.password && !req.body.username) || typeof(req.body) !== "object"){
        return res.status(400).json({ message: "Invalid JSON body" });
    }
        const { username, email, passwordHash} = req.body as User;

        if(!username || typeof username !== "string" ){
            return res.status(400).json({message: "Campo 'username' es obligatorio y debe ser string"});
        }

        if(!email || typeof email !== "string"){
            return res.status(400).json({message: "Campo 'email' es obligatorio y debe ser string"});
        }

        if(!email.endsWith("@gmail.com")){
            return res.status(400).json({message: "Formato de email inválido, debe terminar en @gmail.com"});
        }

        if(!passwordHash || typeof passwordHash !== "string"){
            return res.status(400).json({message: "Campo 'password' es obligatorio y debe ser string"});
        }
       
        const users = await coleccion();

        const existing = await(users.findOne({email: email})) // esto es como email: email

        if(existing){
            return res.status(409).json({error: "conflict, un usuario ya existe con este email"})
        }
        const passToEncripta = await bcrypt.hash(passwordHash,10);
        const fechaActual: Date = new Date();
        await users.insertOne({username, email, passwordHash: passToEncripta, createdAt: fechaActual});

        res.status(201).json({message: "User created"});

        
    } catch (error) {
        res.status(500).json({error: "no se ha registrado"})
    }
});

router.post("/login", async(req, res)=>{
    try{
        if((!req.body.email && !req.body.password) || typeof(req.body) !== "object"){
        return res.status(400).json({ message: "Invalid JSON body" });
    }
        const {email, passwordHash} = req.body as User
       

       if(!email || typeof email !== "string"){
            return res.status(400).json({message: "Campo 'email' es obligatorio"});
        }

        if(!email.endsWith("@gmail.com")){
            return res.status(400).json({message: "Formato de email inválido, debe terminar en @gmail.com"});
        }

        if(!passwordHash || typeof passwordHash !== "string"){
            return res.status(400).json({message: "Campo 'password' es obligatorio"});
        }

        const users = coleccion();

        const user = await users.findOne({email: email});
        if(!user) return res.status(404).json({message: "email incorrecto"});

        const validPass = await bcrypt.compare(passwordHash, user.passwordHash);
        if(!validPass) return res.status(401).json({message: "contraseña incorrecta"});

      
        const token = jwt.sign({id: user._id?.toString(), email: user.email}, SECRET as string, {
            expiresIn: "1h"
        });

        

        res.status(200).json({ token: "Bearer " +token})

    }catch(err){
        res.status(500).json({message: err});
    }
})


export default router;


