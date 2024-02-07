const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// linguaJoyUser
// middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://linguaJoyUser:linguaJoyUser@cluster0.onldf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/", (req, res) => {
  res.send("lingua joy is runninngggggg");
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db("LinguaJoy").collection("users");
    const coursesCollection = client.db("LinguaJoy").collection("courses");
    const cartCollection = client.db("LinguaJoy").collection("carts");
    const enrolledCoursesCollection = client
      .db("LinguaJoy")
      .collection("enrolledCourses");

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const query = { userEmail: user.userEmail };
      const existingUser = await usersCollection.findOne(query);
      console.log("existingUser:", existingUser);
      if (existingUser) {
        return res.send({ message: "user already exists" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          userRole: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch("/users/instructor/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          userRole: "insturctor",
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/courses", async (req, res) => {
      const result = await coursesCollection.find().toArray();
      res.send(result);
    });

    app.get("/courses/:id", async (req, res) => {
      const courseId = req.params.id;
      const query = { _id: new ObjectId(courseId) };
      const result = await coursesCollection.findOne(query);
      res.send(result);
    });

    app.get("/courses", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      if (!email) {
        res.send([]);
      }
      const query = { userEmail: email };
      // console.log(query)
      const result = await cartCollection.find(query).toArray();
      // console.log(result)
      res.send(result);
    });

    app.post("/courses", async (req, res) => {
      const course = req.body;
      // console.log(course);
      const result = await coursesCollection.insertOne(course);
      res.send(result);
    });

    app.patch("/courses/approved/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          courseStatus: `approved`,
        },
      };
      const result = await coursesCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch("/courses/denied/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          courseStatus: `denied`,
        },
      };
      const result = await coursesCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch("/courses/updated/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      // Retrieve the current course document
      const currentCourse = await coursesCollection.findOne(filter);

      // Check if the course exists
      if (!currentCourse) {
        return res.status(404).send("Course not found");
      }
      // Calculate updated values
      const updatedAvailableSeat = currentCourse.availableSeat - 1;
      const updatedTotalStudent = currentCourse.totalStudent + 1;

      const updateDoc = {
        $set: {
          availableSeat: updatedAvailableSeat,
          totalStudent: updatedTotalStudent,
        },
      };
      const result = await coursesCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // -------------all favourate course of the learner will be added here for further process ----------------------
    app.get("/carts", async (req, res) => {
      const email = req.query.email;
      // console.log(email);
      if (!email) {
        res.send([]);
      }
      const query = { userEmail: email };
      // console.log(query)
      const result = await cartCollection.find(query).toArray();
      // console.log(result)
      res.send(result);
    });

    app.get("/carts/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.findOne(query);
      // console.log(result)
      res.send(result);
    });

    app.post("/carts", async (req, res) => {
      const course = req.body;
      console.log(course);
      const result = await cartCollection.insertOne(course);
      res.send(result);
    });

    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id)
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      // console.log(result)
      res.send(result);
    });

    app.get("/enrolledCourses", async (req, res) => {
      const email = req.query.email;
      // console.log(email);
      if (!email) {
        res.send([]);
      }
      const query = { userEmail: email };
      // console.log(query)
      const result = await cartCollection.find(query).toArray();
      // console.log(result)
      res.send(result);
    });

    app.post("/enrolledCourses", async (req, res) => {
      const course = req.body;
      // console.log(course);
      const result = await enrolledCoursesCollection.insertOne(course);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("listening to port", port);
});
