import { useEffect, useRef } from "react";
import "./Page.css";

const Page = ({
  A,
  B,
  handleSelect,
  isHolding,
  handleIsHolding,
  handleActivePage,
  handleSetPageWidth,
  index,
  noOfPages,
}) => {
  const pageRef = useRef(null);

  const hold = (page) => {
    console.log("hold");
    page.isHolding = true;
    page.style.zIndex = 50;
    handleActivePage(pageRef.current);
  };
  const release = (page, index, noOfPages) => {
    console.log("release");
    page.isHolding = false;
    if (page.isRight) {
      page.style.zIndex = noOfPages - index;
      page.style.transform = "scaleX(100%)";
    } else {
      page.style.transform = "scaleX(-100%)";
    }
    handleActivePage(null);
  };
  useEffect(() => {
    if (pageRef?.current) {
      const page = pageRef.current;
      page.isLeft = false;
      page.isRight = true;
      page.isHolding = isHolding || false;
      page.style.zIndex = noOfPages - index;
      page.style.transformOrigin = "left";
      handleSetPageWidth(page.clientWidth);
      page.addEventListener("mousedown", () => {
        hold(page);
      });
      page.addEventListener("mouseup", () => {
        release(page);
      });
      page.addEventListener("touchstart", () => {
        hold(page);
      });
      page.addEventListener("touchend", () => {
        release(page, index, noOfPages);
      });
    }
  }, [pageRef]);

  return (
    <div className="page" ref={pageRef}>
      {A && (
        <div className="side A">
          <img
            src={A.thumbnail}
            alt={`${A.name}'s thumbnail`}
            // onClick={() => handleSelect(A.track)}
          />
          <span>{A.index + 1}</span>
        </div>
      )}
      {B && (
        <div className="side B">
          <img
            src={B.thumbnail}
            alt={`${B.name}'s thumbnail`}
            // onClick={() => handleSelect(B.track)}
          />
          <span>{B.index + 1}</span>
        </div>
      )}
    </div>
  );
};

export default Page;
