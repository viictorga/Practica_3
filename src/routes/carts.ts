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


router.get("/", verifyToken, async(req: AuthRequest, res)=>{
    try {
         const username = req.user;
    const users = await coleccion();
    const usuFinal = await(users.findOne({username}))
    const idUsu = usuFinal?._id;

    const carts= await coleccion2();

    const cart = await(carts.findOne({userId: idUsu}))

    res.status(200).json({cart})
        
    } catch (error) {
        console.error("GET /api/cart error:", error);
        res.status(500).json({message: "Error interno"});
    }
   

})
router.put("/add", verifyToken, async(req: AuthRequest, res)=>{
    
    try {
    const user = await(coleccion().findOne({username: req.user}))
    let userId = new ObjectId;
    user ?  userId = user._id : new ObjectId();
   

    const { id, quantity } = req.body as { id: string, quantity: number };
    if (!id || !quantity || quantity <= 0) {
        return res.status(400).json({ message: "Datos inválidos" });
    }

    const producto = await coleccion1().findOne({_id: new ObjectId(id)})
    if(!producto){
        return res.status(404).json({ message: "el producto no existe" });
    }

    if(producto.stock < quantity){
        return res.status(400).json({  message:"Insufficient stock" });

    }
   
    
    const resultado = await coleccion1().updateOne(
        { _id: new ObjectId(id)},
        { $inc: { stock: -quantity } }    // restamos el stock
    );
   
    const carroUsu = await coleccion2().findOne({userId})

    carroUsu?.items.push({quantity: quantity, idProducto:  new ObjectId(id)});
    
    res.json({ message: "Stock actualizado correctamente", cart: resultado });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar stock" });
    }
    

})







export default router;