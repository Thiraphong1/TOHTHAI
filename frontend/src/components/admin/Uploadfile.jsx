// Uploadfile.jsx (แบบที่แก้ไขแล้ว)
import React, { useState } from "react";
import { toast } from "react-toastify";
import Resize from "react-image-file-resizer";
import { uploadFiles, removeFiles } from "../../api/product";
import useEcomStore from "../../store/EcomStore";
import { Loader } from "lucide-react";

const Uploadfile = ({ values, setValues }) => { // setValues ในที่นี้คือ handleImageChange
  const token = useEcomStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);

  const images = Array.isArray(values?.images) ? values.images : [];

  const handleOnChange = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    const uploadPromises = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} ไม่ใช่รูปภาพ`);
        continue;
      }

      const uploadPromise = new Promise((resolve, reject) => {
        Resize.imageFileResizer(
          file, 720, 720, "JPEG", 100, 0,
          (dataUrl) => {
            uploadFiles(token, { image: dataUrl })
              .then(res => resolve(res.data))
              .catch(err => reject(err));
          },
          "base64"
        );
      });
      uploadPromises.push(uploadPromise);
    }
    
    Promise.all(uploadPromises)
      .then(newlyUploadedImages => {
        // ✅ ถูกต้อง: "โทรหาแม่" โดยส่งข้อมูล Array รูปภาพชุดใหม่ (เก่า+ใหม่) ไปให้
        const updatedImages = [...images, ...newlyUploadedImages];
        setValues(updatedImages);
        toast.success(`อัปโหลด ${newlyUploadedImages.length} รูปสำเร็จ`);
      })
      .catch(err => {
        console.log("Upload error:", err);
        toast.error("เกิดข้อผิดพลาดในการอัปโหลดบางไฟล์");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDelete = (public_id) => {
    removeFiles(token, public_id)
      .then(() => {
        // ✅ ถูกต้อง: "โทรหาแม่" โดยส่งข้อมูล Array รูปภาพที่กรองแล้วไปให้
        const filteredImages = images.filter((item) => item.public_id !== public_id);
        setValues(filteredImages);
        toast.info("ลบรูปเรียบร้อย");
      })
      .catch((err) => {
        console.log("Delete error:", err);
        toast.error("เกิดข้อผิดพลาดในการลบรูป");
      });
  };

  return (
    <div className="my-4">
      <div className="flex flex-wrap mx-4 gap-4 my-4 min-h-[112px]">
        {isLoading && <Loader className="w-24 h-24 animate-spin text-blue-500" />}
        {images.map((item) => (
          <div className="relative" key={item.public_id}>
            <img className="w-24 h-24 object-cover rounded-md shadow-md" src={item.url} alt="product"/>
            <span
              onClick={() => handleDelete(item.public_id)}
              className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 flex items-center justify-center rounded-full cursor-pointer hover:bg-red-700 transition-colors"
            >
              X
            </span>
          </div>
        ))}
      </div>
      <div>
        <input onChange={handleOnChange} type="file" name="images" multiple accept="image/*" />
      </div>
    </div>
  );
};

export default Uploadfile;