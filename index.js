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

function verifyJWT(req, res, next) {
    //console.log('token',req.headers.authorization);//client theke token peyec by localsorage getItems myAppointmrnt
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_SECRECT_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    });
}



async function run() {
    try {
        const productsCollection = client.db('resellmarket').collection('sellerproducts');
        const categoryCollection = client.db('resellmarket').collection('category');
        const sellersCollection = client.db('resellmarket').collection('sellers');
        const buyersCollection = client.db('resellmarket').collection('buyers');
        const bookingCollection = client.db('resellmarket').collection('bookings');
        const advitageCollection = client.db('resellmarket').collection('advitise');
        const paymentCollection = client.db('resellmarket').collection('payments');
        const repotedproductCollection= client.db('resellmarket').collection('repotedproduct');

        // const verifyAdmin = async( req,res,next)=>{
        //     const decodedEmail = req.decoded.email;
        //     const query = {email: decodedEmail};
        //     const user = await sellersCollection.findOne(query);
        //     if (user?.role !== 'admin') {
        //         return res.status(403).send({ message: 'forbidden access' })
        //     }
        //     next()
        // }


        app.get('/jwt', async (req, res) => {//jokhn user reg thakbe tokhn jwt pabo
            const email = req.query.email;//search email in client
            const query = { email: email };//
            const user = await sellersCollection.findOne(query);//check this user avalable by email 
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_SECRECT_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: '' })
        })
        
        app.post('/jwt', (req, res) =>{
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_SECRECT_TOKEN, { expiresIn: '1d'})
            res.send({token})
        })  
 

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

        app.delete('/addproducts/:id',async(req,res)=>{
            const id= req.params.id;
            const query={_id:ObjectId(id)};
            const result=await productsCollection.deleteOne(query);
            res.send(result);
        })

      
        app.delete('/deletebookingproduct/:id',async(req,res)=>{
            const id= req.params.id;
            const query={_id:ObjectId(id)};
            const result=await productsCollection.deleteOne(query);
            res.send(result);
        })

        app.post('/repotedproduct/:id',async(req,res)=>{
            const repotedproduct=req.body;
           
            const result= await repotedproductCollection.insertOne(repotedproduct);
            res.send(result);
        })
        app.get('/repotedproduct',async(req,res)=>{
            const query={};
            const result=await repotedproductCollection.find(query).toArray();
            res.send(result);
        });
        app.delete('/repotedproduct/:id',async(req,res)=>{
            const id= req.params.id;
            const query= {_id:id};
            const result = await repotedproductCollection.deleteOne(query);
            console.log(result)
            res.send(result)
        });
      
//advitice
        app.post('/advitiseproduct/:id',async(req,res)=>{
            const advitiseproduct=req.body;
           
            const result= await advitageCollection.insertOne(advitiseproduct);
            res.send(result);
        })
        app.get('/advitiseproduct',async(req,res)=>{
            const query={};
            const result=await advitageCollection.find(query).toArray();
            res.send(result);
        });
        app.delete('/advitis/:id',async(req,res)=>{
            const id= req.params.id;
            const query= {_id:id};
            const result = await advitageCollection.deleteOne(query);
            console.log(result)
            res.send(result)
        });

//


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
      


        app.delete('/seller/:id',async(req,res)=>{
            const id= req.params.id;
            const deletedId= {_id:ObjectId(id)};
            const result = await sellersCollection.deleteOne(deletedId);
            res.send(result)
          })
       
        app.get('/allbuyers',verifyJWT,async(req,res)=>{
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
       // booking
        app.post('/bookings',async(req,res)=>{
            const addbookings=req.body;
            const result= await bookingCollection.insertOne(addbookings);
            res.send(result);
        })
       
     
        //get buyer info ,BuyerEmail:1,Image:1,Location:1,BookingDate:1,product:1
        app.get('/buyersinfo',verifyJWT,async(req,res)=>{
            const email =req.query.email;
           
            const decodedEmail = req.decoded.email;
        
            if(email !== decodedEmail){
                return res.status(403).send({ message: 'forbidden access' })
            }
            const query= { SellersEmail:email };
           
            const result=await bookingCollection.find(query).toArray();
            res.send(result);
            // const query= {};
            // const result=await bookingCollection.find(query).project({Buyer:1,BuyerEmail:1,BookingDate:1,product:1,Location:1,BuyerPhone:1,Image:1}).toArray();
            // res.send(result);
        });
        app.get('/myordersbookings/:id',async(req,res)=>{
            const id = req.params.id;
            const query= {_id:ObjectId(id)}
            const result=await bookingCollection.findOne(query);
            res.send(result);
        });
//2 admin check with decoded email
        app.put('/sellers/admin/:id',verifyJWT, async (req, res) => {
           const decodedEmail =req.decoded.email;
           const query = {email:decodedEmail};
           const seller = await sellersCollection.findOne(query);
           if (seller?.role !== 'admin') {
            return res.status(403).send({ message: 'forbidden access' })
        }
       
           //1 jkue admin banate prbe
            const id =req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await sellersCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
            //
        })
         //3 admin ki na check korbo//goto hook,4 then go to routh protection admin routh
         app.get('/sellers/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const seller = await sellersCollection.findOne(query);
            res.send({ isAdmin: seller?.role === 'admin' });
        })
//now working
        //2
        //seller check with decoded email
        app.put('/sellers/seller/:id',verifyJWT, async (req, res) => {
            const decodedEmail =req.decoded.email;
            const query = {email:decodedEmail};
            const seller = await sellersCollection.findOne(query);
            if (seller?.role !== 'admin') {
             return res.status(403).send({ message: 'forbidden access' })
         }
        
            // return res.status(403).send({ message: 'forbidden access' })
        
        
            //1 jkue seller banate prbe
             const id =req.params.id;
             const filter = { _id:ObjectId(id) }
             const options = { upsert: true };
             const updatedDoc = {
                 $set: {
                     roles: 'seller'
                 }
             }
           
             const result = await sellersCollection.updateOne(filter, updatedDoc, options);
           
             res.send(result)
             //
            
         })
        
         //3 seller ki na check korbo//goto hook,4 then go to routh protection seller routh
         app.get('/sellers/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const seller = await sellersCollection.findOne(query);
            res.send({ isSeller: seller?.roles === 'seller' });
        })
        //real
        app.get('/allsellers',async(req,res)=>{
            const query= {};
            const result=await sellersCollection.find(query).toArray();
            res.send(result);
        });
    //testing for login
        app.put('/allsellers',verifyJWT,async(req,res)=>{
            const email = req.query.email;
            const filter = { email: email }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    roles: 'seller'
                }
            }
            const seller=await sellersCollection.updateOne(filter, updatedDoc, options);
            res.send(seller);
        });
        
 //  all buyers for google login
 app.post('/buyers',async(req,res)=>{
    const addbuyers=req.body;
    const result= await buyersCollection.insertOne(addbuyers);
    res.send(result);
})

