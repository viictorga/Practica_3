import {Router} from "express";
import dotenv from "dotenv";
import {getDB} from "../mongo"
import { Collection, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {Producto, Carts, User } from "./types"
import {AuthRequest, verifyToken} from "../middleware/verifyToken"
dotenv.config();

const router = Router();

const coleccion = () => getDB().collection<User>("users"); 
const coleccion1 = () => getDB().collection<Producto>("Products"); 
const coleccion2 = () => getDB().collection<Carts>("Carts"); 




router.get("/",async(req, res)=>{
    const productos= await coleccion1();
    res.status(200).json({productos})
})

router.post("/", verifyToken, async (req: AuthRequest, res) => {
    try{
        const { name, description, price, stock } = req.body as Producto;

        if(!name || typeof name !== "string" || name.trim().length === 0){
            return res.status(400).json({message: "Campo 'name' es obligatorio"});
        }

        if(price === undefined || typeof price !== "number"){
            return res.status(400).json({message: "Campo 'price' es obligatorio y debe ser número"});
        }

        if(price <= 0){
            return res.status(400).json({message: "El 'price' debe ser mayor que 0"});
        }

        if(stock === undefined || typeof stock !== "number"){
            return res.status(400).json({message: "Campo 'stock' es obligatorio y debe ser número"});
        }

        if(stock < 0){
            return res.status(400).json({message: "El 'stock' debe ser >= 0"});
        }

        const productToInsert: Producto = {
            name,
            description: description && typeof description === "string" ? description.trim() : "",
            price,
            stock,
            createdAt: new Date(Date.now())
        };

        const result = await coleccion1().insertOne(productToInsert);
        const created = await coleccion1().findOne({_id: result.insertedId});
        res.status(201).json(created);
    }catch(err){
        console.error("POST /api/products error:", err);
        res.status(500).json({message: "Error interno"});
    }
});

export default router;