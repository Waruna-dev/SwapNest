import mongoose from "mongoose";

const itemPhotoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  filename: String,
  uploadAt: {
    type: Date,
    default: Date.now,
  },
});

//wht user B wants to give
const offeredItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    enum: ["like New", "Good", "Fair", "Poor"],
    required: true,
  },
  photos: [itemPhotoSchema],
  description: String,
});

const swapSchema = new mongoose.Schema({
  requestId: {                                      //autogenerate
    type: String,
    unique: true,
    required: true,
  },
  //wht user A is giving(get original item listning)
  requestedItem: {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",                                   //want to change
      require: true,
    },
    name: {
      type: String,
      required: true,
    },
    ownerName: {
      type: String,
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", //want to change
      required: true,
    },
    condition: {
      type: String,
      required: true,
    },
    description: String,
  },

  //the one making req(user B)- id & name
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
  },
  requesterName: {
    type: String,
    required: true,
  },

  // swap details
  swapType: {
    type: String,
    enum: ["item-for-item", "swap-with-cash"],
    required: true,
  },

  //for itemforitem swaps
  offeredItem: offeredItemSchema,

  //for swap with cash
  cashDetails: {
    amount: {
      type: Number,
      min: 0,
    },
    whoPays: {
      type: String,
      enum: ["i-pay-owner", "owner-pays-me"],
    },
  },

  //ms to owner
  messageToOwner: {
    type: String,
    maxLength: 500,
  },

  //agreement checkbox
  agreementAccepted: {
    type: Boolean,
    required: true,
    validate: {
      validator: function (v) {
        return v === true;
      },
      message: "You must accept the agreement terms",
    },
  },

  //status tracking
  status:{
    type:String,
    enum:["pending","accepted","rejected","completed","cancelled"],
    default:"pending",
  },

  //timestamps
  createdAt:{
    type:Date,
    default:Date.now,

  },
  updateAt:{
    type:Date,
    default:Date.now,
  },

  //complete details
  completedAt:Date,
  completionNotes:String,
});

  //update, updateAt timestamp before saving
  swapSchema.pre("save", function(next){
    this.updateAt=Date.now();
  });

  //gen reqid before validation
  swapSchema.pre("validate",function(next){
    if(!this.requestId){
        const date=new Date();
        const year=date.getFullYear().toString().slice(-2);
        const month=(date.getMonth()+1).toString().padStart(2,"0");
        const day=date.getDate().toString().padStart(2,"0");
        const random=Math.floor(Math.random()*10000).toString().padStart(2,"0")
        this.requestId=`SWP-${year}${month}${day}-${random}`;                        ///auto gen like (SWP-260215-1234)
    }
  });
const Swap = mongoose.model("Swap", swapSchema);

export default Swap;