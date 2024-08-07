"use client";
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import LoadingType from "@/components/LoadingType";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { videos } from "../../videos";
import SignInForm from "@/components/SignInForm";
import { useSession, signIn } from "next-auth/react";
import BuyCredit from "@/components/BuyCredit";
import PaymentComponent from "@/components/PaymentComponent";

export default function Home() {
  const { data: session } = useSession();

  const [screenWidth, setScreenWidth] = useState(0);
  const [inputText, setInputText] = useState("");
  const [videoMuted, setVideoMuted] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>("");
  const [videoKey, setVideoKey] = useState(Date.now());
  const [creditCount, setCreditCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [fontSize, setFontSize] = useState("");
  const [inputFontSize, setInputFontSize] = useState("");
  const [videoURLs, setVideoURLs] = useState<(string | null)[]>([]);
  const videoRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const [showBuyCredit, setShowBuyCredit] = useState(false);
  const [inputWidth, setInputWidth] = useState(0);
  const [videoHeight, setVideoHight] = useState(0);
  const [inputHeight, setInputHeight] = useState(0);

  const [character, setCharacter] = useState("");
  //https://storage.googleapis.com/childrenstory-bucket/KAI30_small.mp4
  //"https://storage.googleapis.com/childrenstory-bucket/AVA30_GLITCH2.mp4"
  const kaiVideoUrl =
    "https://storage.googleapis.com/raygunbucket/KAI_BLINKS.mp4";
  const avaVideoUrl =
    "https://storage.googleapis.com/raygunbucket/AVA_BLINK.mp4";

  const image = { width: 1920, height: 970 };
  const target = { x: 1362, y: 150 };
  const targetMobile = { x: 1170, y: 115 };
  const targetInput = { x: 770, y: 760 };
  const targetInputMobile = { x: 860, y: 670 };
  const targetVideo = { x: 500, y: 200 };
  const [pointerCreditPosition, setPointerCreditPosition] = useState({
    top: 0,
    left: 0,
  });
  const [pointerInputPosition, setPointerInputPosition] = useState({
    top: 0,
    left: 0,
  });
  const [pointerVideoPosition, setPointerVideoPosition] = useState({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    const updatePointer = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      let xScale = windowWidth / image.width;
      let yScale = windowHeight / image.height;
      let scale,
        yOffset = 0,
        xOffset = 0;

      if (xScale > yScale) {
        scale = xScale;
        yOffset = (windowHeight - image.height * scale) / 2;
      } else {
        scale = yScale;
        xOffset = (windowWidth - image.width * scale) / 2;
      }

      setPointerCreditPosition({
        top:
          windowWidth >= 768
            ? target.y * scale + yOffset
            : targetMobile.y * scale + yOffset,
        left:
          windowWidth >= 768
            ? target.x * scale + xOffset
            : targetMobile.x * scale + xOffset,
      });

      setPointerInputPosition({
        top:
          windowWidth >= 768
            ? targetInput.y * scale + yOffset
            : targetInputMobile.y * scale + yOffset,
        left:
          windowWidth >= 768
            ? targetInput.x * scale + xOffset
            : targetInputMobile.x * scale + xOffset,
      });

      setPointerVideoPosition({
        top: targetVideo.y * scale + yOffset,
        left: targetVideo.x * scale + xOffset,
      });
      if (windowWidth > 768) {
        setInputWidth(430 * scale + yOffset);
      } else {
        setInputWidth(215 * scale + yOffset);
      }
    };

    updatePointer();
    window.addEventListener("resize", updatePointer);

    return () => window.removeEventListener("resize", updatePointer);
  }, []);
  useEffect(() => {
    setCharacter(Math.floor(Math.random() * 2) + 1 === 1 ? "AVA" : "KAI");

    function handleResize() {
      const windowWidth = window.innerWidth;
      const newFontSize = `${
        (windowWidth >= 768
          ? window.innerHeight * 35
          : window.innerHeight * 25) / 930
      }px`;
      const newInputFontSize = `${
        (windowWidth >= 768
          ? window.innerHeight * 25
          : window.innerHeight * 20) / 930
      }px`;
      setFontSize(newFontSize);
      setInputFontSize(newInputFontSize);
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (character === "KAI") {
      setVideoUrl(kaiVideoUrl);
      setVideoKey(Date.now());
    } else if (character === "AVA") {
      setVideoUrl(avaVideoUrl);
      setVideoKey(Date.now());
    }
  }, [character]);

  useEffect(() => {
    handleCredit();
    const fetchData = async function () {
      const res = await fetch("/api/videoData", {
        method: "POST",
      });
      const body = await res.json();
      const urls = body.urls;
      setVideoURLs(urls);
    };
    fetchData();
    getCredit();
  }, []);
  useEffect(() => {
    setTimeout(() => {
      setVideoMuted(false);
    }, 2000);
  }, []);

  useEffect(() => {
    if (isLoading) {
      setVideoUrl(videoURLs[Math.floor(Math.random() * 19)]);
      setVideoKey(Date.now());
    }
  }, [isLoading]);

  const handleClick = async function () {
    setIsLoading(true);
    const res = await fetch("/api/voice", {
      method: "POST",
      body: JSON.stringify({ inputText: inputText, character: character }),
    });
    const text = await res.text();
    console.log("text:" + text);
    setIsLoading(false);
    setVideoUrl(text);
    setVideoKey(Date.now());
  };

  const decrementCredit = async function () {
    setCreditCount(creditCount - 1);
    const res = await fetch("/api/useCredit", {
      method: "POST",
      body: JSON.stringify({ userId: session?.user?.id }),
    });
  };
  const handleSubmit = async () => {
    if (!session) {
      setShowForm(true);
    } else {
      if (creditCount > 0) {
        setCreditCount(creditCount - 1);
        await handleClick();
        setInputText("");
        await decrementCredit();
      } else {
        setShowBuyCredit(true);
      }
    }
  };
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      await handleSubmit();
    }
  };
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize(); // Get the initial screen width
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleVideoEnd = () => {
    if (character === "AVA") {
      setVideoUrl(avaVideoUrl);
      setVideoKey(Date.now());
    } else if (character === "KAI") {
      setVideoUrl(kaiVideoUrl);
      setVideoKey(Date.now());
    }
  };

  const dbHandle = async function () {
    const res = await fetch("/api/addUser", {
      method: "POST",
      body: JSON.stringify({}),
    });
    console.log("ok");
  };

  const getCredit = async function () {
    if (session?.user) {
      console.log(session.user);

      const res = await fetch("/api/getCredit", {
        method: "POST",
        body: JSON.stringify({
          userId: session?.user.id,
        }),
      });
      const resJSON = await res.json();
      const credit = resJSON.credit;
      setCreditCount(credit);
    } else {
      console.log("not logged in");
    }
  };
  const handleCredit = async function () {
    if (session?.user) {
      console.log(session.user);

      const res = await fetch("/api/createCredit", {
        method: "POST",
        body: JSON.stringify({
          userId: session?.user.id,
        }),
      });
    } else {
      console.log("not logged in");
    }
  };
  const handleVoice = async function () {
    const res = await fetch("/api/voice", {
      method: "POST",
    });
  };

  const addCredit = async function () {
    if (session?.user) {
      const res = await fetch("/api/addCredit", {
        method: "POST",
        body: JSON.stringify({ userId: session?.user?.id }),
      });
    }
  };

  return (
    <div className="relative bg-black h-screen w-full">
      <button
        className="absolute z-20 bg-transparent text-transparent top-0"
        style={{
          width: screenWidth >= 768 ? "calc(1/18 * 100%)" : "calc(2/18 * 100%)",
          height:
            screenWidth >= 768 ? "calc(1/18 * 100%)" : "calc(1/36 * 100%)",
          top: `${
            screenWidth >= 768 ? "calc(116/400 * 100%)" : "calc(73/400 * 100%)"
          }`,
          right: `${
            screenWidth >= 768 ? "calc(102/400 * 100%)" : "calc(10/400 * 100%)"
          }`,
        }}
        onClick={() => {
          setCreditCount(creditCount + 10);
          //addCredit();
          //setCreditCount(creditCount + 1);
          if (session) {
            setShowBuyCredit(true);
          } else {
            setShowForm(true);
          }
        }}
      >
        token
      </button>
      <div className="relative w-full h-screen">
        {!isLoading ? (
          <form onSubmit={handleSubmit}>
            <textarea
              placeholder={`${session ? "ASK A QUESTION" : "ASK A QUESTION"}`}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              style={{
                height: `${
                  screenWidth >= 768 ? "calc(1/9 * 100%)" : "calc(1/4*100%)"
                } `,
                top: `${pointerInputPosition.top}px`,
                left: `${pointerInputPosition.left}px`,
                //width: "calc(22/100 * 100%)",
                width: `${inputWidth}px`,
                fontSize: `${inputFontSize}`,
              }}
              className="absolute top-3/4 -translate-y-2/3 tracking-widest bg-transparent border-none outline-none focus:border-none focus:outline-none text-white z-30 resize-none overflow-hidden"
            />
          </form>
        ) : (
          <LoadingType
            character={character}
            pointerInputPosition={pointerInputPosition}
            screenWidth={screenWidth}
          />
        )}
        <LazyLoadImage
          className={`z-10 absolute top-0 left-0 h-full ${
            screenWidth > 768 ? "w-full" : ""
          } object-cover`}
          src={
            screenWidth > 768
              ? `/FINAL_SPACESHIP.png`
              : `/SPACESHIP_MOBILE_BACKGROUND.png`
          }
          alt="background"
          style={{ objectFit: "cover" }}
        />

        {videoUrl && !videoURLs.includes(videoUrl) ? (
          <div
            className="z-0 absolute flex justify-center aspect-[16/9]"
            style={{
              top: `${
                screenWidth > 768
                  ? "calc(105/800 * 100%)"
                  : "calc(115/800 * 100%)"
              } `,
              height: `${
                screenWidth > 768
                  ? "calc(115/300 * 100%)"
                  : "calc(55/300 * 100%)"
              } `,
              left: "calc(101/200 * 100%)",
              transform: "translate(-50%)",
            }}
          >
            <video
              ref={videoRef}
              key={videoKey}
              muted={videoMuted}
              className={`h-full w-full `}
              autoPlay
              playsInline
              loop={videoUrl === avaVideoUrl || videoUrl === kaiVideoUrl}
              preload="none"
              onEnded={handleVideoEnd}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          ""
        )}
        {videoUrl && videoURLs.includes(videoUrl) ? (
          <div
            className="z-0 absolute left-1/2 -translate-x-1/2 flex justify-center aspect-[16/9]"
            style={{
              top: `${
                screenWidth > 768
                  ? "calc(102/800 * 100%)"
                  : "calc(85/800 * 100%)"
              } `,
              height: `${
                screenWidth > 768
                  ? "calc(115/300 * 100%)"
                  : "calc(55/300 * 100%)"
              } `,
              left: "calc(102/200 * 100%)",
              transform: "translate(-50%)",
            }}
          >
            <video
              ref={videoRef}
              key={videoKey}
              muted={videoMuted}
              className={`h-full w-full`}
              autoPlay
              playsInline
              loop={videoUrl === avaVideoUrl || videoUrl === kaiVideoUrl}
              preload="none"
              onEnded={handleVideoEnd}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          ""
        )}
      </div>
      <div>
        {fontSize ? (
          <p
            className="z-20 absolute flex justify-center mb-8 text-red-600"
            style={{
              top: `${pointerCreditPosition.top}px`,
              left: `${pointerCreditPosition.left}px`,
              fontSize: fontSize,
            }}
          >
            {creditCount > 9 ? creditCount : `0${creditCount}`}
          </p>
        ) : (
          ""
        )}
      </div>
      {showForm && <SignInForm showForm={showForm} setShowForm={setShowForm} />}
      {showBuyCredit && (
        <BuyCredit
          showBuyCredit={showBuyCredit}
          setShowBuyCredit={setShowBuyCredit}
          creditCount={creditCount}
          setCreditCount={setCreditCount}
        />
      )}
    </div>
  );
}