app.put('/allbuyers',async(req,res)=>{
    const email = req.query.email;
    const filter = { email: email }
    const options = { upsert: true };
    const updatedDoc = {
        $set: {
            roles: 'buyer'
        }
    }
    const buyer=await buyersCollection.updateOne(filter, updatedDoc, options);
    res.send(buyer);
});
 //3 buyer ki na check korbo//goto hook,4 then go to routh protection buyer routh
app.get('/buyer/buyer/:email', async (req, res) => {
    const email = req.params.email;
    const query = { email };
    const buyer = await buyersCollection.findOne(query);
    res.send({ isBuyer: buyer?.roles === 'buyer' });
})
// original
app.get('/myordersbookings',verifyJWT,async(req,res)=>{
   
    const email =req.query.email;
           
    const decodedEmail = req.decoded.email;

    if(email !== decodedEmail){
        return res.status(403).send({ message: 'forbidden access' })
    }
    const query= { BuyerEmail:email };
   
    const result=await bookingCollection.find(query).toArray();
    res.send(result);
   
 });
// Original : nirdisto seller email er jnno product paoa jabe
app.get('/addproducts',verifyJWT, async(req,res)=>{
    const email =req.query.email;
    const decodedEmail = req.decoded.email;

    if(email !== decodedEmail){
        return res.status(403).send({ message: 'forbidden access' })
    }
    const query= { selleremail:email };
    const result=await productsCollection.find(query).toArray();
    res.send(result);
});

// fake booking
app.get('/myordersbook/:id',async(req,res)=>{
 const id = req.params.id;
  const query ={productId:id}
    const buyer=await bookingCollection.findOne(query);
    res.send( buyer?.paid ===true);
})
// app.get('/myordersbook/:id',async(req,res)=>{
//     const id = req.params.id;
//      const query ={productId:id}
//        const buyer=await bookingCollection.findOne(query);
//        res.send( buyer?.paid ===true);
//    })

//fake myproduct
// app.get('/addpro', async(req,res)=>{
//     const id = req.params.id;
//     const query={};
//     const result=await productsCollection.find(query).toArray();

//     const booking = {productId:id};
//     const alreadybooked = await bookingCollection.find(booking).toArray();
//     if (alreadybooked?.paid === true) {
//         const bookingfind= await bookingCollection.find(booking).toArray();
//         result.forEach(option=>{
//             const bookingOption = bookingfind.filter(prod.productId===option.productid);
//             const remaining = option.filter(opt._id !== bookingOption)
//             option=remaining;
//         })
            
//     }
//     // const query = {productid:id};
//     // const result=await productsCollection.find(query).toArray();
//     res.send(result);
// });
        //payment 
       app.post('/create-payment-intent',async (req,res)=>{
         const productBooking =req.body;
         const price =productBooking.price;
         const productamount =price * 100;

         const paymentIntent = await stripe.paymentIntents.create({
            
            currency: "usd",
            amount: productamount,
            "payment_method_types":[
                 "card"
            ] 
            
          });
        
          res.send({
            clientSecret: paymentIntent.client_secret,
          });
        
       })
       app.post('/payments', async (req, res) =>{
        const payment = req.body;
        const result = await paymentCollection.insertOne(payment);
        const id = payment.bookingId
        const filter = {_id: ObjectId(id)}
        const updatedDoc = {
            $set: {
                paid: true,
                transactionId: payment.transactionId
            }
        }
        const updatedResult = await bookingCollection.updateOne(filter, updatedDoc)
        res.send(result);
      })
       
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