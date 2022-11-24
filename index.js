const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app=express();
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d6f547g.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


app.get('/',(req,res)=>{
    res.send('hlw from server')
})

app.listen(port,()=>{
    console.log(`server is running on port at ${port}`)
})