import { toast } from "react-toastify";
export const generateError = (err) => {
    toast.error(err, {
        position: "top-right"
    })
}   
export const generateSuccess = (msg) => {
    toast.success(msg, {
        position: "top-right"
    })
}