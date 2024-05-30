import mongoose, {Schema} from 'mongoose';

const UserSchema = mongoose.Schema({
    firstName:{type: String, required:true},
    lastName:{type: String, required:true},
    userName:{type: String, required:true, unique:true},
    email:{type: String, required:true, unique:true},
    password:{type: String, required:true},
    profileImage:{type: String, required:false, default:'https://i.ibb.co/ZxPxcmz/q8dnpu0uk62s1t4pt6plve4gqd.png'},
    isAdmin:{type: Boolean, default:false},
    roles:{
        type: [Schema.Types.ObjectId],
        required: true,
        ref: "Role"
    }
},
{
    timestamps: true
})

export default mongoose.model("User", UserSchema)