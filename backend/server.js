require('dotenv').config({ path: '.env.local' });

const { MongoClient, Collection } = require('mongodb');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT;
const uri = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());

async function connectDB() {
  try {
    console.log(port,uri)
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await client.connect();
    console.log("Connected to MongoDB Atlas");

    const database = client.db(process.env.DB_NAME);
    const collection = database.collection('passwords');

    app.post('/api/backend/passwords', async (req, res) => {
      try {
        const { site, username, password } = req.body;

        if (!site || !username || !password) {
          return res.status(400).json({ error: "Missing site, username, or password in request body" });
        }

        const result = await collection.insertOne({ site, username, password });

        if (result.acknowledged) {
          console.log("Password saved in MongoDB:", result.insertedId);
          res.status(201).json({ message: "Password is saved", data: result.insertedId });
        } else {
          throw new Error("Failed to save password");
        }
      } catch (error) {
        console.error("Error saving password to MongoDB:", error);
        res.status(500).json({ error: "Failed to save password" });
      }
    });


    app.get('/api/backend/passwords', async (req, res) => {
      try {
        // Fetch all documents from the collection
        const cursor = await collection.find({}).toArray();
        
        // Send response with fetched documents
        res.status(200).json(cursor);
      } catch (error) {
        console.error("Error fetching passwords:", error);
        res.status(500).json({ error: "Failed to fetch passwords" });
      }
    });

    app.delete('/api/backend/passwords/delete', async (req, res) => {
      try {
        const { site, username, password } = req.body;
    
        const result = await collection.deleteOne({ site: site, username: username, password: password });
        console.log(result)
        if (result.deletedCount==1) {
          res.status(200).json({ message: "Password deleted successfully" });
        } else {
          res.status(404).json({ error: "Password not found" });
        }
      } catch (error) {
        console.error("Error deleting password:", error);
        res.status(500).json({ error: "Failed to delete password" });
      }
    });
    

    app.put('/api/backend/passwords/update', async (req, res) => {
      try {
        const {site, username, password } = req.body;
    
        // Validate the request body fields
        if (!site || !username || !password) {
          return res.status(400).json({ error: "Missing required fields for update" });
        }
    
        // Update document in MongoDB collection
        const filter = { _id: ObjectId(id) }; // Assuming id is MongoDB ObjectId
        const updateDoc = {
          $set: {
            site: site,
            username: username,
            password: password
          }
        };
    
        const result = await collection.updateOne(filter, updateDoc);
    
        if (result.modifiedCount === 1) {
          res.status(200).json({ message: "Password updated successfully" });
        } else {
          res.status(404).json({ error: "Password not found" });
        }
      } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ error: "Failed to update password" });
      }
    });
    
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });

  } catch (error) {
    console.error("Error connecting to MongoDB Atlas:", error);
    process.exit(1); // Exit process if unable to connect to MongoDB
  }
}

connectDB();
