export const CreateSuccess = (status,message,data)=>{
    const successObj ={
        status:status,
        message:message,
        data:data
    }
    return successObj;
}