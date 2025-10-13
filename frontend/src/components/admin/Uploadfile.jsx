import React, { useState } from "react";
import { toast } from "react-toastify";
import Resize from "react-image-file-resizer";
import { uploadFiles, removeFiles } from "../../api/product";
import useEcomStore from "../../store/EcomStore";
import { Loader } from "lucide-react";

const Uploadfile = ({ values, setValues }) => {
  const token = useEcomStore((state) => state.token);
  const [isLoading, setIsLoading] = useState(false);

  const images = Array.isArray(values?.images) ? values.images : []; // กัน null

  const handleOnChange = (e) => {
    const files = e.target.files;
    if (files) {
      setIsLoading(true);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) {
          toast.error(`File ${file.name} ไม่ใช่รูปภาพ`);
          continue;
        }

        Resize.imageFileResizer(
          file,
          720,
          720,
          "JPEG",
          100,
          0,
          (dataUrl) => {
            // dataUrl โดย lib นี้ปกติจะได้เป็น "data:image/jpeg;base64,...."
            // ส่งเป็น { image: dataUrl }
            uploadFiles(token, { image: dataUrl })
              .then((res) => {
                setValues((prev) => ({
                  ...prev,
                  images: [...(prev.images || []), res.data],
                }));
                toast.success(`อัปโหลด ${file.name} สำเร็จ`);
              })
              .catch((err) => console.log(err))
              .finally(() => setIsLoading(false));
          },
          "base64"
        );
      }
    }
  };

  const handleDelete = (public_id) => {
    removeFiles(token, public_id)
      .then((res) => {
        const filterImages = images.filter(
          (item) => item.public_id !== public_id
        );
        setValues({
          ...values,
          images: filterImages,
        });
        toast.info("ลบรูปเรียบร้อย");
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="my-4">
      <div className="flex mx-4 gap-4 my-4">
        {isLoading && <Loader className="w-16 h-16 animate-spin" />}
        {images.map((item, index) => (
          <div className="relative" key={index}>
            <img className="w-24 h-24 hover:scale-105 " src={item.url} />
            <span
              onClick={() => handleDelete(item.public_id)}
              className="absolute top-0 right-0 bg-red-500 p-1 rounded-md text-white cursor-pointer"
            >
              X
            </span>
          </div>
        ))}
      </div>
      <div>
        <input onChange={handleOnChange} type="file" name="images" multiple />
      </div>
    </div>
  );
};

export default Uploadfile;
