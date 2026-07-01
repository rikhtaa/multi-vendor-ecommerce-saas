import { products } from "@prisma/client";

export const preProcessData =(userId: string, userActions:any, products:products)=> {
    const interactions:any =[]

    userActions.forEach((action:any) => {
        interactions.push({
            userId: userId,
            productId: action.productId,
            actionType: action.action,
        })
    });

    return {interactions, products}
}