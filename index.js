const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app=express();
const cors = require('cors');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d6f547g.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// function verifyJWT(req, res, next) {
//     //console.log('token',req.headers.authorization);//client theke token peyec by localsorage getItems myAppointmrnt
//     const authHeader = req.headers.authorization;
//     if (!authHeader) {
//         return res.status(401).send('unauthorized access');
//     }
//     const token = authHeader.split(' ')[1];

//     jwt.verify(token, process.env.ACCESS_SECRECT_TOKEN, function (err, decoded) {
//         if (err) {
//             return res.status(403).send({ message: 'forbidden access' })
//         }
//         req.decoded = decoded;
//         next();
//     });
// }


async function run() {
    try {
        const productsCollection = client.db('resellmarket').collection('sellerproducts');
        const categoryCollection = client.db('resellmarket').collection('category');
        const sellersCollection = client.db('resellmarket').collection('sellers');
        const buyersCollection = client.db('resellmarket').collection('buyers');
        const bookingCollection = client.db('resellmarket').collection('bookings');
         
        // category product
        app.get('/category',async(req,res)=>{
            const query= {};
            const result=await categoryCollection.find(query).toArray();
            res.send(result);
        });
        //added product
        app.post('/addproducts',async(req,res)=>{
            const addproduct=req.body;
            const result= await productsCollection.insertOne(addproduct);
            res.send(result);
        })
        app.get('/addproducts',async(req,res)=>{
            const query= {};
            const result=await productsCollection.find(query).toArray();
            res.send(result);
        });
    
        //add product by id
        app.get('/addproducts/:id',async(req,res)=>{
            const id= req.params.id;
            const query={categoryid:id};
            const result=await productsCollection.find(query).toArray();
            res.send(result);
        });
        app.post('/sellers',async(req,res)=>{
            const addseller=req.body;
            const result= await sellersCollection.insertOne(addseller);
            res.send(result);
        })
        app.get('/allsellers',async(req,res)=>{
            const query= {};
            const result=await sellersCollection.find(query).toArray();
            res.send(result);
        });

        app.delete('/seller/:id',async(req,res)=>{
            const id= req.params.id;
            const deletedId= {_id:ObjectId(id)};
            const result = await sellersCollection.deleteOne(deletedId);
            res.send(result)
          })
        //   buyers
        app.post('/buyers',async(req,res)=>{
            const addbuyers=req.body;
            const result= await buyersCollection.insertOne(addbuyers);
            res.send(result);
        })
        app.get('/allbuyers',async(req,res)=>{
            const query= {};
            const result=await buyersCollection.find(query).toArray();
            res.send(result);
        });

        app.delete('/buyers/:id',async(req,res)=>{
            const id= req.params.id;
            const deletedId= {_id:ObjectId(id)};
            const result = await buyersCollection.deleteOne(deletedId);
            res.send(result)
          })
        //booking
        app.post('/bookings',async(req,res)=>{
            const addbookings=req.body;
            const result= await bookingCollection.insertOne(addbookings);
            res.send(result);
        })
        app.get('/myordersbookings',async(req,res)=>{
            const query= {};
            const result=await bookingCollection.find(query).toArray();
            res.send(result);
        });


    }
    finally {

    }
}
run().catch(console.dir);

app.get('/',(req,res)=>{
    res.send('hlw from server')
})

app.listen(port,()=>{
    console.log(`server is running on port at ${port}`)
})