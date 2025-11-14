const mongoose = require("mongoose")


mongoose.connect("mongodb+srv://rmeet0450_db_user:8amVMFpnDh1M6iah@cluster0.yqcw0ml.mongodb.net/?appName=Cluster0  ")
.then(() => {
    console.log("connection success")
})
.catch(() => {
    console.log("connection failed")
})

 