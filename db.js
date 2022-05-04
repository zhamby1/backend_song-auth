const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://sdev255:myclass2021@sdev255.oxluk.mongodb.net/musicdb?retryWrites=true&w=majority",
    {useNewUrlParser: true});

module.exports = mongoose;

