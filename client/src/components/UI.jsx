import { atom, useAtom } from "jotai";
import { useEffect, useState, useRef } from "react";
import { Chatbot } from "../components/Chatbot";
import { Quiz } from "../components/Quiz";

const pictures = [
  "1.png",
  "2.png",
  "3.png",
  "4.png",
  "5.png",
  "6.png",
  "7.png",
  "8.png",
];

export const pageAtom = atom(0);
export const bookOpenAtom = atom(false);
export const contentHoverAtom = atom(false);

// Nội dung cho từng trang - mỗi trang có thể có nhiều phần
const pageContents = {
  0: {
    title: "TƯ TƯỞNG HỒ CHÍ MINH VỀ ĐỘC LẬP DÂN TỘC VÀ CHỦ NGHĨA XÃ HỘI",
    sections: [
      {
        content:
          "Chào mừng bạn đến với cuốn sách về tư tưởng Hồ Chí Minh về độc lập dân tộc và chủ nghĩa xã hội.",
      },
    ],
  },
  1: {
    title: "Độc lập, tự do là quyền thiêng liêng, bất khả xâm phạm của tất cả các dân tộc",
    sections: [
      {
        content:
          "Độc lập, tự do là quyền thiêng liêng, bất khả xâm phạm của mọi dân tộc. Từ ngàn xưa, lịch sử Việt Nam gắn liền với truyền thống yêu nước và đấu tranh chống giặc ngoại xâm, thể hiện khát vọng có được nền độc lập và tự do cho nhân dân – một giá trị thiêng liêng mà Hồ Chí Minh luôn hiện thân.\n\n Năm 1919, nhân dịp các nước Đồng minh thắng trận trong Chiến tranh thế giới thứ nhất họp Hội nghị Vécxây (Pháp), thay mặt những người Việt Nam yêu nước, Hồ Chí Minh gửi Bản Yêu sách của nhân dân An Nam tới Hội nghị Vécxây, bao gồm 8 điểm với hai nội dung chính là đời quyền bình đẳng về mặt pháp lý và đòi các quyển tự do, dân chủ của người dân Đông Dương, Bản yêu sách không được Hội nghị chấp nhận nhưng qua sự kiện trên cho thấy lần đầu tiên, tư tưởng Hồ Chí Minh về quyền của các dân tộc thuộc địa mà trước hết là quyền bình đẳng và tự do đã hình thành, thể hiện tư tưởng về quyền dân tộc và quyền con người hình thành từ sớm. ",
      }
    ],
  },
  2: {
    title: "Độc lập dân tộc phải gắn liền với tự do, hạnh phúc của nhân dân",
    sections: [
      {
        content:
          " Theo Hồ Chí Minh, độc lập dân tộc phải gắn liền với tự do và hạnh phúc của nhân dân. Người đánh giá cao học thuyết Tam dân của Tôn Trung Sơn về dân tộc độc lập, dân quyền tự do và dân sinh hạnh phúc và khẳng định: dân tộc Việt Nam đương nhiên phải được tự do và bình đẳng về quyền lợi, đó là lẽ phải không ai chối cãi được. Trong Chánh cương vắn tắt của Đảng (1930), Hồ Chí Minh xác định mục tiêu cách mạng là làm cho nước Nam hoàn toàn độc lập, tiêu diệt mọi thứ áp bức, chia ruộng đất cho dân nghèo, bỏ sưu thuế, và bảo đảm quyền lợi lao động. ",
      },
      {
        content:
          " Sau thắng lợi Cách mạng Tháng Tám 1945, Người nhấn mạnh: Nước độc lập mà dân không hưởng hạnh phúc tự do, thì độc lập cũng chẳng có nghĩa lý gì và yêu cầu thực hiện ngay các quyền cơ bản cho dân: có ăn, có mặc, có chỗ ở và được học hành. Suốt đời hoạt động cách mạng, Hồ Chí Minh luôn coi độc lập gắn liền với tự do và hạnh phúc cho nhân dân, bộc bạch tâm huyết: Tôi chỉ có một sự ham muốn tột bậc là làm sao cho nước ta được hoàn toàn độc lập, dân ta được hoàn toàn tự do, đồng bào ai cũng có cơm ăn áo mặc, ai cũng được học hành.",
      },
    ],
  },
  3: {
    title: "Độc lập dân tộc phải là nền độc lập thật sự, hoàn toàn và triệt để",
    sections: [
      {
        content:
          "Theo Hồ Chí Minh, độc lập dân tộc phải là nền độc lập thật sự, hoàn toàn và triệt để, không thể chỉ là độc lập giả hiệu do thực dân, đế quốc tạo ra thông qua các chính phủ bù nhìn nhằm che đậy bản chất xâm lược và bóc lột. Người nhấn mạnh rằng nền độc lập mà nhân dân không có quyền tự quyết về ngoại giao, không có quân đội riêng, không có tài chính riêng… thì độc lập đó chẳng có ý nghĩa gì. Trên tinh thần này, ngay sau Cách mạng Tháng Tám, trong bối cảnh đất nước gặp nhiều khó khăn và thù trong giặc ngoài, Hồ Chí Minh cùng Chính phủ Việt Nam Dân chủ Cộng hòa đã sử dụng nhiều biện pháp, đặc biệt là ngoại giao, để bảo đảm nền độc lập thật sự của đất nước.",
      },
    ],
  },
  4: {
    title: "Độc lập dân tộc gắn liền với thống nhất và toàn vẹn lãnh thổ",
    sections: [
      {
        content:
          "Trong lịch sử, dân tộc Việt Nam luôn đối mặt với âm mưu xâm lược và chia cắt đất nước. Thực dân Pháp từng chia nước ta thành ba kỳ với chế độ cai trị riêng, sau Cách mạng Tháng Tám, miền Bắc bị quân Tưởng Giới Thạch chiếm đóng, miền Nam bị Pháp xâm lược, và Pháp còn đưa ra Nam Kỳ tự trị nhằm chia cắt đất nước. Trước thực trạng này, Hồ Chí Minh khẳng định: Đồng bào Nam Bộ là dân nước Việt Nam. Sông có thể cạn, núi có thể mòn, song chân lý đó không bao giờ thay đổi. \n\n   Sau Hiệp định Giơnevơ (1954), khi đất nước tạm thời chia cắt hai miền, Người vẫn kiên trì đấu tranh cho thống nhất, nhấn mạnh: Nước Việt Nam là một, dân tộc Việt Nam là một. Trong Di chúc, Hồ Chí Minh bày tỏ niềm tin tuyệt đối vào thắng lợi cách mạng, vào sự thống nhất Tổ quốc và sự sum họp của đồng bào Nam – Bắc. Có thể khẳng định rằng, tư tưởng độc lập dân tộc luôn gắn liền với thống nhất và toàn vẹn lãnh thổ là tư tưởng xuyên suốt trong cuộc đời hoạt động cách mạng của Hồ Chí Minh.",
      },
    ],
  },
};

