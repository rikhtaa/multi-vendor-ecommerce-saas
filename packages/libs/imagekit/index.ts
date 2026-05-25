import ImageKit from "imagekit"

export const imagekit = new ImageKit({
    publicKey: process.env.IMAGE_PUBLIC_KEY!,
    privateKey: process.env.IMAGE_SECRET_KEY!,
    urlEndpoint: "https://ik.imagekit.io/rikhtamenahil/"

})

