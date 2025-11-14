import {Router} from "express";
import dotenv from "dotenv";
import {getDB} from "../mongo"
import { Collection, ObjectId } from "mongodb";
import {Producto, Carts, User } from "./types"
import {AuthRequest, verifyToken} from "../middleware/verifyToken"
dotenv.config();

const router = Router();

const coleccion = () => getDB().collection<User>("users"); 
const coleccion1 = () => getDB().collection<Producto>("Products"); 
const coleccion2 = () => getDB().collection<Carts>("Carts"); 


type UserJwt = {
    id: string,
    email:string
}

router.get("/", verifyToken, async(req: AuthRequest, res)=>{
    try {
    const usuario = req.user as UserJwt
    const userId = new ObjectId(usuario.id);

    const carts= await coleccion2();
    const cart = await(carts.findOne({userId}))

    res.status(200).json({cart})
        
    } catch (error) {
        console.error("GET /api/cart error:", error);
        res.status(500).json({message: "Error interno"});
    }
   

})
router.put("/add", verifyToken, async(req: AuthRequest, res)=>{
    
    try {
    const usuario = req.user as UserJwt
    const userId = new ObjectId(usuario.id);
    
    if((!req.body.id && !req.body.quantity) || typeof(req.body) !== "object"){
        return res.status(400).json({ message: "Invalid JSON body" });
    }
    

    const { id, quantity } = req.body as { id: string, quantity: number };
    if (!id || !quantity || quantity <= 0) {
        return res.status(400).json({ message: "Datos inválidos" });
    }

    const producto = await coleccion1().findOne({_id: new ObjectId(id)})
    if(!producto){
        return res.status(400).json({ message: "Product not found" });
    }

    if(producto.stock < quantity){
        return res.status(400).json({  message:"Insufficient stock" });

    }
   
    
    const resultado = await coleccion1().updateOne(
        { _id: new ObjectId(id)},
        { $inc: { stock: -quantity } }    // restamos el stock
    );
   
   
    let carrito = await coleccion2().findOne({ userId });
        if(!carrito){
            const carritos = {
                _id: new ObjectId,
                userId: userId,
                items: []
            }
            await coleccion2().insertOne(carritos)
        }
        await coleccion2().updateOne({ userId }, { $push: { items: { idProducto: new ObjectId(id), quantity } } });
    
    res.json({ message: "Stock actualizado correctamente", cart: resultado });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar stock y el carrito" });
    }
    

})









export default router;