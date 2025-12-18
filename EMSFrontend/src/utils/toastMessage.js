import toast from "react-hot-toast";

export const successToast = (message) => {
  toast.success(message, {
    duration: 3000,
    position: "top-right",
    style: {
      background: "#4BB543",
      color: "white",
      fontSize: "16px",
      padding: "10px 15px",
      borderRadius: "10px",
    },
  });
};

export const errorToast = (message) => {
  toast.error(message, {
    duration: 3000,
    position: "top-right",
    style: {
      background: "#FF4B4B",
      color: "white",
      fontSize: "16px",
      padding: "10px 15px",
      borderRadius: "10px",
    },
  });
};