export const pages = [
  {
    front: "HCM",
    back: pictures[0],
  },
];
for (let i = 1; i < pictures.length - 1; i += 2) {
  pages.push({
    front: pictures[i % pictures.length],
    back: pictures[(i + 1) % pictures.length],
  });
}

pages.push({
  front: pictures[pictures.length - 1],
  back: "Chủ Tịch Hồ Chí Minh",
});

// Component hiển thị nội dung trang với infinite scroll
const PageContent = ({ pageNumber, isOpen }) => {
  const content = pageContents[pageNumber] || pageContents[0];
  const [isMobile, setIsMobile] = useState(false);
  const [, setBookOpen] = useAtom(bookOpenAtom);
  const scrollRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset scroll position khi chuyển trang
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [pageNumber]);

  if (!isOpen) return null;

  const sections = content.sections || [];

  // Tạo nội dung liên tục cho infinite scroll
  const allContent = sections.map((section, index) => (
    <div key={index} className="mb-8 last:mb-0">
      <div className="text-base md:text-lg leading-relaxed break-words whitespace-pre-line">
        {section.content}
      </div>
      {index < sections.length - 1 && (
        <div className="my-6 w-full h-px bg-white/20"></div>
      )}
    </div>
  ));

  // Mobile layout: content ở dưới màn hình với scroll
    if (isMobile) {
    return (
        <div className="fixed bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-black/95 to-black/70 backdrop-blur-sm z-50 flex flex-col pointer-events-auto"
          onMouseEnter={() => setContentHover(true)}
          onMouseLeave={() => setContentHover(false)}
        >
        {/* Header với title và nút đóng */}
        <div className="flex-shrink-0 p-4 pb-2 border-b border-white/10">
          <div className="flex justify-between items-start gap-4">
            <h2 className="text-xl font-bold text-white break-words flex-1">
              {content.title}
            </h2>
            <button
              className="flex-shrink-0 bg-white/90 text-black px-3 py-1 rounded-full hover:bg-white transition-all duration-300 text-sm"
              onClick={() => setBookOpen(false)}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable content area */}
         <div 
          ref={scrollRef}
           className="flex-1 overflow-y-auto p-4 pt-2 mobile-scroll-container"
           onWheel={(e) => { e.stopPropagation(); }}
           onTouchStart={(e) => { e.stopPropagation(); }}
           onTouchMove={(e) => { e.stopPropagation(); }}
           onPointerDown={(e) => { e.stopPropagation(); }}
          style={{
            // Custom scrollbar cho mobile
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.3) transparent'
          }}
        >
          <div className="text-white">
            {allContent}
          </div>
        </div>
      </div>
    );
  }

  // Desktop layout: content ở bên phải với scroll
  return (
    <div className="fixed right-0 top-0 h-full w-[35vw] min-w-[350px] max-w-[90vw] bg-gradient-to-l from-black/90 to-black/40 backdrop-blur-sm z-50 pointer-events-auto flex flex-col"
      onMouseEnter={() => setContentHover(true)}
      onMouseLeave={() => setContentHover(false)}
    >
      <div className="text-white w-full flex-1 flex flex-col p-8 pt-14 pb-8">
        {/* Header với title và nút đóng */}
        <div className="flex-shrink-0 mb-6 relative">
          <button
            className="absolute top-0 right-0 bg-white/90 text-black px-3 py-2 rounded-full hover:bg-white transition-all duration-300 text-sm z-10"
            onClick={() => setBookOpen(false)}
          >
            ✕
          </button>
          <h2 className="text-3xl md:text-4xl font-bold text-left break-words pr-16">
            {content.title}
          </h2>
        </div>

        {/* Scrollable content area */}
         <div 
          ref={scrollRef}
           className="flex-1 overflow-y-auto pr-4 mobile-scroll-container"
           onWheel={(e) => { e.stopPropagation(); }}
           onWheelCapture={(e) => { e.stopPropagation(); }}
           onScroll={(e) => { e.stopPropagation(); }}
           onMouseEnter={() => { /* capture focus to ensure wheel goes here */ }}
           onTouchStart={(e) => { e.stopPropagation(); }}
           onTouchMove={(e) => { e.stopPropagation(); }}
           onPointerDown={(e) => { e.stopPropagation(); }}
          style={{
            // Custom scrollbar cho desktop
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.3) transparent'
          }}
        >
          <div className="text-left">
            {allContent}
          </div>
        </div>

      
      </div>
    </div>
  );
};

