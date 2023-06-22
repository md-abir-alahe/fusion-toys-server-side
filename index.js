const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lxz9tc9.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        client.connect((err) => {
            if (err) {
                console.error(err);
                return;
            }
        });


        const toysCollection = client.db('fusionToys').collection('toys');

        app.get('/toys', async (req, res) => {
            const limit = parseInt(req.query?.limit);
            const name = req.query?.search;
            console.log(name);
            if(name){
                const query = { toy_name: name };
                const result = await toysCollection.findOne(query);
                res.send(result);
            }else{
                const result = await toysCollection.find().limit(limit).toArray();
                res.send(result);
            }
            
            
        })

        app.get('/toys/:sub_category', async (req, res) => {
            const subCategory = req.params.sub_category;
            const query = { sub_category: subCategory };
            const options = {
                projection: { _id: 1, picture_url: 1, toy_name: 1, price: 1, rating: 1 },
            }
            const result = await toysCollection.find(query, options).toArray();
            res.send(result);
        })

        app.get('/toys/only/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query);
            res.send(result);
        })

        app.get('/my-toy', async (req, res) => {
            const email = req.query?.email;
            const query = { seller_email: email};
            const result = await toysCollection.find(query).toArray();
            res.send(result);

        })

        app.post('/add-a-toy', async (req, res) => {
            const newToy = req.body;
            const result = await toysCollection.insertOne(newToy);
            res.send(result);
        })

        app.patch('/update/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateToy = req.body;
            console.log(updateToy);
            const updateDoc = {
                $set: {
                    toy_name: updateToy.toy_name,
                    picture_url: updateToy.picture_url,
                    sub_category: updateToy.sub_category,
                    price: updateToy.price,
                    rating: updateToy.rating,
                    quantity: updateToy.quantity,
                    detail_description: updateToy.detail_description
                },
            };
            const result = await toysCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.deleteOne(query);
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('fusion toy is running');
})

app.listen(port, () => {
    console.log(`fusion toy server is running on port: ${port}`);
})