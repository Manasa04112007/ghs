import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const API_URL = "/api/gallery";

const Gallery = () => {
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);

  const openModal = (item) => setSelectedMedia(item);
  const closeModal = () => setSelectedMedia(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await axios.get(API_URL);

        // Backend images only
        const items = res.data.map((media) => ({
          type: media.type || "image", // assumes backend sends type (image/video)
          src: media.image || media.video,
          title: media.caption || "Untitled",
        }));

        setGalleryItems(items);
      } catch (error) {
        console.error("❌ Error fetching gallery:", error);
      }
    };

    fetchGallery();
  }, []);

  return (
    <section className="bg-blue-100 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-slate-800 mb-10">
          Gallery
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {galleryItems.length === 0 && (
            <p className="text-center text-gray-700 col-span-3">
              No media available.
            </p>
          )}

          {galleryItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="relative bg-white border border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300 cursor-pointer"
              onClick={() => openModal(item)}
            >
              {item.type === "image" ? (
                <>
                  <img
                    src={item.src}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="px-3 py-2 text-sm font-semibold text-center text-gray-700">
                    {item.title}
                  </div>
                </>
              ) : (
                <div className="relative">
                  <video
                    src={item.src}
                    className="w-full h-48 object-cover"
                    muted
                    loop
                  />
                  <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm font-semibold hover:bg-opacity-70 transition">
                    ▶ Play Video
                  </button>
                  <div className="px-3 py-2 text-sm font-semibold text-center text-gray-700">
                    {item.title}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="relative max-w-4xl w-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-white text-3xl font-bold hover:text-red-400"
            >
              &times;
            </button>

            {selectedMedia.type === "image" ? (
              <img
                src={selectedMedia.src}
                alt={selectedMedia.title}
                className="w-full max-h-[80vh] object-contain rounded-md"
              />
            ) : (
              <video
                src={selectedMedia.src}
                controls
                autoPlay
                className="w-full max-h-[80vh] rounded-md"
              />
            )}
            <p className="text-center text-white mt-4 text-lg font-semibold">
              {selectedMedia.title}
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Gallery;