export const UI = () => {
  const [page, setPage] = useAtom(pageAtom);
  const [bookOpen, setBookOpen] = useAtom(bookOpenAtom);
  const [bgKey, setBgKey] = useState("1");
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  // Khởi tạo audio và enable sau user interaction
  useEffect(() => {
    const enableAudio = () => {
      setAudioEnabled(true);
      document.removeEventListener("click", enableAudio);
      document.removeEventListener("touchstart", enableAudio);
    };

    document.addEventListener("click", enableAudio);
    document.addEventListener("touchstart", enableAudio);

    return () => {
      document.removeEventListener("click", enableAudio);
      document.removeEventListener("touchstart", enableAudio);
    };
  }, []);

  useEffect(() => {
    if (!audioEnabled) return;

    const audio = new Audio("/audios/page-flip-01a.mp3");
    audio.volume = 0.3;

    const playAudio = async () => {
      try {
        await audio.play();
      } catch (error) {
        console.log("Audio play failed:", error.message);
      }
    };

    playAudio();
  }, [page, audioEnabled]);

  // Tự động scroll thanh trang để đưa trang hiện tại gần mép trái
  useEffect(() => {
    const container = document.getElementById("page-nav");
    if (!container) return;
    const buttons = container.querySelectorAll("button");
    const idx = Math.min(page, buttons.length - 1);
    const btn = buttons[idx];
    if (!btn) return;
    const offsetLeft = btn.offsetLeft;
    const bias = bookOpen ? 0.6 : 0.2; // khi mở content, đẩy mạnh về trái để lộ các trang sau
    const desired = Math.max(0, offsetLeft - container.clientWidth * bias);
    container.scrollTo({ left: desired, behavior: "smooth" });
  }, [page, bookOpen]);

  // Tự động mở sách khi click vào trang
  const handlePageClick = (pageNumber) => {
    setPage(pageNumber);
    setBookOpen(true);
  };

  return (
    <>
      {/* Video background */}
      {currentVideo && (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className={`fixed inset-0 w-full h-full object-cover z-[-1] transition-opacity duration-500 ${
            videoLoading ? "opacity-0" : "opacity-100"
          }`}
          onLoadStart={() => {
            console.log("Video loading:", currentVideo);
            setVideoLoading(true);
          }}
          onCanPlay={() => {
            console.log("Video can play:", currentVideo);
            setTimeout(() => setVideoLoading(false), 300);
          }}
          onError={(e) => {
            console.log("Video error:", e, currentVideo);
            setVideoLoading(false);
          }}
        >
          <source src={currentVideo} type="video/mp4" />
        </video>
      )}

      {/* Loading overlay */}
      {videoLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[-1] flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-lg mb-2">Đang tải video...</div>
            <div className="text-red-300 text-sm">
              Bạn có thể về lại Lăng Bác rồi qua map khác để tải video
            </div>
          </div>
        </div>
      )}

      <main className="pointer-events-none select-none z-10 fixed inset-0 flex justify-between flex-col overflow-x-hidden">
        <a className="pointer-events-auto mt-10 ml-10" href="">
          {/* Logo placeholder */}
        </a>
        
        {/* Top controls: Chatbot | Dropdown | Quiz */}
        <div className="pointer-events-auto fixed top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
          <button
            className="px-4 py-2 rounded-lg border border-white/40 bg-white/70 text-black backdrop-blur-md hover:bg-white/80 transition-colors"
            onClick={() => setChatbotOpen(true)}
          >
            Chatbot
          </button>
          <select
            className="px-3 py-2 rounded-lg border border-white/40 bg-white/80 text-black backdrop-blur-md text-sm md:text-base hover:bg-white/90 transition-colors"
            value={bgKey}
            onChange={(e) => {
              const value = e.target.value;
              setBgKey(value);
              const map = {
                1: "/textures/background.jpg",
                2: "/textures/backgroundVD1.mp4",
                3: "/textures/BackgroundVD2.mp4",
              };

              if (map[value].endsWith(".mp4")) {
                console.log("Setting video:", map[value]);
                setVideoLoading(true);
                setCurrentVideo(map[value]);
                document.documentElement.style.setProperty(
                  "--app-bg-image",
                  "none"
                );
              } else {
                console.log("Setting image:", map[value]);
                setVideoLoading(false);
                setCurrentVideo(null);
                document.documentElement.style.setProperty(
                  "--app-bg-image",
                  `url('${map[value]}')`
                );
              }
            }}
          >
            <option value="1">Lăng Bác</option>
            <option value="3">Sài Gòn</option>
          </select>
          <button
            className="px-4 py-2 rounded-lg border border-white/40 bg-white/70 text-black backdrop-blur-md hover:bg-white/80 transition-colors"
            onClick={() => setQuizOpen(true)}
          >
            Quiz
          </button>
        </div>

        {/* Page navigation */}
        <div className={`w-full overflow-x-auto pointer-events-auto flex ${bookOpen ? "justify-start" : "justify-center"} relative z-60 bg-gradient-to-t from-black/60 to-transparent`} style={{ paddingRight: bookOpen ? "35vw" : undefined }}>
          <div id="page-nav" className="overflow-x-auto flex items-center gap-2 md:gap-4 max-w-full p-2 md:p-10">
            {[...pages].map((_, index) => (
              <button
                key={index}
                className={`border-transparent hover:border-white transition-all duration-300 px-2 py-1 md:px-4 md:py-3 rounded-full text-xs md:text-lg uppercase shrink-0 border min-h-[44px] ${
                  index === page
                    ? "bg-white/90 text-black"
                    : "bg-black/30 text-white"
                }`}
                onClick={() => handlePageClick(index)}
              >
                {index === 0 ? "Mặt trước" : `Trang ${index}`}
              </button>
            ))}
            <button
              className={`border-transparent hover:border-white transition-all duration-300 px-2 py-1 md:px-4 md:py-3 rounded-full text-xs md:text-lg uppercase shrink-0 border min-h-[44px] ${
                page === pages.length
                  ? "bg-white/90 text-black"
                  : "bg-black/30 text-white"
              }`}
              onClick={() => handlePageClick(pages.length)}
            >
              Mặt sau
            </button>
          </div>
        </div>
      </main>

      {/* Hiển thị nội dung trang với infinite scroll */}
      <PageContent pageNumber={page} isOpen={bookOpen} />

      {/* Modals */}
      <Chatbot open={chatbotOpen} onClose={() => setChatbotOpen(false)} />
      <Quiz open={quizOpen} onClose={() => setQuizOpen(false)} />
    </>
  );
};