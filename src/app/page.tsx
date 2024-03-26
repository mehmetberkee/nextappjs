"use client";
import { useState, useEffect, useRef } from "react";

import { Input } from "@/components/ui/input";
import LoadingType from "@/components/LoadingType";
export default function Home() {
  const [screenWidth, setScreenWidth] = useState(0);
  const [inputText, setInputText] = useState("");
  const [videoMuted, setVideoMuted] = useState(true);
  const [videoUrl, setVideoUrl] = useState(
    "https://storage.googleapis.com/childrenstory-bucket/AVA30_GLITCH2.mp4"
  );
  const [videoKey, setVideoKey] = useState(Date.now()); // Initial key
  const [creditCount, setCreditCount] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      setVideoMuted(false);
    }, 1000);
  }, []);

  useEffect(() => {
    if (isLoading) {
      setVideoUrl(
        "https://storage.googleapis.com/childrenstory-bucket/SKULL.mp4"
      );
      setVideoKey(Date.now());
    }
  }, [isLoading]);

  const handleClick = async function () {
    setIsLoading(true);
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ inputText: inputText }),
    });
    const text = await res.text();
    setIsLoading(false);
    setVideoUrl(text);
    setVideoKey(Date.now());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (creditCount > 0) {
      setCreditCount(creditCount - 1);
      await handleClick();
      setInputText("");
    }
  };

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize(); // Get the initial screen width
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleVideoEnd = () => {
    setVideoUrl(
      "https://storage.googleapis.com/childrenstory-bucket/AVA30_GLITCH2.mp4"
    );
    setVideoKey(Date.now()); // Video key'ini güncelleyerek videoyu yeniden yükleyin
  };
  return (
    <div className="relative bg-black h-screen w-full">
      <div className="relative w-full h-screen">
        {!isLoading ? (
          <form onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="ASK A QUESTION"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
              }}
              className="absolute top-2/3 -translate-y-2/3 left-1/2 tracking-widest text-xl -translate-x-1/2 bg-transparent border-none outline-none focus:border-none focus:outline-none text-white z-30 w-1/5"
            />
          </form>
        ) : (
          <LoadingType />
        )}
        <img
          className="z-10 absolute top-0 left-0 w-full h-full"
          src="/FINAL_SPACESHIP_SCREEN4.png"
          alt="background"
        />

        <div
          className="z-0 absolute left-1/2 -translate-x-1/2 flex justify-center mb-8"
          style={{ top: "calc(1/11 * 100%)" }}
        >
          <video
            ref={videoRef}
            key={videoKey}
            muted={videoMuted}
            className={`md:w-[450px] md:h-[300px] h-[200px] w-[1200px]`}
            autoPlay
            playsInline
            loop={
              videoUrl ===
                "https://storage.googleapis.com/childrenstory-bucket/AVA30_GLITCH2.mp4" ||
              videoUrl ===
                "https://storage.googleapis.com/childrenstory-bucket/SKULL.mp4"
            }
            preload="none"
            onEnded={handleVideoEnd}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
      <div>
        <p
          className="z-20 absolute -translate-x-1/2 flex justify-center mb-8 text-yellow-200 text-xl"
          style={{ right: "calc(404 / 1400 * 100%)", top: "calc(1/7 * 100%)" }}
        >
          {creditCount}
        </p>
      </div>
    </div>
  );
}
