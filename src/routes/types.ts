
import {ObjectId, WithId} from "mongodb"

export type Producto = {
    _id?: ObjectId,
name: String, 
description?: String, 
price: Number, 
stock: number,
createdAt: Date 
}
export type Item = {
    quantity: number,
    idProducto: ObjectId
}
export type Carts = {
    _id: ObjectId
userId: ObjectId, //(referencia a users), único por usuario
items: Item[]
    //Array de objetos 
}

export type User = {
    _id?: ObjectId ,//(auto‑generado)
username: string, //único, requerido
email: string, //único, requerido, formato email válido
passwordHash: string, //(hash bcrypt)
createdAt: Date //(default)
}
export type JwtPayload = {
    id: string;
    email: string;
}